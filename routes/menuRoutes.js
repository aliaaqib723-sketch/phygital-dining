//API listens for a specific incoming request across the internet (like an HTTP GET request sent to /api/menu).

//connectinh that controller function "from controllers" to an active network entry point.
import express from 'express';
import { getMenuItems } from '../controllers/menuController.js';

const router = express.Router();

// Define the route pathway and map it directly to our controller brain function
router.get('/', getMenuItems);

export default router;