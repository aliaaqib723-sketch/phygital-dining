/**
 * @file middleware/authMiddleware.js
 * @description Core Security & Access Governance Gateway for the Phygital Dining System.
 * Implements Token-based Verification (FR1.1) and Role-Based Access Control (FR1.3).
 */

import jwt from 'jsonwebtoken';
import ENVIRONMENT from '../config/environment.js';

/**
 * @function protect
 * @description Intercepts incoming requests and verifies the cryptographic token identity payload.
 * Aborts request execution early if token signature verification metrics fail.
 * @param {Object} req - Express request object wrapper.
 * @param {Object} res - Express response object wrapper.
 * @param {Function} next - Next middleware trigger callback.
 * @target FR1.1: Authentication & Access Security
 */
export const protect = async (req, res, next) => {
  let token;

  // Intercept token from secure incoming cookies object mapping if present
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // Fallback pattern targeting standard authorization bearer authorization headers
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Drop execution immediately if zero cryptographic validation keys are discovered
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: No valid security credentials detected. Token-based validation failed (FR1.1).'
    });
  }

  try {
    // Decrypt token signature context strictly using verified environment secrets mapping
    const decoded = jwt.verify(token, ENVIRONMENT.JWT_SECRET);

    // Bind authenticated user metadata matrix parameters to the request flow context
    req.user = {
      id: decoded.id,
      role: decoded.role // Maps directly to RBAC permissions profile classifications (e.g., 'Admin', 'Staff')
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: `Access Denied: Security signature verification failure -> ${error.message}`
    });
  }
};

/**
 * @function authorize
 * @description Intercepts validated user context maps and parses role permissions levels.
 * Restricts restricted read/write actions from non-privileged worker groups.
 * @param {...String} roles - Collection of accepted string parameters permitted to pass cross-checks.
 * @target FR1.3: Role-Based Access Control (RBAC)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Structural boundary fallback safeguard
    if (!req.user) {
      return res.status(500).json({
        success: false,
        message: 'Internal Security Error: Execution pipeline broken. Identity properties missing.'
      });
    }

    // Evaluate current user role against authorized level permission parameters list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Current assignment level [${req.user.role}] is restricted from executing this operation. Unrestricted Admin/Manager status required (FR1.3).`
      });
    }

    next();
  };
};