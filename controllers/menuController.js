//Acts as the brains of that endpoint. When the route hears the request, it passes it to the controller, which communicates with our MenuItem model, pulls the 10 dishes from the cloud database, and sends them back to the client as clean JSON data.
import MenuItem from '../models/MenuItem.js';

/**
 * @desc    Fetch all menu items from the cloud database
 * @route   GET /api/menu
 * @access  Public
 */
export const getMenuItems = async (req, res) => {
  try {
    // Look into the cloud database and find all documents matching our schema
    const menu = await MenuItem.find({});
    
    // Respond back to the client with a 200 OK status code and the menu array
    res.status(200).json({
      success: true,
      count: menu.length,
      data: menu
    });
  } catch (error) {
    // If something goes wrong, return a 500 Internal Server Error status
    res.status(500).json({
      success: false,
      message: `Failed to fetch menu records: ${error.message}`
    });
  }
};