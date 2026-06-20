/**
 * @file tests/controllerTest.js
 * @description Isolated Pipeline Diagnostic Runner for Task 6.
 * Simulates high-speed analytical aggregation metrics calculations using a virtual environment context mock.
 */

import { getSpatialCommandCenterAnalytics } from '../controllers/menuController.js';
import MenuItem from '../models/MenuItem.js';
import InteractionLog from '../models/InteractionLog.js';

// Setup structural environment mock stubs to stand in for live Express server networks
const instantiateMockNetworkWrappers = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.payload = data;
    return res;
  };
  return res;
};

async function runAggregationPipelineTestSuite() {
  console.log('\n=============================================================');
  console.log('⚡ [PIPELINE AGGREGATION TEST]: RUNNING COMMAND CENTER CORES');
  console.log('=============================================================');

  // Stub out MenuItem model methods (getSpatialCommandCenterAnalytics uses MenuItem.aggregate + MenuItem.countDocuments)
  const originalMenuItemAggregate = MenuItem.aggregate;
  const originalMenuItemCountDocuments = MenuItem.countDocuments;
  
  // Mock MenuItem.aggregate → returns category grouping data (matches the $group pipeline in the controller)
  MenuItem.aggregate = async function() {
    return [
      { _id: 'Pakistani',  totalDishesCount: 8, averagePriceMetric: 650, minimumPriceBound: 400, maximumPriceBound: 950 },
      { _id: 'Italian',    totalDishesCount: 5, averagePriceMetric: 850, minimumPriceBound: 500, maximumPriceBound: 1200 },
      { _id: 'Fast Food',  totalDishesCount: 4, averagePriceMetric: 450, minimumPriceBound: 200, maximumPriceBound: 650 },
    ];
  };

  // Mock MenuItem.countDocuments → returns total item count
  MenuItem.countDocuments = async function() {
    return 17;
  };

  // Also stub InteractionLog.aggregate in case it is referenced
  const originalInteractionLogAggregate = InteractionLog.aggregate;
  InteractionLog.aggregate = async function() {
    return [
      { itemId: 'dish_001', totalInteractionsCount: 20, spatialArExposurePercentage: 75.0 },
      { itemId: 'dish_002', totalInteractionsCount: 10, spatialArExposurePercentage: 20.0 }
    ];
  };

  try {
    const mockReq = {};
    const mockRes = instantiateMockNetworkWrappers();
    // FIX: Controller signature is (req, res, next) — must pass a mock next
    let capturedError = null;
    const mockNext = (err) => { capturedError = err; };

    // Execute the controller routing logic block and measure latency (NFR1.1)
    const startTime = Date.now();
    await getSpatialCommandCenterAnalytics(mockReq, mockRes, mockNext);
    const executionLatencyMs = Date.now() - startTime;

    // ---------------------------------------------------------
    // TEST CASE 1: Verify Aggregation Pipeline Response Shape
    // Controller returns { success, summary: { totalRegisteredItems, uniqueActiveCategoriesCount }, matrixGrid }
    // ---------------------------------------------------------
    if (mockRes.statusCode === 200 && mockRes.payload?.success === true && Array.isArray(mockRes.payload.matrixGrid)) {
      console.log('✅ PASS: Test Case 1 - Aggregation framework compiled data variables cleanly.');
      console.log(`   → matrixGrid count: ${mockRes.payload.matrixGrid.length}, totalRegisteredItems: ${mockRes.payload.summary?.totalRegisteredItems}`);
    } else {
      console.error('❌ FAIL: Test Case 1 - Aggregator framework dropped calculations or crashed execution loops.');
      console.error(`   → payload: ${JSON.stringify(mockRes.payload)}`);
      if (capturedError) console.error(`   → error captured by next(): ${capturedError.message}`);
    }

    // ---------------------------------------------------------
    // TEST CASE 2: Validate Latency Compliance (NFR1.1) — under 1500ms
    // ---------------------------------------------------------
    const LATENCY_LIMIT_MS = 1500;
    if (executionLatencyMs < LATENCY_LIMIT_MS) {
      console.log(`✅ PASS: Test Case 2 - Latency ceiling verified: [${executionLatencyMs}ms] easily under the ${LATENCY_LIMIT_MS}ms limit.`);
    } else {
      console.error(`❌ FAIL: Test Case 2 - Aggregation pipeline violated performance limits: ${executionLatencyMs}ms > ${LATENCY_LIMIT_MS}ms`);
    }

    // ---------------------------------------------------------
    // TEST CASE 3: Summary Metrics Correctness (FR5.1 & FR5.2)
    // Verify totalRegisteredItems = 17 (from our mock countDocuments) and categories = 3
    // ---------------------------------------------------------
    const summary = mockRes.payload?.summary;
    if (summary?.totalRegisteredItems === 17 && summary?.uniqueActiveCategoriesCount === 3) {
      console.log(`✅ PASS: Test Case 3 - Summary metrics correct. Total: ${summary.totalRegisteredItems}, Categories: ${summary.uniqueActiveCategoriesCount}.`);
    } else {
      console.error('❌ FAIL: Test Case 3 - Summary structure is missing or has incorrect values.');
      console.error(`   → Got summary: ${JSON.stringify(summary)}`);
    }

  } catch (error) {
    console.error('❌ FAIL: Critical exceptions encountered in pipeline suite ->', error.message);
  } finally {
    // Restore all original model methods
    MenuItem.aggregate = originalMenuItemAggregate;
    MenuItem.countDocuments = originalMenuItemCountDocuments;
    InteractionLog.aggregate = originalInteractionLogAggregate;
  }

  console.log('\n=============================================================');
  console.log(' EVALUATION COMPLETE');
  console.log('=============================================================\n');
}

// Fire calculation checks
runAggregationPipelineTestSuite();