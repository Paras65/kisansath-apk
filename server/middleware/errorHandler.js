// किसान साथी - Centralized Backend Error Handler & Technical Logger
// Single Source of Truth for Express API Error Handling, Technical Stack Logging, and Client Diagnostics.

export class ApiError extends Error {
  constructor(statusCode, message, technicalError = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.technicalError = technicalError || message;
    this.userMessage = message;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Bounded in-memory Ring Buffer for Security & Error Audit Logs (Zero-PII, Rule 8 & Rule 13)
const MAX_AUDIT_LOGS = 150;
const auditLogsBuffer = [];

/**
 * Mask IP address to prevent PII exposure (OWASP / GDPR compliant)
 */
export const maskIp = (ip) => {
  if (!ip) return '127.0.0.1 (Local)';
  const cleanIp = String(ip).trim();
  if (cleanIp === '::1' || cleanIp === '127.0.0.1' || cleanIp.includes('localhost')) {
    return '127.0.0.1 (Local)';
  }
  const parts = cleanIp.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return cleanIp.slice(0, 6) + '***';
};

/**
 * Extract platform/device signature without fingerprinting
 */
export const extractPlatformSignature = (userAgent = '') => {
  const ua = String(userAgent);
  if (/in\.co\.init65\.kisan|TWA/i.test(ua)) return 'Android TWA (नेटिव ऐप)';
  if (/Android/i.test(ua)) return 'Android ब्राउज़र';
  if (/iPhone|iPad/i.test(ua)) return 'iOS Safari';
  if (/Windows/i.test(ua)) return 'Windows डेस्कटॉप';
  if (/Mac/i.test(ua)) return 'Mac डेस्कटॉप';
  if (/Linux/i.test(ua)) return 'Linux सिस्टम';
  return 'वेब क्लाइंट';
};

/**
 * Sanitize error message to prevent secret/PII leaks in server and client logs (Rule 8, 10 & 13)
 */
export const sanitizeLogMessage = (msg, maxLen = 2000) => {
  if (!msg) return '';
  return String(msg)
    // Redact MongoDB connection URI and database credentials
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"'`]+/gi, 'mongodb+srv://[REDACTED_DB_CREDENTIALS]')
    // Redact JWT Bearer tokens
    .replace(/(Bearer\s+)[A-Za-z0-9\-_.]+/gi, '$1[MASKED_TOKEN]')
    .replace(/\beyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, '[MASKED_JWT]')
    // Redact Google / Gemini API keys
    .replace(/AQ\.[A-Za-z0-9_\-\.]{20,}/g, '[REDACTED_API_KEY]')
    .replace(/AIza[A-Za-z0-9_\-]{30,}/g, '[REDACTED_API_KEY]')
    // Redact URL query parameter secrets (?key=..., &passkey=..., etc.)
    .replace(/([?&](?:key|apiKey|api_key|token|secret|passkey|pin|password)=)[^&\s"'`]+/gi, '$1[REDACTED]')
    // Redact passwords, passkeys, admin secrets and PINs
    .replace(/((?:password|passkey|adminSecret|jwtSecret|ADMIN_SECRET|JWT_SECRET)["':\s=]+)[^"'\s,}]+/gi, '$1[MASKED]')
    .replace(/(pin["':\s]+)\d+/gi, '$1[MASKED]')
    // Mask Indian phone numbers (keep first 2 and last 2 digits)
    .replace(/(\b[6-9]\d{9}\b)/g, (phone) => `${phone.slice(0, 2)}******${phone.slice(-2)}`)
    .slice(0, maxLen);
};

/**
 * Deep-sanitize object parameters / query / headers to prevent secret leaks
 */
export const sanitizeLogObject = (obj, maxLen = 2000) => {
  if (!obj || typeof obj !== 'object') return obj;
  try {
    const serialized = JSON.stringify(obj);
    return JSON.parse(sanitizeLogMessage(serialized, maxLen));
  } catch {
    return '[Sanitized Object]';
  }
};

/**
 * Record a secure, bounded Audit Log entry with full technical console details
 */
export const recordAuditLog = ({
  type = 'error',
  severity = 'medium',
  endpoint = 'unknown',
  method = 'GET',
  statusCode = 500,
  message = 'तकनीकी समस्या',
  technicalError = null,
  technicalDetails = null,
  req = null,
}) => {
  const rawIp = req?.headers?.['x-forwarded-for']?.split(',')[0] || req?.ip || req?.socket?.remoteAddress;
  const userAgent = req?.headers?.['user-agent'] || '';

  const entry = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    type: ['error', 'security', 'auth', 'system'].includes(type) ? type : 'error',
    severity: ['high', 'medium', 'low'].includes(severity) ? severity : statusCode >= 500 ? 'high' : 'medium',
    endpoint: endpoint || req?.originalUrl || req?.url || 'unknown',
    method: method || req?.method || 'GET',
    statusCode: Number(statusCode) || 500,
    message: sanitizeLogMessage(message, 500),
    technicalError: sanitizeLogMessage(technicalError || message, 1000),
    technicalDetails: technicalDetails
      ? {
          errorName: sanitizeLogMessage(technicalDetails.errorName || 'Error', 200),
          errorMessage: sanitizeLogMessage(technicalDetails.errorMessage || '', 1000),
          stack: sanitizeLogMessage(technicalDetails.stack || '', 3000),
          params: sanitizeLogObject(technicalDetails.params || {}),
          query: sanitizeLogObject(technicalDetails.query || {}),
          url: sanitizeLogMessage(technicalDetails.url || req?.originalUrl || req?.url || '', 500),
          method: technicalDetails.method || method || 'GET',
          timestamp: technicalDetails.timestamp || new Date().toISOString(),
        }
      : null,
    ipMasked: maskIp(rawIp),
    platform: extractPlatformSignature(userAgent),
  };

  auditLogsBuffer.unshift(entry);
  if (auditLogsBuffer.length > MAX_AUDIT_LOGS) {
    auditLogsBuffer.pop();
  }

  return entry;
};

/**
 * Record a Security/Auth specific event (e.g. rate limit, invalid admin passkey, IDOR block)
 */
export const recordSecurityAudit = (req, {
  type = 'security',
  severity = 'medium',
  statusCode = 401,
  message = 'सुरक्षा चेतावनी',
  technicalError = null,
}) => {
  return recordAuditLog({
    type,
    severity,
    endpoint: req?.originalUrl || req?.url || 'auth',
    method: req?.method || 'POST',
    statusCode,
    message,
    technicalError,
    req,
  });
};

/**
 * Retrieve Audit Logs with optional filtering
 */
export const getAuditLogs = ({ severity = 'all', type = 'all', search = '', limit = 50 } = {}) => {
  let filtered = [...auditLogsBuffer];

  if (severity && severity !== 'all') {
    filtered = filtered.filter((log) => log.severity === severity);
  }

  if (type && type !== 'all') {
    filtered = filtered.filter((log) => log.type === type);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (log) =>
        log.endpoint?.toLowerCase().includes(q) ||
        log.message?.toLowerCase().includes(q) ||
        log.technicalError?.toLowerCase().includes(q) ||
        log.technicalDetails?.errorName?.toLowerCase().includes(q) ||
        log.technicalDetails?.stack?.toLowerCase().includes(q) ||
        log.technicalDetails?.url?.toLowerCase().includes(q) ||
        String(log.statusCode).includes(q) ||
        log.platform?.toLowerCase().includes(q)
    );
  }

  const maxLimit = Math.min(Math.max(1, parseInt(limit, 10) || 50), MAX_AUDIT_LOGS);
  return filtered.slice(0, maxLimit);
};

/**
 * Aggregate summary statistics for the audit log dashboard
 */
export const getAuditStats = () => {
  const total = auditLogsBuffer.length;
  let high = 0;
  let medium = 0;
  let low = 0;
  let securityAlerts = 0;
  let serverErrors = 0;

  for (const log of auditLogsBuffer) {
    if (log.severity === 'high') high++;
    else if (log.severity === 'medium') medium++;
    else if (log.severity === 'low') low++;

    if (log.type === 'security' || log.type === 'auth') securityAlerts++;
    if (log.statusCode >= 500) serverErrors++;
  }

  return {
    total,
    high,
    medium,
    low,
    securityAlerts,
    serverErrors,
    lastEventAt: auditLogsBuffer[0]?.timestamp || null,
  };
};

/**
 * Clear the in-memory audit logs buffer
 */
export const clearAuditLogs = () => {
  auditLogsBuffer.length = 0;
  return true;
};

/**
 * Standardized Technical API Error Logger Helper
 * Logs structured route, method, params, query, error name, message and full stack trace.
 * Synchronously registers in the audit log buffer.
 */
export const logApiError = (endpoint, req, err) => {
  const status = err?.statusCode || 500;
  const rawUrl = req?.originalUrl || req?.url || 'N/A';
  const cleanUrl = sanitizeLogMessage(rawUrl, 500);
  const cleanEndpoint = sanitizeLogMessage(endpoint || rawUrl, 200);

  const details = {
    endpoint: cleanEndpoint,
    method: req?.method || 'N/A',
    url: cleanUrl,
    params: sanitizeLogObject(req?.params || {}),
    query: sanitizeLogObject(req?.query || {}),
    errorName: err?.name || 'Error',
    errorMessage: sanitizeLogMessage(err?.message || String(err), 1000),
    stack: sanitizeLogMessage(err?.stack || 'No stack trace available', 3000),
    timestamp: new Date().toISOString(),
  };

  console.error(`🚨 [TECHNICAL API ERROR: ${details.endpoint}] [${details.method} ${details.url}]:`, details);

  // Synchronously store in secure audit ring buffer WITH full technical console details
  recordAuditLog({
    type: status >= 500 ? 'error' : 'warning',
    severity: status >= 500 ? 'high' : 'medium',
    endpoint: details.endpoint,
    method: details.method,
    statusCode: status,
    message: sanitizeLogMessage(err?.userMessage || err?.message || 'सर्वर तकनीकी त्रुटि', 500),
    technicalError: `${details.errorName}: ${details.errorMessage}`,
    technicalDetails: details,
    req,
  });

  return details;
};

/**
 * Centralized Route Catch Responder
 * Sends standard JSON response with HTTP status, user-friendly error, and technicalError diagnostic.
 */
export const handleApiError = (
  res,
  req,
  endpoint,
  err,
  statusCode = 500,
  fallbackUserMessage = 'सर्वर में तकनीकी समस्या आई।'
) => {
  logApiError(endpoint, req, err);

  const status = err?.statusCode || statusCode;
  const userMsg = err?.userMessage || (typeof err === 'string' ? err : null) || fallbackUserMessage;
  const techMsg = err?.technicalError || err?.message || String(err);

  return res.status(status).json({
    success: false,
    error: userMsg,
    technicalError: techMsg,
    path: req?.originalUrl || req?.url,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Express Centralized Error Handling Middleware (Single Source of Truth)
 * Catches all unhandled exceptions or next(err) in the middleware chain.
 */
export const centralizedErrorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err?.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  logApiError(req?.originalUrl || req?.url, req, err);

  res.status(statusCode).json({
    success: false,
    error: err?.userMessage || (statusCode === 500 ? 'सर्वर में तकनीकी समस्या आई (Internal Server Error)।' : err?.message),
    technicalError: err?.technicalError || err?.message || 'Unknown Server Error',
    path: req?.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Standard 404 Unmatched Route Handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async Route Handler Wrapper
 * Automatically forwards any uncaught Promise rejections to the centralized error handler.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

