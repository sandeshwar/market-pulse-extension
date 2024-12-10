import { MARKETS, MARKET_CATEGORIES } from './js/config/markets.js';
import { isMarketOpen, fetchMarketValue } from './js/utils/marketUtils.js';
import { WatchlistUI } from './js/components/watchlistUI.js';

let startX = 0;
let startY = 0;
let startWidth = 0;
let startHeight = 0;
let marketData = {};
let showCurrentPrice = false;

// Get enabled markets from storage
async function getEnabledMarkets() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['enabledMarkets'], (result) => {
            resolve(result.enabledMarkets || ['SENSEX', 'NIFTY50']); // Default markets
        });
    });
}

// Create a market card element
function createMarketCard(marketKey) {
    const card = document.createElement('div');
    card.className = 'market-card';
    card.dataset.market = marketKey;
    card.innerHTML = `
        <div class="market-name">${MARKETS[marketKey].name}</div>
        <div class="market-value">Loading...</div>
        <div class="market-change">--</div>
        <div class="market-time">Last update: --</div>
    `;
    return card;
}

// Create a category section
function createCategorySection(categoryKey) {
    const section = document.createElement('div');
    section.className = 'market-category';
    section.innerHTML = `
        <div class="category-header">${MARKET_CATEGORIES[categoryKey]}</div>
        <div class="category-content" data-category="${categoryKey}"></div>
    `;
    return section;
}

// Organize markets by category
function organizeMarketsByCategory(enabledMarkets) {
    const categories = {};
    
    enabledMarkets.forEach(marketKey => {
        const market = MARKETS[marketKey];
        if (!market) return;
        
        const category = market.category;
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(marketKey);
    });
    
    return categories;
}

// Update a market card
async function updateMarketCard(marketCard) {
    const market = marketCard.dataset.market;
    const valueElement = marketCard.querySelector('.market-value');
    const changeElement = marketCard.querySelector('.market-change');
    const timeElement = marketCard.querySelector('.market-time');

    try {
        valueElement.textContent = 'Loading...';
        const data = await fetchMarketValue(market, showCurrentPrice);
        
        if (data && data.value) {
            const { value, previousClose, lastUpdate, isOpen } = data;
            const change = ((value - previousClose) / previousClose) * 100;
            
            valueElement.textContent = value.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 2
            });
            
            changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
            changeElement.className = `market-change ${change >= 0 ? '' : 'negative'}`;
            valueElement.className = `market-value ${change >= 0 ? '' : 'down'}`;
            
            timeElement.textContent = `Last update: ${new Date(lastUpdate).toLocaleTimeString()}`;
            if (!isOpen) {
                timeElement.textContent += ' (Market Closed)';
            }
            
            marketData[market] = data;
        }
    } catch (error) {
        console.error(`Error fetching ${market} value:`, error);
        if (marketData[market]) {
            const { value, lastUpdate, isOpen } = marketData[market];
            valueElement.textContent = value.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 2
            });
            timeElement.textContent = `Last update: ${new Date(lastUpdate).toLocaleTimeString()}`;
            if (!isOpen) {
                timeElement.textContent += ' (Market Closed)';
            }
        } else {
            valueElement.textContent = 'Error loading data';
            valueElement.className = 'market-value no-data';
        }
    }
}

// Update all market cards
async function updateAllMarkets() {
    const enabledMarkets = await getEnabledMarkets();
    const marketContainer = document.getElementById('market-container');
    marketContainer.innerHTML = '';

    const categorizedMarkets = organizeMarketsByCategory(enabledMarkets);
    
    // Sort categories to ensure consistent order
    const sortedCategories = Object.keys(categorizedMarkets).sort();
    
    // Check if any market is open
    const anyMarketOpen = enabledMarkets.some(market => 
        MARKETS[market] && isMarketOpen(MARKETS[market])
    );
    
    sortedCategories.forEach(category => {
        if (categorizedMarkets[category].length === 0) return;
        
        const categorySection = createCategorySection(category);
        const categoryContent = categorySection.querySelector('.category-content');
        
        categorizedMarkets[category].forEach(marketKey => {
            const card = createMarketCard(marketKey);
            categoryContent.appendChild(card);
            updateMarketCard(card);
        });
        
        marketContainer.appendChild(categorySection);
    });
}

// Load user preferences
async function loadPreferences() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['showCurrentPrice'], (result) => {
            showCurrentPrice = result.showCurrentPrice || false;
            updateToggleButton();
            resolve();
        });
    });
}

// Save user preferences
function savePreferences() {
    chrome.storage.sync.set({ showCurrentPrice });
}

