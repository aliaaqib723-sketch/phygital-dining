// Dom Target Nodes
const menuGrid = document.getElementById('menu-grid');
const loadingIndicator = document.getElementById('loading-indicator');
const filterButtons = document.querySelectorAll('.filter-btn');

// Base API Endpoint URL
const API_URL = 'http://localhost:5000/api/menu';

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
            menuGrid.appendChild(cardElement);
        });

    } catch (error) {
        console.error('Frontend Interface Error:', error);
        loadingIndicator.textContent = 'Critical Error: Unable to sync with the culinary database servers.';
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
});