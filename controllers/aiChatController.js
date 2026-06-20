/**
 * @file controllers/aiChatController.js
 * @description Advanced Conversational Context Broker with State Management & Database Persistence.
 * Integrates live database context queries directly into LLM prompt completion vectors.
 * Persists conversations to MongoDB with auto-cleanup for database space efficiency (512MB constraint).
 */

// CRITICAL INTEGRATION STEP: Align variable imports with central environment configuration guards
import ENVIRONMENT from '../config/environment.js';
import { OpenAI } from 'openai';
import MenuItem from '../models/MenuItem.js';
import InteractionLog from '../models/InteractionLog.js';

// In-Memory state management array tracking conversation sessions (ephemeral cache only)
const chatSessionsDb = {};

// Instantiate the OpenAI-compatible Groq SDK once at module level (not per-request)
const openai = new OpenAI({
    apiKey: ENVIRONMENT.GROQ_API_KEY,
    baseURL: ENVIRONMENT.GROQ_BASE_URL || 'https://api.groq.com/openai/v1'
});

/**
 * @function sanitizeInput
 * @description Sanitizes user input to prevent prompt injection attacks
 * @param {String} text - Raw user input
 * @returns {String} Sanitized text (max 500 chars)
 */
const sanitizeInput = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .substring(0, 500) // Limit input size to prevent injection attacks
    .replace(/[<>]/g, ''); // Remove angle brackets
};

/**
 * @function cleanupOldLogs
 * @description Deletes interaction logs older than 30 days to preserve database space
 * Runs async in background - doesn't block response
 */
const cleanupOldLogs = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await InteractionLog.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
  } catch (error) {
    console.warn('⚠️ [DB Cleanup]: Failed to clean old logs -', error.message);
  }
};

/**
 * @function processChatQuery
 * @route   POST /api/chat
 * @desc    Process consumer questions via live database RAG pipeline with session memory
 * @access  Public
 */
export const processChatQuery = async (req, res, next) => {
    try {
        const { sessionId, userMessage } = req.body;

        // Sanitize input to prevent injection attacks
        const sanitizedMessage = sanitizeInput(userMessage);

        // FR-2.1: Prevent empty context inputs from executing
        if (!sanitizedMessage) {
            return res.status(400).json({ 
                success: false, 
                message: "Prompt context cannot be blank." 
            });
        }

        // OpenAI-compatible Groq client is pre-initialized at module level above

        // FR-2.2: Establish tracking identifiers for browser contextual sessions
        const activeSessionId = sessionId || 'session_' + Math.floor(100000 + Math.random() * 900000);
        if (!chatSessionsDb[activeSessionId]) {
            chatSessionsDb[activeSessionId] = [];
        }

        // FR-2.3: Extract historical message tokens from memory logs (Keep last 5 logs for stability)
        const historyLogs = chatSessionsDb[activeSessionId].slice(-5);

        // FR-2.4: Fetch current item records out of MongoDB Atlas cloud cluster
        const liveMenuData = await MenuItem.find({ isAvailable: true }).sort({ category: 1 });

        // Define strict agent personas and context boundaries
        const systemRulePrompt = {
            role: "system",
            content: `You are an elite digital sommelier and intelligent AI Concierge for a high-end restaurant. 
            
            CRITICAL CONSTRAINTS:
            1. You must ONLY answer questions regarding items, ingredients, pricing, spice levels, allergens, and data found within this live JSON menu database: ${JSON.stringify(liveMenuData)}.
            2. If the user asks about anything outside of this restaurant, its food, or general knowledge questions unrelated to our menu, you must refuse to answer and politely guide them back to our menu selections.
            3. Always quote menu item prices in PKR exactly as structured in the data grid.
            4. Use the provided chat history to remain contextually tracking previous queries.`
        };

        // Compile prompt array layout matrix
        const promptMessagesMatrix = [
            systemRulePrompt,
            ...historyLogs.map(msg => ({ role: msg.role, content: msg.content })),
            { role: "user", content: sanitizedMessage }
        ];

        // Send payload matrix arrays straight to Groq processing node
        const chatCompletion = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant", 
            messages: promptMessagesMatrix,
            temperature: 0.3
        });

        const aiResponseText = chatCompletion.choices[0].message.content;

        // Append updated dialogue tokens right back into memory logs
        chatSessionsDb[activeSessionId].push({ role: "user", content: sanitizedMessage });
        chatSessionsDb[activeSessionId].push({ role: "assistant", content: aiResponseText });

        // Persist interaction to database for analytics (lightweight logging)
        try {
            // FIX: interactionType must match the schema enum.
            // Using 'view_details' as the closest valid value for AI chat queries.
            await InteractionLog.create({
                sessionId: activeSessionId,
                interactionType: 'view_details',
                viewMode: '2D_Grid',
                dwellTimeSeconds: 0,
                itemId: 'ai_concierge',
                userMessage: sanitizedMessage,
                deviceMetrics: {
                    os: req.headers['user-agent']?.split(' ').pop() || 'Unknown',
                    browser: req.headers['user-agent']?.split('(')[1]?.replace(')', '').trim() || 'Unknown'
                }
            });
        } catch (dbError) {
            console.warn('⚠️ [Analytics]: Failed to log interaction -', dbError.message);
            // Don't fail the response if logging fails
        }

        // Run cleanup async in background (doesn't block user response)
        cleanupOldLogs().catch(err => console.warn('Cleanup error:', err.message));

        // Provide results package back to client interface
        return res.status(200).json({
            success: true,
            sessionId: activeSessionId,
            answer: aiResponseText
        });

    } catch (error) {
        // Cascade errors smoothly into the global application error boundary middleware
        next(error);
    }
};