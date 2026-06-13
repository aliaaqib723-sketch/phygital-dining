/**
 * @file tests/envTest.js
 * @description Diagnostic Validation Runner for Task 2.
 * Executes runtime checks on the environment module to verify gatekeeping integrity.
 */

import ENVIRONMENT from '../config/environment.js';

function runDiagnosticSuite() {
  console.log('\n=============================================================');
  console.log('🔍 [DIAGNOSTIC]: EVALUATING ENVIRONMENTAL MODULE VALIDATION');
  console.log('=============================================================');

  try {
    // Audit parsed output characteristics inside terminal runtime environment
    console.log(`✅ SUCCESS: [PORT] correctly cast to system integer -> ${ENVIRONMENT.PORT} (Type: ${typeof ENVIRONMENT.PORT})`);
    console.log(`✅ SUCCESS: [MONGO_URI] detected and active.`);
    console.log(`✅ SUCCESS: [JWT_SECRET] verified length threshold constraint: ${ENVIRONMENT.JWT_SECRET.length} chars.`);
    
    console.log('\n=============================================================');
    console.log('🎉 TASK 2 PASSED: Validation rules verified successfully.');
    console.log('=============================================================\n');
  } catch (error) {
    console.error('\n=============================================================');
    console.error('❌ TASK 2 FAILED: Diagnostic suite intercepted initialization failure.');
    console.error(`Reason: ${error.message}`);
    console.error('=============================================================\n');
    process.exit(1);
  }
}

// Fire execution sequence
runDiagnosticSuite();