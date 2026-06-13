/**
 * @file tests/logTest.js
 * @description Operational Integrity Script validating interaction log fields.
 * Validates tracking types, duration boundaries, and index mappings for Task 5.
 */

import mongoose from 'mongoose';
import InteractionLog from '../models/InteractionLog.js';

function runAnalyticsModelValidationSuite() {
  console.log('\n=============================================================');
  console.log('📊 [ANALYTICS LOG TEST]: EVALUATING METRIC INGESTION SHAPE');
  console.log('=============================================================');

  // ---------------------------------------------------------
  // TEST CASE 1: Catch Invalid View Mode Targets (FR5.2)
  // ---------------------------------------------------------
  try {
    const invalidLog = new InteractionLog({
      itemId: "dish_005",
      interactionType: "ar_render_toggle",
      viewMode: "Hologram_VR", // Broken unsupported mode parameter
      dwellTimeSeconds: 15,
      sessionId: "session_user_abc123"
    });

    const errorResult = invalidLog.validateSync();

    if (errorResult && errorResult.errors['viewMode']) {
      console.log('✅ PASS: Test Case 1 - Caught and blocked unapproved spatial view canvas parameters successfully.');
    } else {
      console.error('❌ FAIL: Test Case 1 - Allowed unsupported viewport tracking options to parse through.');
    }
  } catch (err) {
    console.error('❌ FAIL: Test Case 1 Exception ->', err.message);
  }

  // ---------------------------------------------------------
  // TEST CASE 2: Block Negative Dwell Time Parameters (FR5.1)
  // ---------------------------------------------------------
  try {
    const brokenDwellLog = new InteractionLog({
      itemId: "dish_005",
      interactionType: "view_details",
      viewMode: "2D_Grid",
      dwellTimeSeconds: -45, // Impossible negative temporal value
      sessionId: "session_user_abc123"
    });

    const errorResult = brokenDwellLog.validateSync();

    if (errorResult && errorResult.errors['dwellTimeSeconds']) {
      console.log('✅ PASS: Test Case 2 - Intercepted and blocked negative focus tracking variables successfully.');
    } else {
      console.error('❌ FAIL: Test Case 2 - System exposed to corrupted metric variables calculation inputs.');
    }
  } catch (err) {
    console.error('❌ FAIL: Test Case 2 Exception ->', err.message);
  }

  // ---------------------------------------------------------
  // TEST CASE 3: Index Registration Integrity Evaluation (NFR1.1)
  // ---------------------------------------------------------
  try {
    const configuredIndexes = InteractionLog.schema.indexes();
    
    // Check if high-speed querying indexes are present in the configuration parameters array
    const hasOptimizedIndices = configuredIndexes.some(indexArray => 
      indexArray[0] && indexArray[0].hasOwnProperty('itemId') && indexArray[0].hasOwnProperty('createdAt')
    );

    if (hasOptimizedIndices) {
      console.log('✅ PASS: Test Case 3 - Performance index paths built cleanly into aggregation model map.');
    } else {
      console.error('❌ FAIL: Test Case 3 - Crucial performance index profiles missing from schema compilation map.');
    }
  } catch (err) {
    console.error('❌ FAIL: Test Case 3 Exception ->', err.message);
  }

  console.log('\n=============================================================');
  console.log(' COMPLETION EVALUATION COMPLETE');
  console.log('=============================================================\n');
}

// Fire the validation suite
runAnalyticsModelValidationSuite();