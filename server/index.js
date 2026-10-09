import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import connectDB from './config/db.js';
import apiRoutes from './routes/api.js';
import { centralizedErrorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openApiPath = path.resolve(__dirname, '../docs/openapi.yaml');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware: Payload bounding with support for camera photos (10mb)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security Headers (OWASP & Industry Best Practices)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), geolocation=(self), microphone=()');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

// Technical API Request & Error Debugger Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) {
      console.error(`🚨 [TECHNICAL API ERROR ${res.statusCode}] ${req.method} ${req.originalUrl} (${duration}ms)`);
    } else {
      console.log(`📡 [API ${res.statusCode}] ${req.method} ${req.originalUrl} (${duration}ms)`);
    }
  });
  next();
});

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  process.env.VITE_APP_HOST,
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps, native TWA, cURL or same-origin (origin is undefined)
      if (!origin) return callback(null, true);

      // Match allowed list, prefix, init65 domain, or Cloudflare Pages domains (*.pages.dev)
      const isAllowed =
        allowedOrigins.includes(origin) ||
        allowedOrigins.some((o) => origin.startsWith(o)) ||
        origin.endsWith('.pages.dev') ||
        origin.includes('init65.co.in') ||
        origin.includes('localhost') ||
        process.env.NODE_ENV !== 'production';

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false); // Strict enterprise policy: Block unapproved browser origins
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Database Connection
connectDB();

// API Routes - Mounted under both /api and root / for seamless compatibility
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Health check endpoints (Render and monitoring friendly)
const getHealthStatus = () => ({
  status: 'healthy',
  service: 'Kisan Saathi Agricultural API',
  uptimeSeconds: Math.round(process.uptime()),
  timestamp: new Date().toISOString(),
});

app.get('/health', (req, res) => res.json(getHealthStatus()));
app.get('/api/health', (req, res) => res.json(getHealthStatus()));

// Serve OpenAPI YAML Specification directly
const serveOpenApiSpec = (req, res) => {
  if (fs.existsSync(openApiPath)) {
    res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
    fs.createReadStream(openApiPath).pipe(res);
  } else {
    res.status(404).json({ success: false, error: 'OpenAPI specification file not found' });
  }
};

app.get('/openapi.yaml', serveOpenApiSpec);
app.get('/api/openapi.yaml', serveOpenApiSpec);

// Root service welcome
app.get('/', (req, res) => {
  res.json({
    service: 'Kisan Saathi Agricultural Backend API',
    status: 'online',
    health: '/health',
    endpoints: '/api',
    openapi: '/api/openapi.yaml',
  });
});

// 404 Handler for all unmatched routes
app.use(notFoundHandler);

// Centralized Error Handler with Technical Diagnostics
app.use(centralizedErrorHandler);

app.listen(PORT, () => {
  console.log(`[Kisan Saathi Server] running securely on http://localhost:${PORT}`);
});

export default app;
