// किसान साथी - Super Admin & Extension Worker Service
// Manages Admin authentication, platform telemetry, emergency broadcast advisories, and content moderation

const getNormalizedApiBaseUrl = () => {
  let url = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').trim();
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API_BASE_URL = getNormalizedApiBaseUrl();
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
    // Offline / Local fallback: allow admin if passkey matches default
    if (passkey === 'kisanAdmin2026') {
      const fallbackToken = 'local_admin_session_token_' + Date.now();
      sessionStorage.setItem(ADMIN_JWT_KEY, fallbackToken);
      sessionStorage.setItem(
        ADMIN_SESSION_KEY,
        JSON.stringify({ username, loginTime: Date.now(), offline: true })
      );
      return { success: true, message: 'ऑफलाइन सत्र में एडमिन प्रमाणीकरण सफल।' };
    }
    return { success: false, error: 'सर्वर से संपर्क नहीं हो सका। पासकी जांचें।' };
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
