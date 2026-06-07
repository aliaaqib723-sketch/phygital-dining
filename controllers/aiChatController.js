import { OpenAI } from 'openai';
import MenuItem from '../models/MenuItem.js'; // References your existing Mongoose model

// Initialize the OpenAI engine client wrapper with explicit fallbacks
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || "temporary_placeholder_key",
    baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1"
});

// In-memory runtime session store map tracking historical client-side context dialogue
const chatSessionsDb = {};

// @desc    Process consumer questions via live database RAG pipeline with session memory
// @route   POST /api/chat
export const processChatQuery = async (req, res) => {
    try {
        const { sessionId, userMessage } = req.body;

        // FR-2.1: Prevent empty text inputs from executing across networks
        if (!userMessage || !userMessage.trim()) {
            return res.status(400).json({ success: false, message: "Prompt context cannot be blank." });
        }

        // FR-2.2: Establish tracking identifiers for browser contextual sessions
        const activeSessionId = sessionId || 'session_' + Math.floor(100000 + Math.random() * 900000);
        if (!chatSessionsDb[activeSessionId]) {
            chatSessionsDb[activeSessionId] = [];
        }

        // FR-2.3: Extract historical background message tokens from the memory ledger (Keep last 5)
        const historyLogs = chatSessionsDb[activeSessionId].slice(-5);

        // FR-2.4: Fetch current item records dynamically out of MongoDB Atlas cloud cluster
        const liveMenuData = await MenuItem.find({ isAvailable: true });

        // Define strict agent personas and constraints matching university project rules
        const systemRulePrompt = {
            role: "system",
            content: `You are an elite digital sommelier and intelligent AI Concierge for a high-end restaurant. 
            
            CRITICAL CONSTRAINTS:
            1. You must ONLY answer questions regarding items, ingredients, pairings, and data found within this live JSON menu database: ${JSON.stringify(liveMenuData)}.
            2. If the user asks about anything outside of this restaurant, its food, or culinary topics, you must refuse to answer and politely guide them back to our menu.
            3. Use the provided chat history to remain contextually tracking previous queries.`
        };

        // Compile prompt array layout matrix
        const promptMessagesMatrix = [
            systemRulePrompt,
            ...historyLogs.map(msg => ({ role: msg.role, content: msg.content })),
            { role: "user", content: userMessage }
        ];

        // Send payload matrix arrays directly into Groq processing node
        const chatCompletion = await openai.chat.completions.create({
            model: "llama3-8b-8192", // Free Tier high-speed Llama 3 model
            messages: promptMessagesMatrix,
            temperature: 0.3
        });

        const aiResponseText = chatCompletion.choices[0].message.content;

        // FR-3.2: Append updated dialogue tokens right back into memory logs
        chatSessionsDb[activeSessionId].push({ role: "user", content: userMessage });
        chatSessionsDb[activeSessionId].push({ role: "assistant", content: aiResponseText });

        // Provide results package back to client interface viewport
        res.status(200).json({
            success: true,
            sessionId: activeSessionId,
            answer: aiResponseText
        });

    } catch (error) {
        console.error("AI RAG Engine Error:", error);
        res.status(500).json({
            success: false,
            message: "Critical Error: Unable to complete data synchronization with OpenAI engine layers.",
            error: error.message
        });
    }
};