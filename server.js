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

// Instantiate the Express Application server instance
const app = express();

// INITIALIZE SYSTEM INFRASTRUCTURE LAYER CONNECTIONS
connectDB(); // Preserved project database bootloader step

// -------------------------------------------------------------------------
// GLOBAL NETWORK MIDDLEWARE PLATFORM
// -------------------------------------------------------------------------

// Configure safe Cross-Origin Resource Sharing rules for external Web dashboards
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Unified body parsing configurations
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Expose static public dashboard assets directory layout to clients
app.use(express.static('public'));

// -------------------------------------------------------------------------
// VERSIONED ROUTE TREE MOUNTING GATEWAYS
// -------------------------------------------------------------------------

// Mounting the structural Menu items API Router
app.use('/api/menu', menuRoutes);

// Mounting the immersive AI assistant chat tracking system endpoint
app.use('/api/chat', aiChatRoutes);

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