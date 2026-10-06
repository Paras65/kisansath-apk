// किसान साथी - Multi-Farmer Isolated Farmer Service
// Handles authentication, multi-tenant plot synchronization, and zero-PII purge on logout.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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

// 1. Get current logged-in farmer session
export const getActiveFarmer = () => {
  try {
    const data = localStorage.getItem(ACTIVE_FARMER_KEY);
    return data ? JSON.parse(data) : null;
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
      const err = await res.json();
      return { success: false, error: err.error || 'लॉगिन विफल रहा।' };
    }
  } catch (err) {
    console.warn('[Farmer Auth Offline]', err.message);
  }

  // Offline Fallback for Farmers in Field
  const cachedPlots = localStorage.getItem(`kisan_farmer_plots_${cleanPhone}`);
  const fallbackFarmer = {
    phone: cleanPhone,
    name: name || 'किसान साथी (ऑफ़लाइन)',
    pin: pin || '1234',
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
    }
  } catch (err) {
    console.warn('[Get Plots Offline]', err.message);
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
    }
  } catch (err) {
    console.warn('[Save Plot Offline]', err.message);
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
    }
  } catch (err) {
    console.warn('[Delete Plot Offline]', err.message);
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
    await fetch(`${API_BASE_URL}/farmer/tasks/${cleanPhone}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ plotId, taskId }),
    });
  } catch (err) {
    console.warn('[Toggle Task Offline]', err.message);
  }

  return updated;
};
