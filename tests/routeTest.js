/**
 * @file tests/routeTest.js
 * @description Isolated Router Diagnostic Script for Task 7.
 * Prevents Mongoose compilation crashes by stubbing the model registry before import.
 */

import mongoose from 'mongoose';

// CRITICAL FIX: Stub out the model registry to prevent empty-connection compile crashes
if (!mongoose.models.MenuItem) {
  mongoose.models.MenuItem = mongoose.model('MenuItem', new mongoose.Schema({}));
}
if (!mongoose.models.InteractionLog) {
  mongoose.models.InteractionLog = mongoose.model('InteractionLog', new mongoose.Schema({}));
}

// Now it is completely safe to import the router without crashing!
import router from '../routes/menuRoutes.js';

function runRoutingMatrixValidationSuite() {
  console.log('\n=============================================================');
  console.log('🛣️  [ROUTING MATRIX TEST]: VERIFYING PATH & PROTECTION SEEDS');
  console.log('=============================================================');

  try {
    const routeStack = router.stack;
    
    // 1. Verify global protection middleware is active on the routing stack
    const globalProtectActive = routeStack.some(layer => layer.name === 'protect');
    
    if (globalProtectActive) {
      console.log('✅ PASS: Test Case 1 - Global security guardrail token interception active across all paths.');
    } else {
      console.error('❌ FAIL: Test Case 1 - Security leakage! Endpoints are exposed without an authentication shield.');
    }

    // 2. Extract and inspect registered path patterns
    const registeredPaths = routeStack
      .filter(layer => layer.route)
      .map(layer => layer.route.path);

    const analyticsPathConfigured = registeredPaths.includes('/analytics');
    const rootPathConfigured = registeredPaths.includes('/');

    if (analyticsPathConfigured && rootPathConfigured) {
      console.log('✅ PASS: Test Case 2 - Path endpoints mapped successfully into the router ecosystem.');
    } else {
      console.error('❌ FAIL: Test Case 2 - Required functional routing path definitions are missing.');
    }

    // 3. Confirm target method handlers are mapped correctly
    const rootLayer = routeStack.find(layer => layer.route && layer.route.path === '/');
    const supportsGetAndPost = rootLayer.route.methods.get && rootLayer.route.methods.post;

    if (supportsGetAndPost) {
      console.log('✅ PASS: Test Case 3 - Operational methods (GET/POST) assigned correctly to the data matrix endpoints.');
    } else {
      console.error('❌ FAIL: Test Case 3 - HTTP verb handling matrix parameters are misconfigured.');
    }

    console.log('\n=============================================================');
    console.log('🎉 TASK 7 COMPLETION EVALUATION COMPLETE');
    console.log('=============================================================\n');

  } catch (error) {
    console.error('❌ FAIL: Structural exceptions encountered in router verification suite ->', error.message);
  }
}

runRoutingMatrixValidationSuite();