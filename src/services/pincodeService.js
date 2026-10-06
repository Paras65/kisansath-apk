// किसान साथी - Centralized Postal Pincode & Village Resolution Service
// Rule 10 & 12 Compliant: Clean Live API Lookup, Cached, Zero-PII, High Resilience

const PINCODE_CACHE_KEY_PREFIX = 'kisan_pincode_cache_';

/**
 * Fetch villages & district data by 6-digit Indian Postal PIN Code via live India Post API.
 * Uses browser LocalStorage caching to avoid repeat API hits.
 *
 * @param {string} pincode - 6 digit numeric pincode
 * @returns {Promise<{success: boolean, district?: string, block?: string, state?: string, villages?: string[], source?: string, error?: string}>}
 */
export const fetchVillagesByPincode = async (pincode) => {
  const cleanPin = (pincode || '').toString().trim().replace(/\D/g, '').slice(0, 6);

  if (!cleanPin || cleanPin.length !== 6) {
    return { success: false, error: 'कृपया 6 अंकों का सही पिन कोड दर्ज करें।' };
  }

  // 1. Check LocalStorage Cache
  try {
    const cached = localStorage.getItem(`${PINCODE_CACHE_KEY_PREFIX}${cleanPin}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.villages) && parsed.villages.length > 0) {
        return { success: true, ...parsed, source: 'cache' };
      }
    }
  } catch (e) {
    // Quiet cache read error
  }

  // 2. Fetch Live India Post Public API (CORS Enabled)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0] && data[0].Status === 'Success' && Array.isArray(data[0].PostOffice)) {
        const postOffices = data[0].PostOffice;
        const district = postOffices[0].District || '';
        const block = postOffices[0].Block || '';
        const state = postOffices[0].State || '';

        // Extract unique, sorted village / post office names
        const rawNames = postOffices.map((po) => po.Name).filter(Boolean);
        const villages = Array.from(new Set(rawNames)).sort();

        if (villages.length > 0) {
          const result = {
            district,
            block,
            state,
            villages,
            source: 'live_api'
          };

          // Cache in local storage for instant future access
          try {
            localStorage.setItem(`${PINCODE_CACHE_KEY_PREFIX}${cleanPin}`, JSON.stringify(result));
          } catch {}

          return { success: true, ...result };
        }
      }
    }
  } catch (err) {
    console.warn('[Pincode API Error/Timeout]', err.message);
  }

  return {
    success: false,
    error: 'पिन कोड का विवरण नहीं मिला। कृपया गांव का नाम स्वयं दर्ज करें।'
  };
};