// Update toggle button appearance
function updateToggleButton() {
    const toggleButton = document.getElementById('price-mode-toggle');
    if (toggleButton) {
        toggleButton.classList.toggle('active', showCurrentPrice);
        toggleButton.title = showCurrentPrice ? 
            'Showing current price (click to show regular market price)' : 
            'Showing regular market price (click to show current price)';
        toggleButton.querySelector('i').className = showCurrentPrice ? 
            'fas fa-chart-line' : 'fas fa-clock';
    }
}

// Initialize drag functionality
function initDrag() {
    const dragHandle = document.getElementById('drag-handle');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    dragHandle.addEventListener('mousedown', (e) => {
        if (document.body.classList.contains('pinned')) {
            isDragging = true;
            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            // Ensure window stays within viewport bounds
            const maxX = window.innerWidth - document.body.offsetWidth;
            const maxY = window.innerHeight - document.body.offsetHeight;
            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));

            document.body.style.transform = `translate(${currentX}px, ${currentY}px)`;
            
            // Save position
            chrome.storage.sync.set({
                windowPosition: { x: currentX, y: currentY }
            });
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

// Initialize resize functionality
function initResize() {
    const resizeHandle = document.getElementById('resize-handle');
    
    resizeHandle?.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = document.body.getBoundingClientRect();
        startWidth = rect.width;
        startHeight = rect.height;
        
        document.addEventListener('mousemove', onResize);
        document.addEventListener('mouseup', stopResize);
    });
}

function onResize(e) {
    if (document.body.classList.contains('pinned')) {
        const width = startWidth + (e.clientX - startX);
        const height = startHeight + (e.clientY - startY);
        
        document.body.style.width = `${Math.max(width, 360)}px`;
        document.body.style.height = `${Math.max(height, 300)}px`;
    }
}

function stopResize() {
    document.removeEventListener('mousemove', onResize);
    document.removeEventListener('mouseup', stopResize);
}

// Handle pin button
const pinButton = document.getElementById('pin-button');

// Check if we're in a pinned window
const urlParams = new URLSearchParams(window.location.search);
const isPinnedWindow = urlParams.get('pinned') === 'true';

// Check initial pin state
chrome.runtime.sendMessage({ action: 'checkPinned' }, (response) => {
    if (response && response.isPinned) {
        pinButton.classList.add('pinned');
        pinButton.title = 'Unpin window';
        const icon = pinButton.querySelector('i');
        icon.style.transform = 'rotate(-45deg)';
    }
});

pinButton.addEventListener('click', () => {
    const isPinned = pinButton.classList.toggle('pinned');
    pinButton.title = isPinned ? 'Unpin window' : 'Pin window';
    
    // Rotate icon when pinned
    const icon = pinButton.querySelector('i');
    icon.style.transform = isPinned ? 'rotate(-45deg)' : '';

    // Send message to background script
    chrome.runtime.sendMessage({
        action: isPinned ? 'keepPopupOpen' : 'closePopup'
    });

    // Only close this popup if we're creating a new pinned window
    // Don't close if we're in the pinned window and unpinning
    if (isPinned && !isPinnedWindow) {
        window.close();
    }
});

// Initialize the app
async function initializeApp() {
    const enabledMarkets = await getEnabledMarkets();
    const marketContainer = document.getElementById('market-container');
    
    // Initialize watchlist
    const watchlistRoot = document.getElementById('watchlist-root');
    const watchlistUI = new WatchlistUI(watchlistRoot);
    
    // Organize and display markets
    const categories = organizeMarketsByCategory(enabledMarkets);
    Object.entries(categories).forEach(([categoryKey, markets]) => {
        if (markets.length > 0) {
            const section = createCategorySection(categoryKey);
            markets.forEach(marketKey => {
                const card = createMarketCard(marketKey);
                section.querySelector('.category-content').appendChild(card);
            });
            marketContainer.appendChild(section);
        }
    });

    // Update all markets initially
    await updateAllMarkets();
    
    // Initialize other features
    initDrag();
    initResize();
    loadPreferences();
    
    // Set up auto-refresh
    setInterval(updateAllMarkets, 10000); // Update every 10 seconds
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
    
    // Restore window position if pinned
    chrome.storage.sync.get(['windowState'], (result) => {
        if (result.windowState) {
            const { left, top, width, height } = result.windowState;
            document.body.style.width = `${width}px`;
            document.body.style.height = `${height}px`;
            document.body.style.transform = `translate(${left}px, ${top}px)`;
        }
    });

    // Initialize settings button
    const settingsButton = document.getElementById('settings-button');
    settingsButton.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    // Handle toggle button click
    const toggleButton = document.getElementById('price-mode-toggle');
    toggleButton.addEventListener('click', async () => {
        showCurrentPrice = !showCurrentPrice;
        updateToggleButton();
        savePreferences();
        await updateAllMarkets();
    });
});