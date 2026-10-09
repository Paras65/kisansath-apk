// किसान साथी - Multi-Farmer Isolated Farmer Service
// Handles authentication, multi-tenant plot synchronization, and zero-PII purge on logout.
import { appConfig } from '../config/appConfig';
import { parseErrorPayload, logClientApiError, logClientNetworkError } from '../utils/errorHandler';

const API_BASE_URL = appConfig.apiBaseUrl;

const ACTIVE_FARMER_KEY = 'kisan_active_farmer';
const JWT_TOKEN_KEY = 'kisan_auth_jwt_token';

// Helper: Get JWT authorization header
export const getAuthHeaders = () => {
  try {
    const token = localStorage.getItem(JWT_TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

// 1. Get current logged-in farmer session (Zero-PII sanitized)
export const getActiveFarmer = () => {
  try {
    const data = localStorage.getItem(ACTIVE_FARMER_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (parsed && parsed.pin) {
      delete parsed.pin;
      try {
        localStorage.setItem(ACTIVE_FARMER_KEY, JSON.stringify(parsed));
      } catch {}
    }
    return parsed;
  } catch {
    return null;
  }
};

// 2. Farmer Login / Quick Auth
export const loginFarmer = async ({ phone, name, pin, village, district, totalLandAcres }) => {
  const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '').slice(-10);

  // Try Online Network
  try {
    const res = await fetch(`${API_BASE_URL}/farmer/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: cleanPhone,
        name,
        pin: pin || '1234',
        village,
        district: district || 'रायपुर',
        totalLandAcres: parseFloat(totalLandAcres) || 0,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const farmer = data.farmer || data;
      if (farmer && farmer.pin) {
        delete farmer.pin;
      }
      if (data.token) {
        localStorage.setItem(JWT_TOKEN_KEY, data.token);
      }
      localStorage.setItem(ACTIVE_FARMER_KEY, JSON.stringify(farmer));
      localStorage.setItem(`kisan_farmer_plots_${cleanPhone}`, JSON.stringify(farmer.plots || []));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kisan_farmer_session_changed', { detail: farmer }));
      }
      return { success: true, farmer };
    } else {
      const errPayload = await parseErrorPayload(res);
      logClientApiError('/farmer/auth', res, errPayload, { method: 'POST' });
      return { success: false, error: errPayload.error || 'लॉगिन विफल रहा।' };
    }
  } catch (err) {
    logClientNetworkError('/farmer/auth', err, { method: 'POST' });
  }

  // Offline Fallback for Farmers in Field (Zero-PII: PIN is never saved in client storage)
  const cachedPlots = localStorage.getItem(`kisan_farmer_plots_${cleanPhone}`);
  const fallbackFarmer = {
    phone: cleanPhone,
    name: name || 'किसान साथी (ऑफ़लाइन)',
    village: village || '',
    district: district || 'रायपुर',
    totalLandAcres: parseFloat(totalLandAcres) || 0,
    plots: cachedPlots ? JSON.parse(cachedPlots) : [],
    isOffline: true,
  };

  localStorage.setItem(ACTIVE_FARMER_KEY, JSON.stringify(fallbackFarmer));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kisan_farmer_session_changed', { detail: fallbackFarmer }));
  }
  return { success: true, farmer: fallbackFarmer };
};

// 3. Logout Farmer & Actively Purge Active Session Memory (Rule 13)
export const logoutFarmer = () => {
  try {
    localStorage.removeItem(ACTIVE_FARMER_KEY);
    localStorage.removeItem(JWT_TOKEN_KEY);
    sessionStorage.removeItem(ACTIVE_FARMER_KEY);
    sessionStorage.removeItem(JWT_TOKEN_KEY);
    // Purge any cached plots keys
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('kisan_farmer_plots_')) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.warn(e);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kisan_farmer_session_changed', { detail: null }));
  }
};

// 4. Fetch Farmer Plots with Offline Cache Fallback
export const getFarmerPlots = async (phone) => {
  const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '').slice(-10);
  const cacheKey = `kisan_farmer_plots_${cleanPhone}`;

  try {
    const res = await fetch(`${API_BASE_URL}/farmer/profile/${cleanPhone}`, {
      headers: { ...getAuthHeaders() },
    });
    if (res.ok) {
      const profile = await res.json();
      const plots = profile.plots || [];
      localStorage.setItem(cacheKey, JSON.stringify(plots));
      return plots;
    } else {
      const errPayload = await parseErrorPayload(res);
      logClientApiError(`/farmer/profile/${cleanPhone}`, res, errPayload, { method: 'GET' });
    }
  } catch (err) {
    logClientNetworkError(`/farmer/profile/${cleanPhone}`, err, { method: 'GET' });
  }

  // Offline fallback
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }
  return [];
};

// 5. Save or Update Plot (Online + Offline Sync)
export const saveFarmerPlot = async (phone, plotData) => {
  const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '').slice(-10);
  const cacheKey = `kisan_farmer_plots_${cleanPhone}`;

  // Read current cached plots
  let currentPlots = [];
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) currentPlots = JSON.parse(cached);
  } catch {}

  let updatedPlots = [...currentPlots];
  if (plotData.plotId) {
    updatedPlots = updatedPlots.map((p) => (p.plotId === plotData.plotId ? { ...p, ...plotData } : p));
  } else {
    const newPlot = {
      ...plotData,
      plotId: `plot-${Date.now()}`,
      status: 'active',
      completedTasks: [],
    };
    updatedPlots.unshift(newPlot);
  }

  // Update local cache immediately (instant optimistic UI)
  localStorage.setItem(cacheKey, JSON.stringify(updatedPlots));

  // Sync with MongoDB backend
  try {
    const res = await fetch(`${API_BASE_URL}/farmer/plots/${cleanPhone}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(plotData),
    });
    if (res.ok) {
      const serverPlots = await res.json();
      localStorage.setItem(cacheKey, JSON.stringify(serverPlots));
      return serverPlots;
    } else {
      const errPayload = await parseErrorPayload(res);
      logClientApiError(`/farmer/plots/${cleanPhone}`, res, errPayload, { method: 'POST' });
    }
  } catch (err) {
    logClientNetworkError(`/farmer/plots/${cleanPhone}`, err, { method: 'POST' });
  }

  return updatedPlots;
};

// 6. Delete Plot
export const deleteFarmerPlot = async (phone, plotId) => {
  const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '').slice(-10);
  const cacheKey = `kisan_farmer_plots_${cleanPhone}`;

  let currentPlots = [];
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) currentPlots = JSON.parse(cached);
  } catch {}

  const filtered = currentPlots.filter((p) => p.plotId !== plotId);
  localStorage.setItem(cacheKey, JSON.stringify(filtered));

  try {
    const res = await fetch(`${API_BASE_URL}/farmer/plots/${cleanPhone}/${plotId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    if (res.ok) {
      const serverPlots = await res.json();
      localStorage.setItem(cacheKey, JSON.stringify(serverPlots));
      return serverPlots;
    } else {
      const errPayload = await parseErrorPayload(res);
      logClientApiError(`/farmer/plots/${cleanPhone}/${plotId}`, res, errPayload, { method: 'DELETE' });
    }
  } catch (err) {
    logClientNetworkError(`/farmer/plots/${cleanPhone}/${plotId}`, err, { method: 'DELETE' });
  }

  return filtered;
};

// 7. Toggle Task for Plot
export const togglePlotTask = async (phone, plotId, taskId) => {
  const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '').slice(-10);
  const cacheKey = `kisan_farmer_plots_${cleanPhone}`;

  let currentPlots = [];
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) currentPlots = JSON.parse(cached);
  } catch {}

  const updated = currentPlots.map((plot) => {
    if (plot.plotId === plotId) {
      const tasks = plot.completedTasks || [];
      const has = tasks.includes(taskId);
      return {
        ...plot,
        completedTasks: has ? tasks.filter((t) => t !== taskId) : [...tasks, taskId],
      };
    }
    return plot;
  });

  localStorage.setItem(cacheKey, JSON.stringify(updated));

  try {
    const res = await fetch(`${API_BASE_URL}/farmer/tasks/${cleanPhone}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ plotId, taskId }),
    });
    if (!res.ok) {
      const errPayload = await parseErrorPayload(res);
      logClientApiError(`/farmer/tasks/${cleanPhone}`, res, errPayload, { method: 'POST' });
    }
  } catch (err) {
    logClientNetworkError(`/farmer/tasks/${cleanPhone}`, err, { method: 'POST' });
  }

  return updated;
};

