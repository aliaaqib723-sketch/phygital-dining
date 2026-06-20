// Dom Target Nodes
const menuGrid = document.getElementById('menu-grid');
const loadingIndicator = document.getElementById('loading-indicator');
const filterButtons = document.querySelectorAll('.filter-btn');

// Base API Endpoint URL - Use relative path for production portability
const API_URL = '/api/menu';

/**
 * Asynchronously fetches menu data from the Express backend engine
 * @param {String} category Optional filter query parameter
 */
async function fetchAndRenderMenu(category = 'All') {
    try {
        // Show loading message, clear out previous layout items
        loadingIndicator.style.display = 'block';
        menuGrid.innerHTML = '';

        // Build connection string. If category isn't 'All', append the query filter parameter string
        let fetchUrl = API_URL;
        if (category !== 'All') {
            fetchUrl = `${API_URL}?category=${encodeURIComponent(category)}`;
        }

        // Connect to the backend
        const response = await fetch(fetchUrl);
        
        // Check response status
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}: ${response.statusText}`);
        }
        
        const jsonResult = await response.json();

        if (!jsonResult.success || !jsonResult.data) {
            throw new Error('Cloud API returned invalid data payload layout.');
        }

        // Hide the loader
        loadingIndicator.style.display = 'none';

        // Check if anything was returned
        if (jsonResult.data.length === 0) {
            menuGrid.innerHTML = `<div class="status-message">No mouth-watering items found in the "${category}" category.</div>`;
            return;
        }

        // Loop through the data array and build visual structural components dynamically
        jsonResult.data.forEach(dish => {
            const cardElement = document.createElement('div');
            cardElement.className = 'menu-card';
            cardElement.style.cursor = 'pointer';

            // Determine spice color tag indicators
            let spiceClass = 'spice-none';
            if (dish.spiceLevel >= 4) spiceClass = 'spice-hot';
            else if (dish.spiceLevel >= 2) spiceClass = 'spice-mild';

            cardElement.innerHTML = `
                <div class="card-details">
                    <div class="card-top-line">
                        <h3>${dish.name}</h3>
                        <span class="dish-price">Rs. ${dish.price}</span>
                    </div>
                    <div class="dish-category">${dish.category}</div>
                    <p class="dish-description">${dish.description}</p>
                    <div class="dish-specs">
                        <span class="spice-level">Spice Index: <span class="${spiceClass}">${dish.spiceLevel}/5</span></span>
                        <span class="availability-status">${dish.isAvailable ? '🟢 Freshly Prepared' : '🔴 Out of stock'}</span>
                    </div>
                </div>
            `;

            // Make the card clickable - shows food detail modal
            cardElement.addEventListener('click', () => {
                showFoodDetail(dish);
                trackFoodItemClick(dish._id);
            });

            menuGrid.appendChild(cardElement);
        });

    } catch (error) {
        console.error('Frontend Interface Error:', error);
        loadingIndicator.textContent = 'Critical Error: Unable to sync with the culinary database servers.';
    }
}

/**
 * Show food item detail modal when a customer clicks on a menu card
 * @param {Object} dish - The dish data object
 */
function showFoodDetail(dish) {
    // Remove existing modal if any
    const existingModal = document.getElementById('food-detail-modal');
    if (existingModal) existingModal.remove();

    let spiceLabel = 'Mild';
    let spiceColor = '#5cb85c';
    if (dish.spiceLevel >= 4) { spiceLabel = 'Very Hot 🔥'; spiceColor = '#d9534f'; }
    else if (dish.spiceLevel >= 3) { spiceLabel = 'Hot 🌶️'; spiceColor = '#e8832a'; }
    else if (dish.spiceLevel >= 2) { spiceLabel = 'Medium'; spiceColor = '#f0ad4e'; }

    const ingredientsList = dish.ingredients && dish.ingredients.length > 0
        ? dish.ingredients.map(i => `<span style="background:#f0f4f8;padding:4px 10px;border-radius:20px;font-size:0.82rem;color:#444;border:1px solid #e1e8ed;">${i}</span>`).join(' ')
        : '<span style="color:#999;font-style:italic;">Not specified</span>';

    const allergensList = dish.allergens && dish.allergens.length > 0
        ? dish.allergens.map(a => `<span style="background:#fff0f0;padding:4px 10px;border-radius:20px;font-size:0.82rem;color:#c0392b;border:1px solid #f5c6cb;">⚠️ ${a}</span>`).join(' ')
        : '<span style="color:#999;font-style:italic;">None</span>';

    const modal = document.createElement('div');
    modal.id = 'food-detail-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;animation:fadeInModal 0.25s ease;backdrop-filter:blur(4px);';

    modal.innerHTML = `
        <style>
            @keyframes fadeInModal { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUpModal { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        </style>
        <div style="background:white;border-radius:20px;max-width:520px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,0.3);animation:slideUpModal 0.3s ease;position:relative;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg, #1a1a2e, #162447);padding:28px 28px 22px;border-radius:20px 20px 0 0;position:relative;">
                <button id="close-food-modal" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.15);border:none;color:white;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'">✕</button>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                    <div>
                        <h2 style="color:white;font-size:1.5rem;font-weight:700;margin:0 0 6px;line-height:1.3;">${dish.name}</h2>
                        <span style="color:#00fff0;font-size:0.8rem;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">${dish.category}</span>
                    </div>
                    <span style="background:rgba(233,69,96,0.9);color:white;padding:8px 16px;border-radius:25px;font-weight:700;font-size:1.1rem;white-space:nowrap;">Rs. ${dish.price}</span>
                </div>
            </div>

            <!-- Body -->
            <div style="padding:24px 28px 28px;">
                <!-- Description -->
                <div style="margin-bottom:20px;">
                    <h4 style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:8px;font-weight:600;">Description</h4>
                    <p style="color:#444;font-size:0.95rem;line-height:1.7;">${dish.description}</p>
                </div>

                <!-- Spice & Status Row -->
                <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                    <div style="flex:1;min-width:140px;background:#fafafa;padding:14px;border-radius:12px;border:1px solid #f0f0f0;">
                        <p style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:6px;">Spice Level</p>
                        <p style="font-weight:700;color:${spiceColor};font-size:1rem;">${'🌶️'.repeat(dish.spiceLevel)} ${spiceLabel} (${dish.spiceLevel}/5)</p>
                    </div>
                    <div style="flex:1;min-width:140px;background:#fafafa;padding:14px;border-radius:12px;border:1px solid #f0f0f0;">
                        <p style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:6px;">Status</p>
                        <p style="font-weight:700;color:${dish.isAvailable ? '#27ae60' : '#e74c3c'};font-size:1rem;">${dish.isAvailable ? '🟢 Available' : '🔴 Out of Stock'}</p>
                    </div>
                </div>

                <!-- Ingredients -->
                <div style="margin-bottom:20px;">
                    <h4 style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:10px;font-weight:600;">🧂 Ingredients</h4>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">${ingredientsList}</div>
                </div>

                <!-- Allergens -->
                <div style="margin-bottom:8px;">
                    <h4 style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:10px;font-weight:600;">⚠️ Allergens</h4>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">${allergensList}</div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on button click
    document.getElementById('close-food-modal').addEventListener('click', () => {
        modal.remove();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Close on Escape key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

/**
 * Track food item click for admin dashboard ranking
 * @param {String} itemId - The MongoDB _id of the clicked item
 */
async function trackFoodItemClick(itemId) {
    try {
        await fetch(`/api/admin/track-click/${itemId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        // Silently fail - tracking shouldn't break the user experience
        console.warn('Click tracking failed:', err.message);
    }
}

// Add Interactive Event Listeners to Category Buttons
filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remove 'active' styling flag from all buttons
        filterButtons.forEach(b => b.classList.remove('active'));
        
        // Add 'active' styling to the clicked button
        e.target.classList.add('active');

        // Extract the category name and trigger the fresh fetch
        const targetCategory = e.target.getAttribute('data-category');
        fetchAndRenderMenu(targetCategory);
    });
});

// App Entry Initialization Point: Load all items on startup
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderMenu('All');
    // NOTE: Removed auto-refresh to prevent menu blinking
    // Menu only changes when admin modifies items; no need for constant polling
    // Customers will see updates within 30 seconds of admin changes on their next visit
});