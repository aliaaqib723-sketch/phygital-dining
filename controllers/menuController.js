//Acts as the brains of that endpoint. When the route hears the request, it passes it to the controller, which communicates with our MenuItem model
import MenuItem from '../models/MenuItem.js';

/**
 * @desc    Fetch all menu items (Supports optional category filtering)
 * @route   GET /api/menu
 * @access  Public
 */
export const getMenuItems = async (req, res) => {
  try {
    let query = {};

    // Advanced Filtering: If a category query exists (e.g., ?category=Pakistani), filter by it
    if (req.query.category) {
      query.category = req.query.category;
    }

    const menu = await MenuItem.find(query);
    
    res.status(200).json({
      success: true,
      count: menu.length,
      data: menu
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch menu records: ${error.message}`
    });
  }
};

/**
 * @desc    Create a new menu item
 * @route   POST /api/menu
 * @access  Private (Admin/Manager)
 */
export const createMenuItem = async (req, res) => {
  try {
    const newItem = await MenuItem.create(req.body);
    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: `Failed to create item: ${error.message}`
    });
  }
};

/**
 * @desc    Update an existing menu item by custom itemId
 * @route   PUT /api/menu/:itemId
 * @access  Private (Admin/Manager)
 */
export const updateMenuItem = async (req, res) => {
  try {
    const updatedItem = await MenuItem.findOneAndUpdate(
      { itemId: req.params.itemId },
      req.body,
      { new: true, runValidators: true } // Return updated document and re-run schema validations
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: "Item ID not found." });
    }

    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(400).json({ success: false, message: `Update failed: ${error.message}` });
  }
};

/**
 * @desc    Delete a menu item by custom itemId
 * @route   DELETE /api/menu/:itemId
 * @access  Private (Admin/Manager)
 */
export const deleteMenuItem = async (req, res) => {
  try {
    const deletedItem = await MenuItem.findOneAndDelete({ itemId: req.params.itemId });

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: "Item ID not found." });
    }

    res.status(200).json({ success: true, message: "Menu item successfully purged." });
  } catch (error) {
    res.status(400).json({ success: false, message: `Deletion failed: ${error.message}` });
  }
};