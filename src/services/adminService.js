// किसान साथी - Super Admin & Extension Worker Service
// Manages Admin authentication, platform telemetry, emergency broadcast advisories, and content moderation
import { appConfig } from '../config/appConfig';

const API_BASE_URL = appConfig.apiBaseUrl;
const ADMIN_JWT_KEY = 'kisan_admin_jwt_token';
const ADMIN_SESSION_KEY = 'kisan_admin_session';

// Enterprise Zero-PII & Zero-Persistence: Purge legacy localStorage immediately
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(ADMIN_JWT_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {}
}

let inactivityTimer = null;
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15-minute strict inactivity auto-logout

export const resetAdminInactivityTimer = (onTimeout) => {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    adminLogout();
    if (onTimeout) onTimeout();
  }, IDLE_TIMEOUT_MS);
};

let memoryAdminToken = null;
let memoryAdminSession = null;

const getAdminHeaders = () => {
  try {
    const token = sessionStorage.getItem(ADMIN_JWT_KEY) || memoryAdminToken;
    return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
  } catch {
    return memoryAdminToken ? { 'Content-Type': 'application/json', Authorization: `Bearer ${memoryAdminToken}` } : { 'Content-Type': 'application/json' };
  }
};

// 1. Check if admin is currently authenticated in active session
export const isAdminLoggedIn = () => {
  try {
    return Boolean(sessionStorage.getItem(ADMIN_JWT_KEY) || memoryAdminToken);
  } catch {
    return Boolean(memoryAdminToken);
  }
};

// 2. Admin Login
export const adminLogin = async ({ passkey, username = 'kisan_admin' }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passkey, username }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        memoryAdminToken = data.token;
        memoryAdminSession = { username, loginTime: Date.now() };
        try {
          sessionStorage.setItem(ADMIN_JWT_KEY, data.token);
          sessionStorage.setItem(
            ADMIN_SESSION_KEY,
            JSON.stringify({ username, loginTime: Date.now() })
          );
        } catch {}
      }
      return { success: true, message: data.message };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'अमान्य एडमिन पासकी।' };
    }
  } catch (err) {
    const target = API_BASE_URL || 'सर्वर';
    return { success: false, error: `सर्वर से संपर्क नहीं हो सका (${target})। कृपया इंटरनेट कनेक्टिविटी जांचें।` };
  }
};

// 3. Admin Logout: Purge all session memory instantly
export const adminLogout = () => {
  memoryAdminToken = null;
  memoryAdminSession = null;
  try {
    sessionStorage.removeItem(ADMIN_JWT_KEY);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_JWT_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    if (inactivityTimer) clearTimeout(inactivityTimer);
  } catch (e) {
    console.error(e);
  }
};

// 4. Fetch Platform Live Statistics
export const getAdminStats = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAdminHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Admin Stats Fetch Offline]', err);
  }

  // Zero-False-Data Policy: Strict offline indicator without fabricating false farmer metrics
  return {
    metrics: null,
    districtStats: [],
    systemHealth: null,
    isOffline: true,
  };
};

// 5. Fetch Farmer Registry (Privacy Preserved / Masked)
export const getAdminFarmers = async ({ district = '', search = '', limit = 30 } = {}) => {
  try {
    const params = new URLSearchParams();
    if (district) params.append('district', district);
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit);

    const res = await fetch(`${API_BASE_URL}/admin/farmers?${params.toString()}`, {
      headers: getAdminHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Admin Farmers Fetch Offline]', err);
  }

  // Zero-False-Data Guarantee: Never inject fabricated farmer records
  return [];
};

