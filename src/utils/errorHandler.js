// किसान साथी - Centralized Client API Error Handler & Debugger
// Single Source of Truth for Browser DevTools Diagnostics, Structured Logging & Offline Fallbacks (Rule 12)

/**
 * Safely parses response error payload from fetch response
 * Prevents JSON parse crashes when backend returns HTML, plain text, or empty body.
 */
export const parseErrorPayload = async (res) => {
  if (!res) return { error: 'Unknown Network Error', technicalError: null };
  try {
    const contentType = res.headers?.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await res.json();
      return {
        error: json?.error || json?.message || `HTTP ${res.status} Error`,
        technicalError: json?.technicalError || null,
        raw: json,
      };
    }
    const text = await res.text();
    return {
      error: `HTTP ${res.status}: ${res.statusText || 'Request Failed'}`,
      technicalError: text || null,
      raw: text,
    };
  } catch (parseErr) {
    return {
      error: `HTTP ${res.status}: ${res.statusText || 'Request Failed'}`,
      technicalError: parseErr?.message || 'Failed to parse error response',
      raw: null,
    };
  }
};

/**
 * Sanitize client-side error details to prevent confidential data or secret leaks in DevTools console (Rule 10 & 13)
 */
export const sanitizeClientDetails = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  try {
    const serialized = JSON.stringify(obj, (key, value) => {
      const lowerKey = String(key).toLowerCase();
      if (['pin', 'passkey', 'password', 'token', 'authorization', 'secret'].includes(lowerKey)) {
        return '[MASKED]';
      }
      if (typeof value === 'string') {
        return value
          .replace(/(Bearer\s+)[A-Za-z0-9\-_.]+/gi, '$1[MASKED_TOKEN]')
          .replace(/AQ\.[A-Za-z0-9_\-\.]{20,}/g, '[REDACTED_API_KEY]')
          .replace(/AIza[A-Za-z0-9_\-]{30,}/g, '[REDACTED_API_KEY]')
          .replace(/mongodb(?:\+srv)?:\/\/[^\s"'`]+/gi, 'mongodb+srv://[REDACTED_DB_CREDENTIALS]');
      }
      return value;
    });
    return JSON.parse(serialized);
  } catch {
    return obj;
  }
};

/**
 * Standardized Client API Error Logger (for HTTP 4xx / 5xx responses)
 */
export const logClientApiError = (endpoint, res, errorData = {}, context = {}) => {
  const method = context.method || 'GET';
  const status = res?.status || 'ERR';
  const statusText = res?.statusText || '';

  const details = {
    method,
    endpoint,
    status,
    statusText,
    error: errorData?.error || errorData?.message || 'Server error',
    technicalError: errorData?.technicalError || null,
    timestamp: new Date().toISOString(),
    ...context,
    raw: errorData?.raw !== undefined ? errorData.raw : errorData,
  };

  console.error(`🚨 [Kisan API Client Error] ${method} ${endpoint} [HTTP ${status}]:`, sanitizeClientDetails(details));
  return details;
};

/**
 * Standardized Client Network / Offline Error Logger (for DNS, CORS, timeout, offline drops)
 */
export const logClientNetworkError = (endpoint, err, context = {}) => {
  const method = context.method || 'GET';
  const details = {
    method,
    endpoint,
    message: err?.message || 'Network request failed',
    name: err?.name || 'NetworkError',
    stack: err?.stack || 'No stack available',
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    timestamp: new Date().toISOString(),
    ...context,
  };

  console.error(`🚨 [Kisan API Network/Offline Error] ${method} ${endpoint}:`, sanitizeClientDetails(details));
  return details;
};

/**
 * Helper to build standard offline / fallback error payload
 */
export const createOfflineFallback = (userMessage, technicalError = 'Network connection failed') => ({
  success: false,
  isOffline: true,
  error: userMessage || 'इंटरनेट कनेक्शन उपलब्ध नहीं है।',
  technicalError,
  timestamp: new Date().toISOString(),
});

