/**
 * Modular AI Concierge Frontend Interface Loader
 * Automatically constructs and hooks the RAG chat panel widget into the DOM.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Dynamic UI Component Construction ---
    const chatWidgetContainer = document.createElement('div');
    chatWidgetContainer.id = 'ai-chat-widget';
    chatWidgetContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 10000; font-family: system-ui, sans-serif;';

    chatWidgetContainer.innerHTML = `
        <button id="chat-toggle-btn" style="background-color: #800020; color: white; border: none; padding: 15px 24px; border-radius: 50px; cursor: pointer; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); transition: transform 0.2s ease;">
            💬 Ask AI Concierge
        </button>

        <div id="chat-window" style="display: none; width: 360px; height: 480px; background-color: white; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); flex-direction: column; overflow: hidden; position: absolute; bottom: 75px; right: 0; border: 1px solid #eaeaea;">
            <div style="background-color: #800020; color: white; padding: 16px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; font-size: 15px;">
                <span style="display: flex; align-items: center; gap: 8px;">🍷 Digital Sommelier</span>
                <button id="chat-close-btn" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; line-height: 1;">✕</button>
            </div>
            
            <div id="chat-messages-box" style="flex: 1; padding: 16px; overflow-y: auto; background-color: #fcfcfc; display: flex; flex-direction: column; gap: 12px;">
                <div style="background-color: #f0f0f0; color: #333; padding: 12px; border-radius: 12px 12px 12px 4px; max-width: 85%; align-self: flex-start; font-size: 14px; line-height: 1.4;">
                    Welcome! I am your AI Concierge. Ask me anything about our ingredients, allergen details, wine pairings, or spice levels!
                </div>
            </div>

            <div style="padding: 12px; border-top: 1px solid #f0f0f0; display: flex; gap: 8px; background-color: white;">
                <input type="text" id="chat-user-input" placeholder="Is the steak spicy?..." style="flex: 1; padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 24px; outline: none; font-size: 14px; background-color: #fafafa;">
                <button id="chat-send-btn" style="background-color: #800020; color: white; border: none; padding: 0 18px; border-radius: 24px; cursor: pointer; font-weight: bold; font-size: 14px;">Send</button>
            </div>
        </div>
    `;

    // Inject the fully built widget container node cleanly into your active page viewport
    document.body.appendChild(chatWidgetContainer);

    // --- 2. Interactive UI Element Targets & State Handling ---
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('chat-close-btn');
    const chatWindow = document.getElementById('chat-window');
    const sendBtn = document.getElementById('chat-send-btn');
    const userInput = document.getElementById('chat-user-input');
    const messagesBox = document.getElementById('chat-messages-box');

    let activeChatSessionId = localStorage.getItem('ai_menu_session_id') || '';

    // --- 3. Visibility State Toggles ---
    toggleBtn.addEventListener('click', () => {
        const isHidden = chatWindow.style.display === 'none';
        chatWindow.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) userInput.focus();
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });

    // --- 4. Core Network Handshake Processing (RAG Pipeline Connection) ---
    async function transmitUserQuery() {
        const cleanText = userInput.value.trim();
        if (!cleanText) return;

        // Render user message bubble instantly
        appendBubbleMessage(cleanText, 'user');
        userInput.value = '';

        // Spawn a visual pending state loader indicator bubble
        const typingIndicator = appendBubbleMessage('AI is thinking...', 'assistant-typing');

        try {
            // Handshake fetch call straight to your fresh backend mount endpoint route target
            const systemNetworkResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: activeChatSessionId,
                    userMessage: cleanText
                })
            });

            const parsedDataOutput = await systemNetworkResponse.json();
            typingIndicator.remove(); // Safely clear out the processing placeholder text

            if (parsedDataOutput.success) {
                // Save and maintain dynamic conversation tracking tokens locally 
                activeChatSessionId = parsedDataOutput.sessionId;
                localStorage.setItem('ai_menu_session_id', activeChatSessionId);
                appendBubbleMessage(parsedDataOutput.answer, 'assistant');
            } else {
                appendBubbleMessage("Sorry, I am having trouble connecting to my database layers right now.", 'assistant');
            }
        } catch (networkError) {
            if (typingIndicator) typingIndicator.remove();
            console.error("Frontend Connection Exception Caught:", networkError);
            appendBubbleMessage("Critical Network Interface Timeout encountered.", 'assistant');
        }
    }

    // --- 5. Message Visual Bubble DOM Renderer ---
    function appendBubbleMessage(messageText, messageSenderType) {
        const dynamicContainerDiv = document.createElement('div');
        dynamicContainerDiv.innerText = messageText;
        dynamicContainerDiv.style.cssText = 'padding: 12px; max-width: 85%; font-size: 14px; line-height: 1.4; box-shadow: 0 1px 2px rgba(0,0,0,0.05);';

        if (messageSenderType === 'user') {
            dynamicContainerDiv.style.backgroundColor = '#800020';
            dynamicContainerDiv.style.color = 'white';
            dynamicContainerDiv.style.alignSelf = 'flex-end';
            dynamicContainerDiv.style.borderRadius = '12px 12px 4px 12px';
        } else {
            dynamicContainerDiv.style.backgroundColor = '#f0f0f0';
            dynamicContainerDiv.style.color = '#333';
            dynamicContainerDiv.style.alignSelf = 'flex-start';
            dynamicContainerDiv.style.borderRadius = '12px 12px 12px 4px';
            
            if (messageSenderType === 'assistant-typing') {
                dynamicContainerDiv.style.fontStyle = 'italic';
                dynamicContainerDiv.style.color = '#888';
                dynamicContainerDiv.style.backgroundColor = '#f9f9f9';
            }
        }

        messagesBox.appendChild(dynamicContainerDiv);
        messagesBox.scrollTop = messagesBox.scrollHeight; // Force scrolling focal point auto-downwards
        return dynamicContainerDiv;
    }

    // --- 6. Event Core Operational Triggers ---
    sendBtn.addEventListener('click', transmitUserQuery);
    userInput.addEventListener('keypress', (eventKey) => {
        if (eventKey.key === 'Enter') transmitUserQuery();
    });
});