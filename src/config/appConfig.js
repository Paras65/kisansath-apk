// किसान साथी - Centralized Configuration Service
// Reads exclusively from Environment Variables (import.meta.env) with robust fallbacks.
// Allows complete zero-code-change migration across states, portal updates, or API shifts.

const env = import.meta.env || {};

export const appConfig = {
  // 1. Branding & Geography
  appName: env.VITE_APP_NAME || 'किसान साथी',
  appTagline: env.VITE_APP_TAGLINE || 'फसल से लेकर बिक्री तक सम्पूर्ण समाधान',
  appVersion: env.VITE_APP_VERSION || '1.0.15',
  defaultLang: env.VITE_DEFAULT_LANG || 'hi',
  stateName: env.VITE_STATE_NAME || 'छत्तीसगढ़',
  defaultDistrict: env.VITE_DEFAULT_DISTRICT || 'रायपुर',

  // 2. Mobile & App Downloads
  apkDownloadUrl:
    env.VITE_APK_DOWNLOAD_URL ||
    'https://github.com/Paras65/kisansath-apk/releases/latest/download/kisan-saathi.apk',
  webPortalUrl:
    env.VITE_WEB_PORTAL_URL ||
    env.VITE_APP_HOST ||
    'https://kisan.init65.co.in',
  twaPackageId: env.VITE_TWA_PACKAGE_ID || 'in.co.init65.kisan',

  // 2. Helpline & Contacts
  helpline: {
    phone: env.VITE_HELPLINE_PHONE || '18001801551',
    label: env.VITE_HELPLINE_LABEL || '1800-180-1551',
    kisanCallCenter: env.VITE_KISAN_CALL_CENTER || '1800-180-1551',
    foodDeptHelpline: env.VITE_FOOD_DEPT_HELPLINE || '1800-233-3663',
  },

  // 3. Government External Portals
  portals: {
    agristackUrl: env.VITE_PORTAL_AGRISTACK_URL || 'https://cgfr.agristack.gov.in/',
    tokenUrl: env.VITE_PORTAL_TOKEN_URL || 'http://khadya.cg.nic.in/',
    bhuiyanUrl: env.VITE_PORTAL_BHUIYAN_URL || 'https://bhuiyan.cg.nic.in/',
    credaUrl: env.VITE_PORTAL_CREDA_URL || 'https://creda.cgstate.gov.in/',
    pmKisanUrl: env.VITE_PORTAL_PMKISAN_URL || 'https://pmkisan.gov.in/',
    pmfbyUrl: env.VITE_PORTAL_PMFBY_URL || 'https://pmfby.gov.in/',
  },

  // 4. Procurement & Scheme Rates
  paddyScheme: {
    totalRate: Number(env.VITE_PADDY_TOTAL_RATE) || 3100,
    mspRate: Number(env.VITE_PADDY_MSP_RATE) || 2300,
    bonusRate: Number(env.VITE_PADDY_BONUS_RATE) || 800,
    maxQuintalsPerAcre: Number(env.VITE_PADDY_MAX_QUINTALS_PER_ACRE) || 21,
    diversificationSubsidy: Number(env.VITE_DIVERSIFICATION_SUBSIDY) || 15000,
  },

  // 5. Host & API Endpoints
  host: env.VITE_APP_HOST || 'https://kisan.init65.co.in',
  apiBaseUrl: (() => {
    let rawUrl = (env.VITE_API_BASE_URL || '').trim();

    // Check if running inside mobile APK (Capacitor) or on an origin that cannot resolve relative APIs
    const isCapacitorOrLocal =
      typeof window !== 'undefined' &&
      (window.location.protocol === 'capacitor:' ||
        window.location.protocol === 'file:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        Boolean(window.Capacitor?.isNativePlatform?.()));

    // If no URL is provided, or a relative URL (/api) is used inside native Android APK:
    if (!rawUrl || (rawUrl.startsWith('/') && isCapacitorOrLocal) || rawUrl === '/api') {
      return 'https://kisan-saathi-api-4sdo.onrender.com/api';
    }

    let url = rawUrl.replace(/\/+$/, '');
    if (!url.endsWith('/api') && !url.includes('/api/')) {
      url = `${url}/api`;
    }
    return url;
  })(),
  apis: {
    weatherUrl: env.VITE_WEATHER_API_URL || '',
    mandiUrl: env.VITE_MANDI_API_URL || '',
    aiVisionUrl: env.VITE_AI_VISION_API_URL || '',
  },
};

export default appConfig;
