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

  console.error(`🚨 [Kisan API Client Error] ${method} ${endpoint} [HTTP ${status}]:`, details);
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

  console.error(`🚨 [Kisan API Network/Offline Error] ${method} ${endpoint}:`, details);
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

