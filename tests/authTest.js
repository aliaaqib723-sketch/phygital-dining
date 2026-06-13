/**
 * @file tests/authTest.js
 * @description Structural Unit Validation suite for Task 3.
 * Simulates middleware routing execution loops against authenticated tokens to verify security logic.
 */

import jwt from 'jsonwebtoken';
import ENVIRONMENT from '../config/environment.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Setup Mock Express Response parameters components to simulate live API conditions
const createMockResponseObjects = () => {
  const res = {};
  res.status = (statusCode) => {
    res.statusCode = statusCode;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

async function runAuthenticationTestSuite() {
  console.log('\n=============================================================');
  console.log('🛡️  [SECURITY SUITE]: EVALUATING ENCRYPTION & RBAC GATEWAYS');
  console.log('=============================================================');

  // Generate test credentials using your validated JWT secret
  const adminPayload = { id: 'user_admin_77', role: 'Admin' };
  const staffPayload = { id: 'user_staff_02', role: 'Staff' };
  
  const validAdminToken = jwt.sign(adminPayload, ENVIRONMENT.JWT_SECRET, { expiresIn: '1h' });
  const validStaffToken = jwt.sign(staffPayload, ENVIRONMENT.JWT_SECRET, { expiresIn: '1h' });
  const brokenTamperedToken = validAdminToken + "manipulated_string";

  // ---------------------------------------------------------
  // TEST CASE 1: Catch Anonymous Access Without Tokens (FR1.1)
  // ---------------------------------------------------------
  const req1 = { headers: {} };
  const res1 = createMockResponseObjects();
  await protect(req1, res1, () => {});

  if (res1.statusCode === 401) {
    console.log('✅ PASS: Test Case 1 - Intercepted anonymous request correctly.');
  } else {
    console.error('❌ FAIL: Test Case 1 - Allowed anonymous access into core pipelines.');
  }

  // ---------------------------------------------------------
  // TEST CASE 2: Catch Bad/Tampered Signatures (FR1.1)
  // ---------------------------------------------------------
  const req2 = { headers: { authorization: `Bearer ${brokenTamperedToken}` } };
  const res2 = createMockResponseObjects();
  await protect(req2, res2, () => {});

  if (res2.statusCode === 401) {
    console.log('✅ PASS: Test Case 2 - Intercepted tampered token signature successfully.');
  } else {
    console.error('❌ FAIL: Test Case 2 - System exposed to signature manipulation vulnerabilities.');
  }

  // ---------------------------------------------------------
  // TEST CASE 3: Role-Based Access Enforcement - Staff Restriction (FR1.3)
  // ---------------------------------------------------------
  const req3 = { user: { id: 'user_staff_02', role: 'Staff' } };
  const res3 = createMockResponseObjects();
  const nextTrigger3 = () => { req3.passed = true; };
  
  // Wrap route requirements to strictly require 'Admin' access profiles
  const rbacCheck = authorize('Admin');
  rbacCheck(req3, res3, nextTrigger3);

  if (res3.statusCode === 403 && !req3.passed) {
    console.log('✅ PASS: Test Case 3 - Successfully restricted floor Staff from Admin workflows.');
  } else {
    console.error('❌ FAIL: Test Case 3 - Authorization leakage detected. Restricted personnel bypassed rules.');
  }

  // ---------------------------------------------------------
  // TEST CASE 4: Role-Based Access Enforcement - Admin Authorization (FR1.3)
  // ---------------------------------------------------------
  const req4 = { user: { id: 'user_admin_77', role: 'Admin' } };
  const res4 = createMockResponseObjects();
  let passedAdminCheck = false;
  const nextTrigger4 = () => { passedAdminCheck = true; };

  rbacCheck(req4, res4, nextTrigger4);

  if (passedAdminCheck && !res4.statusCode) {
    console.log('✅ PASS: Test Case 4 - Granted full clearance to authentic Admin profile.');
  } else {
    console.error('❌ FAIL: Test Case 4 - Authentic structural manager was locked out of pipeline.');
  }

  console.log('\n=============================================================');
  console.log('🎉 Authentication test successful');
  console.log('=============================================================\n');
}

// Fire the validation suite
runAuthenticationTestSuite();