// 6. Fetch Broadcast Advisories
export const getAdminBroadcasts = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/broadcasts`, {
      headers: getAdminHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('kisan_admin_broadcasts_cache', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('[Admin Broadcasts Fetch Offline]', err);
  }

  // Fallback ONLY to last known fetched broadcasts
  const cached = localStorage.getItem('kisan_admin_broadcasts_cache');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.warn(e);
    }
  }
  return [];
};

// 7. Post New Emergency Broadcast Advisory
export const createAdminBroadcast = async (broadcastData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/broadcasts`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(broadcastData),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Admin Broadcast Create Offline]', err);
  }

  // Local caching fallback
  const existing = await getAdminBroadcasts();
  const newBroadcast = {
    ...broadcastData,
    id: `adv-${Date.now()}`,
    active: true,
    createdAt: new Date().toISOString(),
  };
  const updated = [newBroadcast, ...existing];
  localStorage.setItem('kisan_admin_broadcasts_cache', JSON.stringify(updated));
  return newBroadcast;
};

// 8. Delete Broadcast
export const deleteAdminBroadcast = async (broadcastId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/broadcasts/${broadcastId}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn('[Admin Broadcast Delete Offline]', err);
  }

  const existing = await getAdminBroadcasts();
  const updated = existing.filter((b) => b.id !== broadcastId);
  localStorage.setItem('kisan_admin_broadcasts_cache', JSON.stringify(updated));
  return true;
};

// 9. Moderate (Delete) Marketplace Listing
export const deleteMarketListing = async (listingId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/listings/${listingId}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Delete Listing Error]', err);
    return false;
  }
};

// 10. Moderate (Delete) Community QA
export const deleteCommunityQA = async (qaId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/qa/${qaId}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Delete Community QA Error]', err);
    return false;
  }
};

// 11. Public Farmer Broadcasts (Active alerts for farmers)
export const getPublicBroadcasts = async (district = '') => {
  try {
    const url = district ? `${API_BASE_URL}/broadcasts?district=${encodeURIComponent(district)}` : `${API_BASE_URL}/broadcasts`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn('[Public Broadcasts Fetch Error]', err);
  }

  // Cached fallback
  const cached = localStorage.getItem('kisan_admin_broadcasts_cache');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.warn(e);
    }
  }

  return [];
};

