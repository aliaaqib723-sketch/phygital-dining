import mongoose from 'mongoose';

/**
 * PHY-DIGITAL DINING: MENU ITEM SCHEMA BLUEPRINT
 * Matches your precise 10-dish project specifications exactly.
 */
const MenuItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'A menu item must have a distinctive name.'],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: [true, 'A category classification designation is mandatory.']
  },
  price: {
    type: Number,
    required: [true, 'A menu item must have a calculated price points line.'],
    min: [0, 'Price cannot be a negative value.']
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
    default: 0
  },
  nutrition: {
    calories: { type: Number },
    protein: { type: String },
    carbohydrates: { type: String },
    fats: { type: String }
  },
  arModelUrl: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);
export default MenuItem;