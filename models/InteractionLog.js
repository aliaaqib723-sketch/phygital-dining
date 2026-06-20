/**
 * @file models/InteractionLog.js
 * @description Database Schema Definition for spatial computing behavioral analytics logs.
 * Tracks spatial view modes (FR5.2), dwell tracking periods (FR5.1), and indexes optimization targets (NFR1.1).
 */

import mongoose from 'mongoose';

const interactionLogSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: [true, 'Analytics Ingestion Error: Target analytical entity itemId reference link is mandatory.'],
    index: true // High speed indexing to support rapid aggregation performance bounds under 1.5s (NFR1.1)
  },
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  },
  interactionType: {
    type: String,
    required: [true, 'Analytics Ingestion Error: Behavioral interaction identification label is mandatory.'],
    enum: {
      values: ['view_details', 'ar_render_toggle', 'spatial_transform_modify', 'cart_addition'],
      message: 'Analytics Scope Error: Emitted tracking event is outside legal collection classifications.'
    }
  },
  viewMode: {
    type: String,
    required: [true, 'Analytics Ingestion Error: Canvas viewport environment target must be explicit.'],
    enum: {
      values: ['2D_Grid', '3D_Spatial_AR'], // FR5.2: Tracking visual configuration exploration states
      message: 'Canvas Space Error: View target environment choice is unsupported.'
    }
  },
  dwellTimeSeconds: {
    type: Number,
    required: [true, 'Analytics Ingestion Error: Chronographic engagement length metric is mandatory.'],
    min: [0, 'Metrics Violation: Attention timeline mapping parameters cannot represent negative values.']
    // FR5.1: Captures temporal length scores tracking menu item spatial attention metrics
  },
  sessionId: {
    type: String,
    required: [true, 'Analytics Ingestion Error: Global session tracking token identifier is mandatory.'],
    index: true
  },
  deviceMetrics: {
    os: { type: String, trim: true, default: 'Unknown' },
    browser: { type: String, trim: true, default: 'Unknown' }
  },
  userMessage: {
    type: String,
    trim: true,
    default: ''
  }
}, { 
  timestamps: true // Captures real-time interaction log entries chronologically out-of-the-box
});

// COMPOUND INDEX TUNING OPERATIONS
// Accelerates the backend dashboard's analytical aggregation filters by item and timestamp combined (NFR1.1)
interactionLogSchema.index({ itemId: 1, createdAt: -1 });
interactionLogSchema.index({ interactionType: 1, viewMode: 1 });

const InteractionLog = mongoose.models.InteractionLog || mongoose.model('InteractionLog', interactionLogSchema);
export default InteractionLog;