// 8. Farm Diary Cloud Sync Functions
export const getFarmerDiary = async (phone) => {
  const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '').slice(-10);
  const cacheKey = cleanPhone ? `kisan_farm_diary_${cleanPhone}` : 'kisan_farm_diary';

  // Network First
  if (cleanPhone) {
    try {
      const res = await fetch(`${API_BASE_URL}/farmer/diary/${cleanPhone}`, {
        headers: { ...getAuthHeaders() },
      });
      if (res.ok) {
        const diary = await res.json();
        localStorage.setItem(cacheKey, JSON.stringify(diary));
        localStorage.setItem('kisan_farm_diary', JSON.stringify(diary));
        return { data: diary, isCloudSynced: true };
      } else {
        const errPayload = await parseErrorPayload(res);
        logClientApiError(`/farmer/diary/${cleanPhone}`, res, errPayload, { method: 'GET' });
      }
    } catch (err) {
      logClientNetworkError(`/farmer/diary/${cleanPhone}`, err, { method: 'GET' });
    }
  }

  // Offline Local Cache
  try {
    const raw = localStorage.getItem(cacheKey) || localStorage.getItem('kisan_farm_diary');
    if (raw) {
      return { data: JSON.parse(raw), isCloudSynced: false };
    }
  } catch {}

  return { data: [], isCloudSynced: false };
};

