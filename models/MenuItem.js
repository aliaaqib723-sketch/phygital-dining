import mongoose from 'mongoose';

/**
 * PHY-DIGITAL DINING: MENU ITEM SCHEMA BLUEPRINT
 * Enhanced with automated validation hooks and safety compilation guards.
 */
const MenuItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'A menu item must have a distinctive name.'],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: [true, 'A category classification designation is mandatory.'],
    enum: {
      values: ['Pakistani', 'Italian', 'Fast Food', 'Seafood', 'Appetizers', 'Desserts'],
      message: 'Provided category is outside predefined structural dashboard values.'
    }
  },
  price: {
    type: Number,
    required: [true, 'A menu item must have a calculated price points line.'],
    min: [0.01, 'Price cannot be zero or a negative value.']
  },
  description: {
    type: String,
    required: [true, 'Please provide a descriptive breakdown for the customer.'],
    trim: true
  },
  ingredients: {
    type: [String],
    default: []
  },
  allergens: {
    type: [String],
    default: []
  },
  spiceLevel: {
    type: Number,
    min: [0, 'Minimum spice level threshold is 0.'],
    max: [5, 'Maximum spice level threshold is 5.'],
    default: 0
  },
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: String, default: '0g' },
    carbohydrates: { type: String, default: '0g' },
    fats: { type: String, default: '0g' }
  },
  arModelUrl: {
    type: String,
    required: [true, 'Spatial model URL path is required.'],
    trim: true,
    validate: {
      validator: function(val) {
        return val ? val.toLowerCase().endsWith('.glb') : false;
      },
      message: 'System parameters strictly enforce native .glb asset formats.'
    }
  },
  spatialTransform: {
    scale: { type: Number, default: 1.0 },
    pivotX: { type: Number, default: 0 },
    pivotY: { type: Number, default: 0 },
    pivotZ: { type: Number, default: 0 }
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

/**
 * Static Sequence ID Calculator
 */
MenuItemSchema.statics.calculateNextItemId = async function() {
  try {
    const lastRegisteredRecord = await this.findOne(
      { itemId: /^dish_\d+$/ },
      { itemId: 1 },
      { sort: { itemId: -1 } }
    );
    let baseSequenceNumber = 1;
    if (lastRegisteredRecord && lastRegisteredRecord.itemId) {
      const matches = lastRegisteredRecord.itemId.match(/_(\d+)$/);
      if (matches) {
        baseSequenceNumber = parseInt(matches[1], 10) + 1;
      }
    }
    return `dish_${String(baseSequenceNumber).padStart(3, '0')}`;
  } catch (error) {
    return 'dish_001';
  }
};

/**
 * Pre-Save Lifecycle Hook for Automation
 */
MenuItemSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  try {
    this.itemId = await mongoose.model('MenuItem').calculateNextItemId();
    next();
  } catch (error) {
    next(error);
  }
});

// Guarded Compilation Layer to eliminate offline testing import crashes
const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
export default MenuItem;