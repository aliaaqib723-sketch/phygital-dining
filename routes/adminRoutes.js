/**
 * @file routes/adminRoutes.js
 * @description Secure Admin Dashboard Routes - Authentication & Menu Management
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import MenuItem from '../models/MenuItem.js';
import InteractionLog from '../models/InteractionLog.js';
import ENVIRONMENT from '../config/environment.js';

const router = express.Router();

/**
 * ADMIN LOGIN - Generate JWT token
 * @route POST /api/admin/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Load credentials from environment variables (never hardcode in source)
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@2024';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: 'admin', role: 'Admin', username },
        ENVIRONMENT.JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        token,
        user: { username, role: 'Admin' }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * ADMIN AUTH MIDDLEWARE - Verify token
 */
const adminProtect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.adminToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, ENVIRONMENT.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

/**
 * GET ALL MENU ITEMS (Admin View - Non-Deleted Items Only)
 * @route GET /api/admin/menu
 */
router.get('/menu', adminProtect, async (req, res, next) => {
  try {
    const items = await MenuItem.find({ $or: [ { isDeleted: false }, { isDeleted: { $exists: false } } ] }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
});

/**
 * CREATE NEW MENU ITEM (Admin Only)
 * @route POST /api/admin/menu
 */
router.post('/menu', adminProtect, async (req, res, next) => {
  try {
    const { name, category, price, description, arModelUrl, spiceLevel, ingredients, allergens } = req.body;

    // Validate required fields
    if (!name || !category || !price || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, category, price, description'
      });
    }

    // Parse ingredients - handle both array and string formats
    let parsedIngredients = [];
    if (ingredients) {
      if (Array.isArray(ingredients)) {
        parsedIngredients = ingredients;
      } else if (typeof ingredients === 'string') {
        parsedIngredients = ingredients.split(',').map(i => i.trim()).filter(i => i);
      }
    }

    // Parse allergens - handle both array and string formats
    let parsedAllergens = [];
    if (allergens) {
      if (Array.isArray(allergens)) {
        parsedAllergens = allergens;
      } else if (typeof allergens === 'string') {
        parsedAllergens = allergens.split(',').map(a => a.trim()).filter(a => a);
      }
    }

    // Auto-generate itemId if not provided
    let itemData = {
      name,
      category,
      price: parseFloat(price),
      description,
      spiceLevel: spiceLevel ? parseInt(spiceLevel) : 0,
      ingredients: parsedIngredients,
      allergens: parsedAllergens,
      arModelUrl: arModelUrl || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
      isAvailable: true,
      isDeleted: false
    };

    // Auto-generate itemId
    itemData.itemId = await MenuItem.calculateNextItemId();

    const newItem = await MenuItem.create(itemData);

    return res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: newItem
    });
  } catch (error) {
    next(error);
  }
});

/**
 * UPDATE MENU ITEM (Admin Only)
 * @route PUT /api/admin/menu/:id
 */
router.put('/menu/:id', adminProtect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Parse ingredients and allergens if they're strings
    if (typeof updateData.ingredients === 'string') {
      updateData.ingredients = updateData.ingredients.split(',').map(i => i.trim());
    }
    if (typeof updateData.allergens === 'string') {
      updateData.allergens = updateData.allergens.split(',').map(a => a.trim());
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE MENU ITEM (Soft Delete - Move to Recycle Bin)
 * @route DELETE /api/admin/menu/:id
 */
router.delete('/menu/:id', adminProtect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const permanent = req.body?.permanent || false;

    if (permanent) {
      // Permanently delete from database
      const deletedItem = await MenuItem.findByIdAndDelete(id);
      if (!deletedItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Item permanently deleted from recycle bin',
        data: deletedItem
      });
    } else {
      // Soft delete - move to recycle bin
      const softDeletedItem = await MenuItem.findByIdAndUpdate(id, {
        isDeleted: true,
        deletedAt: new Date()
      }, { new: true });

      if (!softDeletedItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Item moved to recycle bin',
        data: softDeletedItem
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET RECYCLE BIN ITEMS
 * @route GET /api/admin/trash
 */
router.get('/trash', adminProtect, async (req, res, next) => {
  try {
    const deletedItems = await MenuItem.find({ isDeleted: true }).sort({ deletedAt: -1 });
    return res.status(200).json({
      success: true,
      count: deletedItems.length,
      data: deletedItems
    });
  } catch (error) {
    next(error);
  }
});

/**
 * RESTORE ITEM FROM RECYCLE BIN
 * @route PUT /api/admin/trash/:id/restore
 */
router.put('/trash/:id/restore', adminProtect, async (req, res, next) => {
  try {
    const itemId = req.params.id;
    const restored = await MenuItem.findByIdAndUpdate(itemId, {
      isDeleted: false,
      deletedAt: null
    }, { new: true });

    if (!restored) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in recycle bin'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item restored from recycle bin',
      data: restored
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET ANALYTICS DATA
 * @route GET /api/admin/analytics
 */
router.get('/analytics', adminProtect, async (req, res, next) => {
  try {
    // Only count non-deleted items
    const items = await MenuItem.find({ $or: [ { isDeleted: false }, { isDeleted: { $exists: false } } ] });
    const recentInteractions = await InteractionLog.find({})
      .sort({ createdAt: -1 })
      .limit(10);

    // Top ranked food items by customer click count
    const topRankedItems = await MenuItem.find({ $or: [ { isDeleted: false }, { isDeleted: { $exists: false } } ] })
      .sort({ clickCount: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      analytics: {
        totalItems: items.length,
        activeItems: items.filter(i => i.isAvailable).length,
        disabledItems: items.filter(i => !i.isAvailable).length,
        topRankedItems: topRankedItems,
        recentInteractions
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * TRACK FOOD ITEM CLICK (Public - called from customer menu)
 * @route POST /api/admin/track-click/:id
 */
router.post('/track-click/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findByIdAndUpdate(
      id,
      { $inc: { clickCount: 1 } },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

/**
 * GET CHAT QUERIES (AI chat messages from customers)
 * @route GET /api/admin/chat-queries
 */
router.get('/chat-queries', adminProtect, async (req, res, next) => {
  try {
    const queries = await InteractionLog.find({ itemId: 'ai_concierge' })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.status(200).json({ success: true, data: queries });
  } catch (error) {
    next(error);
  }
});

export default router;
