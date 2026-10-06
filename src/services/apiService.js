import { FERTILIZER_DOSES, SCHEMES, CROPS, MANDI_RATES, MACHINERY_RENTALS, CROP_DISEASES } from '../data/kisanData';
import { appConfig } from '../config/appConfig';

const API_BASE_URL = appConfig.apiBaseUrl;

// Helper for caching and network requests
const fetchWithCache = async (endpoint, cacheKey, fallbackDefault = []) => {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(`kisan_cache_${cacheKey}`, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn(`[API Offline Fallback] Could not fetch ${endpoint}, using cached data:`, err.message);
  }

  // Fallback to cached version in localStorage
  const cached = localStorage.getItem(`kisan_cache_${cacheKey}`);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // ignore
    }
  }
  return fallbackDefault;
};

// 1. Crops
export const getCrops = async () => {
  return await fetchWithCache('/crops', 'crops', CROPS);
};

// 2. Fertilizers
export const getFertilizers = async () => {
  return await fetchWithCache('/fertilizers', 'fertilizers', FERTILIZER_DOSES);
};

// 3. Diseases
export const getDiseases = async (cropId = '') => {
  const query = cropId && cropId !== 'all' ? `?cropId=${cropId}` : '';
  return await fetchWithCache(`/diseases${query}`, `diseases_${cropId || 'all'}`);
};

// 4. Mandi Rates
export const getMandiRates = async () => {
  return await fetchWithCache('/mandi-rates', 'mandi_rates', MANDI_RATES);
};

// 5. Schemes
export const getSchemes = async () => {
  return await fetchWithCache('/schemes', 'schemes', SCHEMES);
};

// 6. Machinery Rentals
export const getMachinery = async () => {
  return await fetchWithCache('/machinery', 'machinery', MACHINERY_RENTALS);
};

// 7. Community Q&A
export const getCommunityQA = async () => {
  return await fetchWithCache('/community-qa', 'community_qa');
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

// 8. Direct Marketplace
export const getMarketplaceListings = async () => {
  return await fetchWithCache('/marketplace', 'marketplace');
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
