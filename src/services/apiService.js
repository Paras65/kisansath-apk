import { appConfig } from '../config/appConfig';

const API_BASE_URL = appConfig.apiBaseUrl;

/**
 * Reads previously fetched data from localStorage cache (Zero Static Mock Fallback)
 */
export const getCachedModuleData = (cacheKey) => {
  try {
    const raw = localStorage.getItem(`kisan_cache_${cacheKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed) return null;
    const data = parsed.data !== undefined ? parsed.data : parsed;
    const lastFetchedAt = parsed.lastFetchedAt || null;
    return { data, lastFetchedAt, isCached: true };
  } catch (e) {
    return null;
  }
};

/**
 * Generic module fetcher: Network first -> Last-fetched Cache -> Strictly NULL if no data present
 * Zero-False-Data Guarantee: Under no circumstances injects static/dummy mock arrays.
 */
export const fetchModuleWithCache = async (endpoint, cacheKey) => {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    if (res.ok) {
      const data = await res.json();
      if (data !== null && data !== undefined) {
        const payload = {
          data,
          lastFetchedAt: new Date().toISOString()
        };
        localStorage.setItem(`kisan_cache_${cacheKey}`, JSON.stringify(payload));
        if (data && typeof data === 'object') {
          data._isLive = true;
          data._isCached = false;
          data._lastFetchedAt = payload.lastFetchedAt;
          data._hasData = Array.isArray(data) ? data.length > 0 : Boolean(data);
        }
        return data;
      }
    }
  } catch (err) {
    console.warn(`[Module Offline Fetch] ${endpoint}:`, err.message);
  }

  // Fallback ONLY to last fetched data from localStorage
  const cached = getCachedModuleData(cacheKey);
  if (cached && cached.data !== null && cached.data !== undefined) {
    const data = cached.data;
    if (data && typeof data === 'object') {
      data._isLive = false;
      data._isCached = true;
      data._lastFetchedAt = cached.lastFetchedAt;
      data._hasData = Array.isArray(data) ? data.length > 0 : Boolean(data);
    }
    return data;
  }

  // Strictly ZERO static mock fallback!
  return null;
};

// 1. Crops
export const getCrops = async () => {
  return await fetchModuleWithCache('/crops', 'crops');
};

// 2. Fertilizers
export const getFertilizers = async () => {
  return await fetchModuleWithCache('/fertilizers', 'fertilizers');
};

// 3. Diseases
export const getDiseases = async (cropId = '') => {
  const query = cropId && cropId !== 'all' ? `?cropId=${cropId}` : '';
  return await fetchModuleWithCache(`/diseases${query}`, `diseases_${cropId || 'all'}`);
};

// 4. Mandi Rates (Zero-Key Live Agmarknet Engine with Zero-False-Data Policy)
export const getMandiRates = async (options = {}) => {
  const force = options?.force === true;
  const district = options?.district || '';
  const query = [];
  if (force) query.push('force=true');
  if (district) query.push(`district=${encodeURIComponent(district)}`);
  const endpoint = `/mandi-rates${query.length > 0 ? `?${query.join('&')}` : ''}`;

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        const rates = Array.isArray(data) ? data : (data.rates || []);
        const payload = {
          rates,
          isLive: data.isLive ?? true,
          source: data.source || 'Agmarknet / छत्तीसगढ़ मंडी बोर्ड (लाइव)',
          lastFetchedAt: data.lastUpdated || new Date().toISOString()
        };
        localStorage.setItem('kisan_cache_mandi_payload', JSON.stringify(payload));
        return {
          rates,
          isLive: payload.isLive,
          isOfflineCached: false,
          source: payload.source,
          lastUpdated: payload.lastFetchedAt,
          hasData: rates.length > 0
        };
      }
    }
  } catch (err) {
    console.warn('[Mandi API Offline Fallback]', err.message);
  }

  // Fallback ONLY to previously fetched data in localStorage
  const rawCached = localStorage.getItem('kisan_cache_mandi_payload');
  if (rawCached) {
    try {
      const parsed = JSON.parse(rawCached);
      const rates = Array.isArray(parsed) ? parsed : (parsed.rates || []);
      if (rates.length > 0) {
        return {
          rates,
          isLive: false,
          isOfflineCached: true,
          source: parsed.source || 'Agmarknet (पिछली बार प्राप्त डेटा)',
          lastUpdated: parsed.lastFetchedAt || parsed.lastUpdated || null,
          hasData: true
        };
      }
    } catch (e) {
      // ignore
    }
  }

  // Strictly ZERO static mock fallback! If no data present, return empty list with hasData: false
  return {
    success: true,
    isLive: false,
    isOfflineCached: false,
    source: 'कोई मंडी डेटा उपलब्ध नहीं',
    lastUpdated: null,
    rates: [],
    hasData: false
  };
};

export const refreshLiveMandiRates = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/mandi-rates/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('kisan_cache_mandi_payload', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('[Mandi Refresh Offline]', err.message);
  }
  return null;
};

// 4c. Offline Mandi Queries Management (Zero-False-Data Policy)
// Saves user inquiries locally when offline and synchronizes once reconnected.
const OFFLINE_QUERIES_KEY = 'kisan_offline_mandi_queries';

export const getOfflineMandiQueries = () => {
  try {
    const raw = localStorage.getItem(OFFLINE_QUERIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveOfflineMandiQuery = ({ crop, mandi, district }) => {
  const list = getOfflineMandiQueries();
  const newEntry = {
    id: `mandi-query-${Date.now()}`,
    crop: crop || 'धान',
    mandi: mandi || 'सभी प्रमुख मंडियां',
    district: district || 'रायपुर',
    createdAt: new Date().toISOString(),
    status: 'pending', // 'pending' | 'resolved'
    resolvedRate: null,
  };
  const updated = [newEntry, ...list.slice(0, 19)]; // Keep max 20 bounded entries
  localStorage.setItem(OFFLINE_QUERIES_KEY, JSON.stringify(updated));
  return newEntry;
};

export const removeOfflineMandiQuery = (id) => {
  const list = getOfflineMandiQueries().filter((q) => q.id !== id);
  localStorage.setItem(OFFLINE_QUERIES_KEY, JSON.stringify(list));
  return list;
};

export const syncOfflineMandiQueries = async () => {
  const list = getOfflineMandiQueries();
  const pending = list.filter((q) => q.status === 'pending');
  if (pending.length === 0) return { syncedCount: 0, resolved: [] };

  const resolved = [];
  const updatedList = [...list];

  for (const query of pending) {
    try {
      const res = await fetch(`${API_BASE_URL}/mandi-rates/offline-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: query.crop,
          mandi: query.mandi,
          district: query.district,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.rateData) {
          const idx = updatedList.findIndex((q) => q.id === query.id);
          if (idx !== -1) {
            updatedList[idx] = {
              ...updatedList[idx],
              status: 'resolved',
              resolvedRate: data.rateData,
              resolvedAt: new Date().toISOString(),
              message: data.message,
            };
            resolved.push(updatedList[idx]);
          }
        }
      }
    } catch (err) {
      // Still offline, retain pending state
      break;
    }
  }

  localStorage.setItem(OFFLINE_QUERIES_KEY, JSON.stringify(updatedList));
  return { syncedCount: resolved.length, resolved };
};