export const saveFarmerDiaryEntry = async (phone, entry) => {
  const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '').slice(-10);
  const cacheKey = cleanPhone ? `kisan_farm_diary_${cleanPhone}` : 'kisan_farm_diary';

  // Optimistic local update
  let localEntries = [];
  try {
    const raw = localStorage.getItem(cacheKey) || localStorage.getItem('kisan_farm_diary');
    if (raw) localEntries = JSON.parse(raw);
  } catch {}

  const updatedLocally = [entry, ...localEntries.filter((e) => e.id !== entry.id)];
  localStorage.setItem(cacheKey, JSON.stringify(updatedLocally));
  localStorage.setItem('kisan_farm_diary', JSON.stringify(updatedLocally));

  if (cleanPhone) {
    try {
      const res = await fetch(`${API_BASE_URL}/farmer/diary/${cleanPhone}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(entry),
      });
      if (res.ok) {
        const serverDiary = await res.json();
        localStorage.setItem(cacheKey, JSON.stringify(serverDiary));
        localStorage.setItem('kisan_farm_diary', JSON.stringify(serverDiary));
        return { data: serverDiary, isCloudSynced: true };
      } else {
        const errPayload = await parseErrorPayload(res);
        logClientApiError(`/farmer/diary/${cleanPhone}`, res, errPayload, { method: 'POST' });
      }
    } catch (err) {
      logClientNetworkError(`/farmer/diary/${cleanPhone}`, err, { method: 'POST' });
    }
  }

  return { data: updatedLocally, isCloudSynced: false };
};

export const deleteFarmerDiaryEntry = async (phone, entryId) => {
  const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '').slice(-10);
  const cacheKey = cleanPhone ? `kisan_farm_diary_${cleanPhone}` : 'kisan_farm_diary';

  let localEntries = [];
  try {
    const raw = localStorage.getItem(cacheKey) || localStorage.getItem('kisan_farm_diary');
    if (raw) localEntries = JSON.parse(raw);
  } catch {}

  const filtered = localEntries.filter((e) => e.id !== entryId);
  localStorage.setItem(cacheKey, JSON.stringify(filtered));
  localStorage.setItem('kisan_farm_diary', JSON.stringify(filtered));

  if (cleanPhone) {
    try {
      const res = await fetch(`${API_BASE_URL}/farmer/diary/${cleanPhone}/${entryId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      if (res.ok) {
        const serverDiary = await res.json();
        localStorage.setItem(cacheKey, JSON.stringify(serverDiary));
        localStorage.setItem('kisan_farm_diary', JSON.stringify(serverDiary));
        return { data: serverDiary, isCloudSynced: true };
      } else {
        const errPayload = await parseErrorPayload(res);
        logClientApiError(`/farmer/diary/${cleanPhone}/${entryId}`, res, errPayload, { method: 'DELETE' });
      }
    } catch (err) {
      logClientNetworkError(`/farmer/diary/${cleanPhone}/${entryId}`, err, { method: 'DELETE' });
    }
  }

  return { data: filtered, isCloudSynced: false };
};
