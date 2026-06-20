/**
 * Modular Dine.AI Concierge Frontend Interface Loader
 * Automatically constructs and hooks the RAG chat panel widget into the DOM.
 * Features full-screen maximization scaling and robust token-based markdown rendering.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Dynamic UI Component Construction ---
    const chatWidgetContainer = document.createElement('div');
    chatWidgetContainer.id = 'ai-chat-widget';
    chatWidgetContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 10000; font-family: system-ui, -apple-system, sans-serif;';

    chatWidgetContainer.innerHTML = `
        <button id="chat-toggle-btn" style="background-color: #800020; color: white; border: none; padding: 15px 24px; border-radius: 50px; cursor: pointer; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); transition: transform 0.2s ease;">
            🍽️ Ask Dine.AI
        </button>

        <div id="chat-window" style="display: none; width: 360px; height: 520px; background-color: white; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); flex-direction: column; overflow: hidden; position: absolute; bottom: 75px; right: 0; border: 1px solid #eaeaea; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);">
            <div style="background-color: #800020; color: white; padding: 16px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; font-size: 15px;">
                <span style="display: flex; align-items: center; gap: 8px;">🍽️ Dine.AI</span>
                <div style="display: flex; align-items: center; gap: 14px;">
                    <button id="chat-maximize-btn" title="Toggle Fullscreen" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px; padding: 2px; line-height: 1; display: flex; align-items: center; justify-content: center;">⛶</button>
                    <button id="chat-close-btn" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; line-height: 1;">✕</button>
                </div>
            </div>
            
            <div id="chat-messages-box" style="flex: 1; padding: 16px; overflow-y: auto; background-color: #fcfcfc; display: flex; flex-direction: column; gap: 12px;">
                <div style="background-color: #f0f0f0; color: #333; padding: 14px; border-radius: 12px 12px 12px 4px; max-width: 90%; align-self: flex-start; font-size: 14px; line-height: 1.5; white-space: pre-line;">
                    <strong>Dine.AI:</strong> “Welcome to our Phygital dining experience. I am Dine.AI, your virtual concierge. I am here to provide seamless information on our menu, ingredients, and flavor profiles. How may I help you today?”

✨ Recommend a Signature Dish
🌱 View Dietary/Allergy Options
🌶️ Spice Levels of Food
🍷 Suggest a Drink Pairing
💵 Budget-Friendly Food Suggestions
🍱 Explore Food Combos
                </div>
            </div>

            <div style="padding: 12px; border-top: 1px solid #f0f0f0; display: flex; gap: 8px; background-color: white;">
                <input type="text" id="chat-user-input" placeholder="Ask Dine.AI something..." style="flex: 1; padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 24px; outline: none; font-size: 14px; background-color: #fafafa;">
                <button id="chat-send-btn" style="background-color: #800020; color: white; border: none; padding: 0 18px; border-radius: 24px; cursor: pointer; font-weight: bold; font-size: 14px;">Send</button>
            </div>
        </div>
    `;

    document.body.appendChild(chatWidgetContainer);

    // --- 2. Element Targets & State Handling ---
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('chat-close-btn');
    const maximizeBtn = document.getElementById('chat-maximize-btn');
    const chatWindow = document.getElementById('chat-window');
    const sendBtn = document.getElementById('chat-send-btn');
    const userInput = document.getElementById('chat-user-input');
    const messagesBox = document.getElementById('chat-messages-box');

    let activeChatSessionId = localStorage.getItem('ai_menu_session_id') || '';
    let isMaximized = false;

    // --- 3. Viewport State & Maximize Toggles ---
    toggleBtn.addEventListener('click', () => {
        const isHidden = chatWindow.style.display === 'none';
        chatWindow.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) userInput.focus();
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });

    // Requirement 3: Maximize Window Toggle Logic
    maximizeBtn.addEventListener('click', () => {
        isMaximized = !isMaximized;
        if (isMaximized) {
            chatWindow.style.width = 'calc(100vw - 40px)';
            chatWindow.style.height = 'calc(100vh - 120px)';
            maximizeBtn.textContent = '🗗';
        } else {
            chatWindow.style.width = '360px';
            chatWindow.style.height = '520px';
            maximizeBtn.textContent = '⛶';
        }
        messagesBox.scrollTop = messagesBox.scrollHeight;
    });

    // --- 4. Network Handshake Processing ---
    async function transmitUserQuery() {
        const cleanText = userInput.value.trim();
        if (!cleanText) return;

        appendBubbleMessage(cleanText, 'user');
        userInput.value = '';

        // CUSTOM FOUNDER EASTER EGG RULE: Captures both 'aaqib' and 'aqib' case-insensitively
        const normalizedPrompt = cleanText.toLowerCase();
        if (normalizedPrompt.includes('aaqib') || normalizedPrompt.includes('aqib')) {
            const typingIndicator = appendBubbleMessage('Dine.AI is thinking...', 'assistant-typing');
            
            setTimeout(() => {
                typingIndicator.remove();
                appendBubbleMessage(
                    "**Aaqib** is the visionary **Founder and Creator** of this entire Phygital Dining ecosystem! Beyond engineering the full-stack database layout and training my conversational RAG framework, he is also the master chef behind the culinary arts. \n\n🍳 **An Interesting Fact:** Every single dish you see showcased on our digital menu tonight was **personally prepared and cooked by him** to absolute perfection—blending authentic, rich flavors with state-of-the-art technological innovation!", 
                    'assistant'
                );
            }, 650);
            return;
        }

        const typingIndicator = appendBubbleMessage('Dine.AI is thinking...', 'assistant-typing');

        try {
            const systemNetworkResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: activeChatSessionId,
                    userMessage: cleanText
                })
            });

            // Handle rate limiting (429) and server errors (5xx)
            if (!systemNetworkResponse.ok) {
                typingIndicator.remove();
                if (systemNetworkResponse.status === 429) {
                    appendBubbleMessage("⏱️ I'm receiving too many requests right now. Please try again in a moment.", 'assistant');
                } else if (systemNetworkResponse.status >= 500) {
                    appendBubbleMessage("🔧 Server is temporarily unavailable. Please try again shortly.", 'assistant');
                } else if (systemNetworkResponse.status === 400) {
                    appendBubbleMessage("❌ Invalid request format. Please try rephrasing your question.", 'assistant');
                } else {
                    appendBubbleMessage(`❌ HTTP Error ${systemNetworkResponse.status}. Please try again.`, 'assistant');
                }
                return;
            }

            const parsedDataOutput = await systemNetworkResponse.json();
            typingIndicator.remove();

            if (parsedDataOutput.success) {
                activeChatSessionId = parsedDataOutput.sessionId;
                localStorage.setItem('ai_menu_session_id', activeChatSessionId);
                appendBubbleMessage(parsedDataOutput.answer, 'assistant');
            } else {
                appendBubbleMessage(parsedDataOutput.message || "Sorry, I encountered an issue processing your request.", 'assistant');
            }
        } catch (networkError) {
            if (typingIndicator) typingIndicator.remove();
            console.error('Chat error:', networkError);
            
            if (networkError instanceof TypeError) {
                appendBubbleMessage("🌐 Network connection error. Please check your internet connection.", 'assistant');
            } else {
                appendBubbleMessage("⚠️ Something went wrong. Please try again.", 'assistant');
            }
        }
    }

    // --- 5. Markdown Token-Based Message Visual Bubble Renderer ---
    function appendBubbleMessage(messageText, messageSenderType) {
        const dynamicContainerDiv = document.createElement('div');
        dynamicContainerDiv.style.cssText = 'padding: 12px; max-width: 85%; font-size: 14px; line-height: 1.5; box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 4px; word-break: break-word;';

        if (messageSenderType === 'user') {
            dynamicContainerDiv.style.backgroundColor = '#800020';
            dynamicContainerDiv.style.color = 'white';
            dynamicContainerDiv.style.alignSelf = 'flex-end';
            dynamicContainerDiv.style.borderRadius = '12px 12px 4px 12px';
            dynamicContainerDiv.innerText = messageText;
        } else {
            dynamicContainerDiv.style.backgroundColor = '#f0f0f0';
            dynamicContainerDiv.style.color = '#333';
            dynamicContainerDiv.style.alignSelf = 'flex-start';
            dynamicContainerDiv.style.borderRadius = '12px 12px 12px 4px';
            
            if (messageSenderType === 'assistant-typing') {
                dynamicContainerDiv.style.fontStyle = 'italic';
                dynamicContainerDiv.style.color = '#888';
                dynamicContainerDiv.style.backgroundColor = '#f9f9f9';
                dynamicContainerDiv.innerText = messageText;
            } else {
                let escapedText = messageText
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');

                let parts = escapedText.split('**');
                let compiledHtml = '';
                
                for (let i = 0; i < parts.length; i++) {
                    if (i % 2 === 1) {
                        compiledHtml += `<strong style="font-weight: 700; color: #1a1a2e; display: inline;">${parts[i]}</strong>`;
                    } else {
                        let textBlock = parts[i];
                        textBlock = textBlock.replace(/^(\d+)\.\s(.*)$/gm, '<div style="margin-left: 8px; padding-left: 4px; text-indent: -12px; margin-top: 2px;">$1. $2</div>');
                        compiledHtml += textBlock;
                    }
                }

                dynamicContainerDiv.innerHTML = compiledHtml.replace(/\n/g, '<br>');
            }
        }

        messagesBox.appendChild(dynamicContainerDiv);
        messagesBox.scrollTop = messagesBox.scrollHeight;
        return dynamicContainerDiv;
    }

    // --- 6. Operational Event Triggers ---
    sendBtn.addEventListener('click', transmitUserQuery);
    userInput.addEventListener('keypress', (eventKey) => {
        if (eventKey.key === 'Enter') transmitUserQuery();
    });
});