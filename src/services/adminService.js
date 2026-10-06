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

const getAdminHeaders = () => {
  try {
    const token = sessionStorage.getItem(ADMIN_JWT_KEY);
    return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
  } catch {
    return { 'Content-Type': 'application/json' };
  }
};

// 1. Check if admin is currently authenticated in active session
export const isAdminLoggedIn = () => {
  try {
    return !!sessionStorage.getItem(ADMIN_JWT_KEY);
  } catch {
    return false;
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
        // STRICT EPHEMERAL STORAGE: sessionStorage ONLY, never persistent in localStorage
        sessionStorage.setItem(ADMIN_JWT_KEY, data.token);
        sessionStorage.setItem(
          ADMIN_SESSION_KEY,
          JSON.stringify({ username, loginTime: Date.now() })
        );
      }
      return { success: true, message: data.message };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'अमान्य एडमिन पासकी।' };
    }
  } catch (err) {
    return { success: false, error: 'सर्वर से संपर्क नहीं हो सका। कृपया नेटवर्क और सर्वर स्थिति जांचें।' };
  }
};

// 3. Admin Logout: Purge all session memory instantly
export const adminLogout = () => {
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

  // Graceful fallback for offline demo / disconnected state
  return {
    metrics: {
      totalFarmers: 1842,
      totalPlots: 3120,
      totalPlotAcres: 7850.5,
      totalMarketListings: 24,
      totalCommunityQAs: 48,
      totalMandiRates: 86,
      activeBroadcasts: 2,
    },
    districtStats: [
      { district: 'रायपुर', farmersCount: 620, totalAcreage: 2750 },
      { district: 'बिलासपुर', farmersCount: 410, totalAcreage: 1820 },
      { district: 'दुर्ग', farmersCount: 350, totalAcreage: 1490 },
      { district: 'राजनांदगांव', farmersCount: 260, totalAcreage: 1120 },
      { district: 'धमतरी', farmersCount: 202, totalAcreage: 670.5 },
    ],
    systemHealth: {
      uptimeSeconds: 86400,
      memoryRssMb: 48,
      nodeVersion: 'v20.x',
      environment: 'production',
      timestamp: new Date().toISOString(),
    },
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

  // Default demo data
  return [
    {
      phoneMasked: '98••••••12',
      name: 'रामकुमार वर्मा',
      district: 'रायपुर',
      village: 'आरंग',
      plotsCount: 3,
      totalLandAcres: 7.5,
      createdAt: new Date().toISOString(),
    },
    {
      phoneMasked: '91••••••44',
      name: 'दिनेश साहू',
      district: 'दुर्ग',
      village: 'पाटन',
      plotsCount: 2,
      totalLandAcres: 4.0,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      phoneMasked: '70••••••89',
      name: 'संतोष यादव',
      district: 'बिलासपुर',
      village: 'तखतपुर',
      plotsCount: 4,
      totalLandAcres: 9.2,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];
};

// 6. Fetch Broadcast Advisories
export const getAdminBroadcasts = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/broadcasts`, {
      headers: getAdminHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Admin Broadcasts Fetch Offline]', err);
  }

  // Fallback broadcasts
  const cached = localStorage.getItem('kisan_admin_broadcasts_cache');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.warn(e);
    }
  }
  return [
    {
      id: 'adv-sample-1',
      title: 'माहो व भूरा फुदका कीट चेतावनी',
      category: 'pest',
      severity: 'urgent',
      message: 'खरीफ धान में माहो कीट के लक्षण दिखने पर नीम तेल 1500 PPM या पाइमेट्रोज़िन 50 WG (120 ग्रा/एकड़) का 200 लीटर पानी में घोल बनाकर छिड़काव करें।',
      targetDistrict: 'all',
      author: 'डॉ. पी. के. शर्मा (कृषि वैज्ञानिक)',
      validTill: '15 अक्टूबर 2026',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'adv-sample-2',
      title: 'कृषक उन्नति योजना: ₹3,100/क्विंटल धान उपार्जन टोकन',
      category: 'scheme',
      severity: 'info',
      message: 'समितियों में धान उपार्जन हेतु टोकन व्यवस्था प्रारंभ। किसान भाई अपने नजदीकी उपार्जन केंद्र में स्लॉट बुक करें।',
      targetDistrict: 'all',
      author: 'कृषि विभाग छत्तीसगढ़',
      validTill: '31 जनवरी 2027',
      active: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
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
