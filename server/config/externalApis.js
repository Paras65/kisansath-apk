// किसान साथी - Centralized External APIs Configuration
// Zero-Hardcoding Architecture (Rule 15): All external URLs, parameters, model cascades,
// timeouts, and keys are read dynamically from environment variables with bulletproof defaults.

import dotenv from 'dotenv';
dotenv.config();

export const externalApisConfig = {
  // 1. data.gov.in / OGD Platform India (Agmarknet Mandi Rates)
  mandi: {
    baseUrl: (process.env.MANDI_API_BASE_URL || 'https://api.data.gov.in/resource/').trim(),
    resourceId: (process.env.DATA_GOV_IN_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070').trim(),
    apiKey: (
      process.env.DATA_GOV_IN_API_KEY ||
      process.env.OGD_API_KEY ||
      process.env.VITE_DATA_GOV_IN_API_KEY ||
      ''
    ).trim(),
    limit: parseInt(process.env.MANDI_API_LIMIT, 10) || 60,
    timeoutMs: parseInt(process.env.MANDI_API_TIMEOUT_MS, 10) || 8000,
    backupMirrorUrl: (process.env.MANDI_BACKUP_MIRROR_URL || 'https://mandi-api.onrender.com/api/mandis?state=Chhattisgarh').trim(),
    stateVariants: (process.env.MANDI_STATE_VARIANTS || 'Chattisgarh,Chhattisgarh')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },

  // 1b. data.gov.in / OGD Platform India (CIB&RC Registered Pesticides)
  cibrc: {
    baseUrl: (process.env.MANDI_API_BASE_URL || 'https://api.data.gov.in/resource/').trim(),
    resourceId: (process.env.DATA_GOV_IN_CIBRC_RESOURCE_ID || '').trim(),
    apiKey: (
      process.env.DATA_GOV_IN_API_KEY ||
      process.env.OGD_API_KEY ||
      process.env.VITE_DATA_GOV_IN_API_KEY ||
      ''
    ).trim(),
    timeoutMs: parseInt(process.env.OGD_API_TIMEOUT_MS, 10) || 8000,
  },

  // 1c. data.gov.in / OGD Platform India (District Soil Health Card Survey)
  soilHealth: {
    baseUrl: (process.env.MANDI_API_BASE_URL || 'https://api.data.gov.in/resource/').trim(),
    resourceId: (process.env.DATA_GOV_IN_SOIL_RESOURCE_ID || '').trim(),
    apiKey: (
      process.env.DATA_GOV_IN_API_KEY ||
      process.env.OGD_API_KEY ||
      process.env.VITE_DATA_GOV_IN_API_KEY ||
      ''
    ).trim(),
    timeoutMs: parseInt(process.env.OGD_API_TIMEOUT_MS, 10) || 8000,
  },

  // 1d. data.gov.in / CACP Official MSP Benchmarks
  msp: {
    baseUrl: (process.env.MANDI_API_BASE_URL || 'https://api.data.gov.in/resource/').trim(),
    resourceId: (process.env.DATA_GOV_IN_MSP_RESOURCE_ID || '').trim(),
    apiKey: (
      process.env.DATA_GOV_IN_API_KEY ||
      process.env.OGD_API_KEY ||
      process.env.VITE_DATA_GOV_IN_API_KEY ||
      ''
    ).trim(),
    timeoutMs: parseInt(process.env.OGD_API_TIMEOUT_MS, 10) || 8000,
  },

  // 2. Google Gemini Multimodal Vision AI (AI Crop Doctor)
  gemini: {
    baseUrl: (process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/models').trim().replace(/\/+$/, ''),
    apiKey: (
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.VITE_AI_VISION_API_URL ||
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_KEY ||
      ''
    ).trim(),
    models: (process.env.GEMINI_MODELS || 'gemini-3.8-flash,gemini-3.5-flash,gemini-3.5-flash-lite')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean),
    timeoutMs: parseInt(process.env.GEMINI_API_TIMEOUT_MS, 10) || 16000,
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.15,
  },

  // 3. Open-Meteo Satellite Weather API
  weather: {
    baseUrl: (process.env.WEATHER_API_BASE_URL || 'https://api.open-meteo.com/v1/forecast').trim(),
    timeoutMs: parseInt(process.env.WEATHER_API_TIMEOUT_MS, 10) || 5000,
  },

  // 4. External Government Agricultural Portals
  portals: {
    agristack: (process.env.VITE_PORTAL_AGRISTACK_URL || 'https://cgfr.agristack.gov.in/').trim(),
    bhuiyan: (process.env.VITE_PORTAL_BHUIYAN_URL || 'https://bhuiyan.cg.nic.in/').trim(),
    khadya: (process.env.VITE_PORTAL_TOKEN_URL || 'http://khadya.cg.nic.in/').trim(),
    pmkisan: (process.env.VITE_PORTAL_PMKISAN_URL || 'https://pmkisan.gov.in/').trim(),
    creda: (process.env.VITE_PORTAL_CREDA_URL || 'https://creda.cgstate.gov.in/').trim(),
  },
};

export default externalApisConfig;
