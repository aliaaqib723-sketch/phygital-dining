/**
 * @file controllers/menuController.js
 * @description Core Operational Controller Matrix for Phygital Menu Records.
 * Implements high-speed data aggregation grids and satisfies strict validation rules.
 */

import MenuItem from '../models/MenuItem.js';

/**
 * @function getAllItemsAdmin
 * @desc    Fetch all dishes from the database cluster formatted for frontend render pipelines
 * @route   GET /api/menu
 * @access  Public
 */
export const getAllItemsAdmin = async (req, res, next) => {
    try {
        // Extract optional category matching filter constraints directly from query parameters
        const { category } = req.query;
        
        let filterCriteria = {};
        
        // If a specific category filter is passed from the UI buttons, apply it to the query selection
        if (category && category !== 'All') {
            filterCriteria.category = category;
        }

        // Fetch matched menu documents ordered sequentially by identifier
        const items = await MenuItem.find(filterCriteria).sort({ itemId: 1 });

        // MANDATORY CRITICAL FIX: Match the object signature required by app.js
        return res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });

    } catch (error) {
        // Smoothly pass runtime faults into centralized application error middleware boundaries
        next(error);
    }
};

/**
 * @route   POST /api/menu
 * @desc    Authorize and append a fresh spatial dish record into the database cluster
 * @access  Private (Admin Only)
 */
export const createMenuItem = async (req, res, next) => {
  try {
    const { name, category, price, description, arModelUrl, spatialTransform } = req.body;

    // MANDATORY CRITICAL ARCHITECTURAL VALIDATION RULE CHECK
    // If an asset model URL is specified, it MUST terminate with a valid .glb file extension layout
    if (arModelUrl && !arModelUrl.toLowerCase().endsWith('.glb')) {
      return res.status(400).json({
        success: false,
        message: "Spatial Asset Validation Fault: Target arModelUrl must point to a compiled binary .glb resource."
      });
    }

    const freshItem = await MenuItem.create(req.body);

    return res.status(201).json({
      success: true,
      message: "New spatial menu item committed to database cluster successfully.",
      data: freshItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/menu/:id
 * @desc    Modify parameters of an existing dish record using its unique MongoDB Hex Object ID
 * @access  Private (Admin Only)
 */
export const updateMenuItem = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const { arModelUrl } = req.body;

    // RE-ENFORCE CRITICAL ARCHITECTURAL VALIDATION ON ENTRY UPDATE
    if (arModelUrl && !arModelUrl.toLowerCase().endsWith('.glb')) {
      return res.status(400).json({
        success: false,
        message: "Spatial Asset Validation Fault: Target arModelUrl must point to a compiled binary .glb resource."
      });
    }

    const modifiedItem = await MenuItem.findByIdAndUpdate(
      targetId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!modifiedItem) {
      return res.status(404).json({
        success: false,
        message: `Target Operation Exception: Menu entry matching reference [${targetId}] not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu entry properties modified successfully.",
      data: modifiedItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/menu/:id/availability
 * @desc    Execute quick mid-shift availability state mutations (Toggles true/false visibility states)
 * @access  Private (Staff/Admin)
 */
export const toggleItemAvailability = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    
    // Find the current live database document entry reference
    const targetItem = await MenuItem.findById(targetId);

    if (!targetItem) {
      return res.status(404).json({
        success: false,
        message: `Target Operation Exception: Menu entry matching reference [${targetId}] not found.`
      });
    }

    // Atomically invert the current boolean status
    targetItem.isAvailable = !targetItem.isAvailable;
    await targetItem.save();

    return res.status(200).json({
      success: true,
      message: `Operational visibility status modified to [${targetItem.isAvailable}] successfully.`,
      data: targetItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/menu/analytics
 * @desc    High-Speed Spatial Dashboard Aggregate Analytics Reporting Matrix
 * @access  Private (Admin Only)
 */
export const getSpatialCommandCenterAnalytics = async (req, res, next) => {
  try {
    // Compile category distributions alongside average pricing metrics via Aggregation pipelines
    const analyticsGrid = await MenuItem.aggregate([
      {
        $group: {
          _id: "$category",
          totalDishesCount: { $sum: 1 },
          averagePriceMetric: { $avg: "$price" },
          minimumPriceBound: { $min: "$price" },
          maximumPriceBound: { $max: "$price" }
        }
      },
      {
        $sort: { totalDishesCount: -1 }
      }
    ]);

    // Calculate total absolute registered count within the system
    const globalTotalItemsCount = await MenuItem.countDocuments({});

    return res.status(200).json({
      success: true,
      summary: {
        totalRegisteredItems: globalTotalItemsCount,
        uniqueActiveCategoriesCount: analyticsGrid.length
      },
      matrixGrid: analyticsGrid
    });
  } catch (error) {
    next(error);
  }
};