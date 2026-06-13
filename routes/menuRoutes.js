/**
 * @file routes/menuRoutes.js
 * @description Secure Routing Matrix and Access Governance Rules mapping endpoints to controllers.
 * Native Express v5 Compliant Architecture with Public and Protected Isolation Layers.
 */

import express from 'express';
import { 
  getAllItemsAdmin, 
  createMenuItem, 
  updateMenuItem, 
  toggleItemAvailability,
  getSpatialCommandCenterAnalytics
} from '../controllers/menuController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// -------------------------------------------------------------------------
// PROTECTED COMPLIANCE ENDPOINTS: COMMAND CENTER ANALYTICS LOOP
// -------------------------------------------------------------------------
// This remains strictly locked down behind authentication layer protections
router.get('/analytics', protect, authorize('Admin'), getSpatialCommandCenterAnalytics);

// -------------------------------------------------------------------------
// MIXED OPERATIONAL ENDPOINTS: GRID MANAGEMENT MATRIX
// -------------------------------------------------------------------------

// CRITICAL FIX: Split the base '/' route handlers
// Customers can read the menu publicly, but only authenticated admins can POST new items
router.route('/')
  .get(getAllItemsAdmin) // PUBLIC: No protect middleware here so your frontend landing page can load items!
  .post(protect, authorize('Admin'), createMenuItem); // PROTECTED: Restricted to logged-in admins

// Update Route: Requires strict validation parameters and Admin privileges
router.put('/:id', protect, authorize('Admin'), updateMenuItem);

// Availability Switch Route: Restrict to authenticated Staff/Admins for mid-shift updates
router.patch('/:id/availability', protect, authorize('Staff', 'Admin'), toggleItemAvailability);

export default router;