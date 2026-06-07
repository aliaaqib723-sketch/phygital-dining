import express from 'express';
import { processChatQuery } from '../controllers/aiChatController.js';
const router = express.Router();

// Maps conversational POST requests straight into the RAG analysis pipeline
router.post('/', processChatQuery);

export default router;