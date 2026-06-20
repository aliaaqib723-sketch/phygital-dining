/**
 * @file server.js
 * @description Central Application Bootloader and Production Assembly Engine for Phygital Dining.
 * Fully compliant with strict Express v5 execution rules and native token guardrails.
 */

// CRITICAL STEP 1: Synchronously evaluate environmental configuration parameters before anything else loads
import ENVIRONMENT from './config/environment.js';

import express from 'express';
import cors from 'cors';

// IMPORT ARCHITECTURAL PLUGINS & CUSTOM SERVICES
import connectDB from './config/db.js';
import menuRoutes from './routes/menuRoutes.js';
import aiChatRoutes from './routes/aiChatRoutes.js'; // Preserved system chat module
import adminRoutes from './routes/adminRoutes.js'; // Admin dashboard routes
import rateLimit from 'express-rate-limit';

// Instantiate the Express Application server instance
const app = express();

// INITIALIZE SYSTEM INFRASTRUCTURE LAYER CONNECTIONS
connectDB(); // Preserved project database bootloader step

// -------------------------------------------------------------------------
// RATE LIMITING MIDDLEWARE - PREVENTS ABUSE & PROTECTS DATABASE
// -------------------------------------------------------------------------
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // max 20 requests per minute per IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
});

// -------------------------------------------------------------------------
// GLOBAL NETWORK MIDDLEWARE PLATFORM
// -------------------------------------------------------------------------

// Configure safe Cross-Origin Resource Sharing rules for external Web dashboards
// Production: Restrict to your domain only
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5000';
app.use(cors({
  origin: corsOrigin, 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Unified body parsing configurations
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Expose static public dashboard assets directory layout to clients
app.use(express.static('public'));

// -------------------------------------------------------------------------
// VERSIONED ROUTE TREE MOUNTING GATEWAYS
// -------------------------------------------------------------------------

// Apply rate limiting to chat endpoint to protect database
app.use('/api/chat', chatLimiter);

// Mounting the structural Menu items API Router
app.use('/api/menu', generalLimiter, menuRoutes);

// Mounting the immersive AI assistant chat tracking system endpoint
app.use('/api/chat', aiChatRoutes);

// Mount admin dashboard routes (protected by JWT)
app.use('/api/admin', adminRoutes);

// Root Diagnostic Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: "online",
    message: "Welcome to the Phygital Dining Backend Architecture Suite!",
    timestamp: new Date()
  });
});

// -------------------------------------------------------------------------
// EXPRESS 5 COMPLIANT UNMAPPED ROUTE CAPTURE LAYER
// -------------------------------------------------------------------------
// By using a pathless app.use middleware function instead of string path arguments 
// like '*' or '(.*)', we completely bypass path-to-regexp string compilation.
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: `Resource Routing Error: Target destination [${req.originalUrl}] does not exist.`
    });
  }
  next();
});

// Centralized Express Error Interception Gateway Middleware
app.use((err, req, res, next) => {
  console.error('🚨 [CENTRAL SYSTEM FAULT]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Fatal Internal Server Exception: Operations safely aborted by runtime engine.'
  });
});

// -------------------------------------------------------------------------
// NETWORK SOCKET BOOTSTRAP INITIALIZATION
// -------------------------------------------------------------------------
const PORT = ENVIRONMENT.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` 🚀 PHY-DIGITAL DINING CORE APPS ONLINE & VERIFIED`);
  console.log(` 📡 ROUTE CHANNELS ACTIVE: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});

export default app; // Facilitates standalone testing metrics without duplicate port binding issues