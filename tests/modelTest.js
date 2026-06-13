/**
 * @file tests/modelTest.js
 * @description Behavioral Testing Harness for Task 4.
 * Validates data validation rules and direct sequence calculations.
 */

import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';

async function runDatabaseModelValidationSuite() {
  console.log('\n=============================================================');
  console.log('📦 [DATA LAYER TEST]: EVALUATING MODEL CONSTRAINTS & HOOKS');
  console.log('=============================================================');

  // Establish a fast local memory validation fallback connection
  try {
    await mongoose.connect('mongodb://localhost:27017/test_phygital_db', {
      serverSelectionTimeoutMS: 1000 
    });
  } catch (e) {
    console.log('ℹ️  [Test Notice]: Sandbox environment offline. Executing virtual validation matrix checks instead...');
  }

  // ---------------------------------------------------------
  // TEST CASE 1: Enforce Native .GLB Formats Constraint (FR2.4)
  // ---------------------------------------------------------
  try {
    const brokenAssetItem = new MenuItem({
      name: "Saffron Rice",
      category: "Pakistani",
      price: 450,
      description: "Infused with high grade saffron notes.",
      arModelUrl: "https://cloud-storage.cdn/assets/rice.obj" // Alternate invalid format extension
    });

    const errorResult = brokenAssetItem.validateSync();
    
    if (errorResult && errorResult.errors['arModelUrl']) {
      console.log('✅ PASS: Test Case 1 - Blocked alternative format file extension successfully (.obj rejected).');
    } else {
      console.error('❌ FAIL: Test Case 1 - Security leakage. Unapproved 3D mesh extensions allowed entry.');
    }
  } catch (err) {
    console.error('❌ FAIL: Test Case 1 Exception ->', err.message);
  }

  // ---------------------------------------------------------
  // TEST CASE 2: Enforce Financial Boundary Conditions (NFR3.2)
  // ---------------------------------------------------------
  try {
    const invalidPriceItem = new MenuItem({
      name: "Alfredo Pasta",
      category: "Italian",
      price: -10, // Invalid sub-zero parameter
      description: "Creamy white balance profile.",
      arModelUrl: "https://cloud-storage.cdn/assets/pasta.glb"
    });

    const errorResult = invalidPriceItem.validateSync();

    if (errorResult && errorResult.errors['price']) {
      console.log('✅ PASS: Test Case 2 - Successfully intercepted and blocked negative currency parameter fields.');
    } else {
      console.error('❌ FAIL: Test Case 2 - Financial leakage occurred. Negative pricing values parsed.');
    }
  } catch (err) {
    console.error('❌ FAIL: Test Case 2 Exception ->', err.message);
  }

  // ---------------------------------------------------------
  // TEST CASE 3: Static Sequence Generation Verification (FR2.2)
  // ---------------------------------------------------------
  try {
    // Call the static calculation routine directly from the model interface
    const computedId = await MenuItem.calculateNextItemId();

    if (computedId && computedId.startsWith('dish_')) {
      console.log(`✅ PASS: Test Case 3 - Static sequence check passed. Expected Next Generated ID: [${computedId}]`);
    } else {
      console.error(`❌ FAIL: Test Case 3 - Sequence generator returned malformed code format structure: ${computedId}`);
    }
  } catch (err) {
    console.error('❌ FAIL: Test Case 3 Exception ->', err.message);
  }

  console.log('\n=============================================================');
  console.log('🎉 TASK 4 COMPLETION EVALUATION COMPLETE');
  console.log('=============================================================\n');
  
  try {
    await mongoose.disconnect();
  } catch (e) {}
}

runDatabaseModelValidationSuite();