// 5. Schemes
export const getSchemes = async () => {
  return await fetchModuleWithCache('/schemes', 'schemes');
};

// 6. Machinery Rentals
export const getMachinery = async () => {
  return await fetchModuleWithCache('/machinery', 'machinery');
};

export const postMachinery = async (payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/machinery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Machinery Post Offline]', err);
  }
  return null;
};

// 7. Community Q&A
export const getCommunityQA = async () => {
  return await fetchModuleWithCache('/community-qa', 'community_qa');
};

export const postCommunityQuestion = async (payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/community-qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Community QA Post Offline]', err);
  }
  return null;
};

export const postCommunityReply = async (questionId, payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/community-qa/${questionId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Community QA Reply Offline]', err);
  }
  return null;
};

// 8. Direct Marketplace
export const getMarketplaceListings = async () => {
  return await fetchModuleWithCache('/marketplace', 'marketplace');
};

export const postMarketplaceListing = async (payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/marketplace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Marketplace Post Offline]', err);
  }
  return null;
};

// 9. Live Gemini Vision AI Plant Doctor Diagnosis (Zero-False-Data Policy)
export const diagnoseCropWithLiveAi = async ({ imageBase64, cropId = '', district = 'रायपुर' }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/crop-doctor/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64, cropId, district }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || 'AI सर्वर से जांच रिपोर्ट प्राप्त नहीं हो सकी।'
      };
    }
  } catch (err) {
    console.warn('[AI Vision Offline]', err.message);
    return {
      success: false,
      isOffline: true,
      error: 'इंटरनेट कनेक्शन उपलब्ध नहीं है। लाइव AI फोटो जांच के लिए इंटरनेट आवश्यक है। किसानों की सुरक्षा हेतु कोई भी नकली या अनुमानित (False/Dummy) डेटा नहीं दिखाया जाता है।'
    };
  }
};