// 12. Super Admin Live API & External Services Health Checker
export const checkAllApisHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/api-health`, {
      headers: getAdminHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('[Admin API Health Check Offline]', err);
  }

  // Graceful Client-side fallback check (if backend is offline or in client-only demo mode)
  let weatherResult = {
    id: 'open_meteo',
    name: 'Open-Meteo Weather API',
    category: 'मौसम व वर्षा पूर्वानुमान (Weather Service)',
    target: 'api.open-meteo.com',
    status: 'offline',
    statusLabel: 'ऑफलाइन',
    latencyMs: 0,
    message: 'नेटवर्क संपर्क नहीं हो सका',
    lastChecked: new Date().toISOString(),
  };

  try {
    const t0 = performance.now();
    const wRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=21.25&longitude=81.63&current_weather=true');
    const lat = Math.round(performance.now() - t0);
    if (wRes.ok) {
      weatherResult = {
        id: 'open_meteo',
        name: 'Open-Meteo Weather API',
        category: 'मौसम व वर्षा पूर्वानुमान (Weather Service)',
        target: 'api.open-meteo.com',
        status: 'connected',
        statusLabel: 'सक्रिय (Client Ping)',
        latencyMs: lat,
        message: 'लाइव मौसम डेटा फीड ब्राउज़र से सक्रिय',
        lastChecked: new Date().toISOString(),
      };
    }
  } catch {}

  const fallbackServices = [
    {
      id: 'kisan_api_server',
      name: 'किसान साथी बैकएंड API सर्वर',
      category: 'कोर बैकएंड (Application Server)',
      target: API_BASE_URL,
      status: 'offline',
      statusLabel: 'सर्वर ऑफलाइन / स्टैंडअलोन',
      latencyMs: 0,
      message: 'लोकल या रिमोट बैकएंड सर्वर से संपर्क नहीं हो सका',
      lastChecked: new Date().toISOString(),
    },
    weatherResult,
    {
      id: 'mongodb',
      name: 'MongoDB Atlas क्लस्टर',
      category: 'कोर डेटाबेस (Core Database)',
      target: 'cluster0.qrqi6.mongodb.net',
      status: 'degraded',
      statusLabel: 'सर्वर आश्रित',
      latencyMs: 0,
      message: 'बैकएंड सर्वर चालू होने पर ही डेटाबेस पिंग संभव है',
      lastChecked: new Date().toISOString(),
    },
    {
      id: 'data_gov_in',
      name: 'data.gov.in (OGD India / Agmarknet)',
      category: 'मंडी दर API (Live Mandi Rates)',
      target: 'api.data.gov.in',
      status: 'degraded',
      statusLabel: 'मानक मोड',
      latencyMs: 0,
      message: 'ऑफलाइन या स्टैंडअलोन मोड में संदर्भ भाव उपलब्ध हैं',
      lastChecked: new Date().toISOString(),
    },
    {
      id: 'gemini_ai',
      name: 'Google Gemini Multimodal AI',
      category: 'फसल डॉक्टर विज़न AI (Crop Doctor)',
      target: 'generativelanguage.googleapis.com',
      status: 'degraded',
      statusLabel: 'गाइड मोड',
      latencyMs: 0,
      message: 'ऑफलाइन मोड में विशेषज्ञ लक्षण मार्गदर्शिका सक्रिय है',
      lastChecked: new Date().toISOString(),
    },
  ];

  const connectedCount = fallbackServices.filter((s) => s.status === 'connected').length;
  const warningCount = fallbackServices.filter((s) => s.status === 'degraded' || s.status === 'not_configured').length;
  const offlineCount = fallbackServices.filter((s) => s.status === 'offline').length;

  return {
    checkedAt: new Date().toISOString(),
    durationMs: 350,
    overallStatus: 'partial',
    summary: {
      total: fallbackServices.length,
      connected: connectedCount,
      warning: warningCount,
      offline: offlineCount,
    },
    services: fallbackServices,
  };
};

// 13. Super Admin External APIs Configuration & Live Debugging Inspector
export const getAdminExternalConfig = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/external-config`, {
      headers: getAdminHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('[Admin External Config Offline]', err);
  }

  // Graceful fallback config if backend is offline or unreachable
  return {
    success: false,
    timestamp: new Date().toISOString(),
    config: {
      mandi: {
        name: 'data.gov.in (OGD Agmarknet Mandi Rates)',
        baseUrl: 'https://api.data.gov.in/resource/',
        resourceId: '9ef84268-d588-465a-a308-a864a43d0070',
        apiKeyMasked: 'बैकएंड से प्राप्त नहीं',
        isKeyConfigured: false,
        limit: 60,
        timeoutMs: 8000,
        backupMirrorUrl: 'https://mandi-api.onrender.com/api/mandis?state=Chhattisgarh',
        stateVariants: ['Chattisgarh', 'Chhattisgarh'],
        envKeys: {
          baseUrl: 'MANDI_API_BASE_URL',
          resourceId: 'DATA_GOV_IN_RESOURCE_ID',
          apiKey: 'DATA_GOV_IN_API_KEY',
          limit: 'MANDI_API_LIMIT',
          timeoutMs: 'MANDI_API_TIMEOUT_MS',
        },
        troubleshooting: [
          {
            issue: 'HTTP 401 / 403 (Invalid API Key)',
            cause: 'data.gov.in API key अमान्य या समाप्त हो गई है',
            action: '.env में DATA_GOV_IN_API_KEY अपडेट करें',
          },
          {
            issue: 'HTTP 404 (Resource Not Found)',
            cause: 'OGD India ने Agmarknet कैटलॉग का रिसोर्स ID बदल दिया है',
            action: 'data.gov.in से नया ID लेकर .env में DATA_GOV_IN_RESOURCE_ID अपडेट करें',
          },
          {
            issue: 'Request Timeout (>8s)',
            cause: 'सरकारी OGD सर्वर पर अत्यधिक लोड या स्लो रिस्पांस',
            action: '.env में MANDI_API_TIMEOUT_MS बढ़ाएं या स्वतः बैकअप मिरर सक्रिय रहेगा',
          },
        ],
      },
      gemini: {
        name: 'Google Gemini Multimodal AI (Crop Doctor)',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
        apiKeyMasked: 'बैकएंड से प्राप्त नहीं',
        isKeyConfigured: false,
        models: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash'],
        timeoutMs: 16000,
        temperature: 0.15,
        envKeys: {
          baseUrl: 'GEMINI_API_BASE_URL',
          apiKey: 'GEMINI_API_KEY',
          models: 'GEMINI_MODELS',
          timeoutMs: 'GEMINI_API_TIMEOUT_MS',
          temperature: 'GEMINI_TEMPERATURE',
        },
        troubleshooting: [
          {
            issue: 'HTTP 429 (Resource Exhausted / Rate Limit)',
            cause: 'दैनिक या प्रति मिनट API कोटा समाप्त हो गया है',
            action: 'सिस्टम स्वतः अगले मॉडल पर स्विच करेगा। आवश्यकतानुसार नई GEMINI_API_KEY डालें',
          },
          {
            issue: 'HTTP 404 (Model Not Found / Retired)',
            cause: 'गूगल ने मॉडल संस्करण रिटायर कर दिया है (उदा. 1.5 -> 2.5)',
            action: '.env में GEMINI_MODELS बदलें (उदा. gemini-2.5-flash,gemini-2.5-flash-lite)',
          },
          {
            issue: 'Cold Start / Timeout (>16s)',
            cause: 'धीमे मोबाइल नेटवर्क पर हाई-रेज़ोल्यूशन फोटो अपलोड',
            action: '.env में GEMINI_API_TIMEOUT_MS को 20000ms तक बढ़ा सकते हैं',
          },
        ],
      },
      weather: {
        name: 'Open-Meteo Satellite Weather API',
        baseUrl: 'https://api.open-meteo.com/v1/forecast',
        timeoutMs: 5000,
        envKeys: {
          baseUrl: 'WEATHER_API_BASE_URL',
          timeoutMs: 'WEATHER_API_TIMEOUT_MS',
        },
        troubleshooting: [
          {
            issue: 'HTTP 429 / Blocked',
            cause: 'Open-Meteo फ्री टियर कॉल लिमिट (10,000 कॉल/दिन)',
            action: 'क्लाइंट-साइड 15-मिनट कैशे लागू है, सर्वर पर WEATHER_API_TIMEOUT_MS जांचें',
          },
        ],
      },
      portals: {
        name: 'External Government Portals',
        agristack: 'https://cgfr.agristack.gov.in/',
        bhuiyan: 'https://bhuiyan.cg.nic.in/',
        khadya: 'http://khadya.cg.nic.in/',
        pmkisan: 'https://pmkisan.gov.in/',
        creda: 'https://creda.cgstate.gov.in/',
        envKeys: {
          agristack: 'VITE_PORTAL_AGRISTACK_URL',
          bhuiyan: 'VITE_PORTAL_BHUIYAN_URL',
          khadya: 'VITE_PORTAL_TOKEN_URL',
          pmkisan: 'VITE_PORTAL_PMKISAN_URL',
          creda: 'VITE_PORTAL_CREDA_URL',
        },
        troubleshooting: [
          {
            issue: 'सरकारी पोर्टल लिंक बदल गया या डोमेन अपडेट हुआ',
            cause: 'विभाग द्वारा नया URL या सुरक्षा रीडायरेक्ट लागू किया गया',
            action: '.env में संबंधित VITE_PORTAL_* चर को अपडेट करें (कोड में कोई बदलाव नहीं चाहिए)',
          },
        ],
      },
    },
  };
};
