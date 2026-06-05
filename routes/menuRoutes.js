//API listens for a specific incoming request across the internet (like an HTTP GET POST READ DELETE requests sent to /api/menu).

//connectinh that controller function "from controllers" to an active network entry point.
import express from 'express';
import { 
  getMenuItems, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} from '../controllers/menuController.js';

const router = express.Router();

// Base route /api/menu handles reading all and creating new records
router.route('/')
  .get(getMenuItems)
  .post(createMenuItem);

// Parameterized route /api/menu/:itemId handles targets for individual dishes
router.route('/:itemId')
  .put(updateMenuItem)
  .delete(deleteMenuItem);

export default router;