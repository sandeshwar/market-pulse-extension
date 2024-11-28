import { MARKETS } from './js/config/markets.js';
import { updateMarketStatus, isMarketOpen } from './js/utils/marketUtils.js';
import { getCache, setCache } from './js/cache.js';

const CACHE_KEY = 'marketCache';
let currentRequest = null;
let isPinned = false;
let isDragging = false;
let isResizing = false;
let startX = 0;
let startY = 0;
let startWidth = 0;
let startHeight = 0;

async function fetchMarketValue(marketKey) {
    if (!MARKETS[marketKey]) {
        console.error(`Invalid market key: ${marketKey}`);
        return;
    }

    const requestId = Date.now();
    currentRequest = requestId;
    
    const market = MARKETS[marketKey];
    const statusElement = document.getElementById('sensex-value');
    const refreshButton = document.getElementById('refresh-button');
    
    if (!statusElement || !refreshButton) {
        console.error('Required DOM elements not found');
        return;
    }

    const buttonText = refreshButton.querySelector('.button-text');
    if (!buttonText) {
        console.error('Button text element not found');
        return;
    }

    const isOpen = updateMarketStatus(market);
    
    // Remove loading state if it was there from initial load
    statusElement.classList.remove('fetching');
    
    // Show cached value first if available
    const cachedData = getCache()[marketKey];
    if (cachedData?.price) {
        statusElement.classList.remove('no-data');
        statusElement.textContent = formatPrice(cachedData.price, market.currency);
    }
    
    // Don't fetch if market is closed
    if (!isOpen) {
        if (!cachedData?.price) {
            statusElement.classList.add('no-data');
            statusElement.textContent = 'Market is closed';
        }
        return;
    }
    
    refreshButton.disabled = true;
    refreshButton.classList.add('loading');
    buttonText.textContent = 'Refreshing...';
    
    try {
        statusElement.classList.add('fetching');
        
        // Using Yahoo Finance API with proper headers
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${market.symbol}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0',
            },
            mode: 'cors',
            credentials: 'omit'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if this is still the current request
        if (currentRequest !== requestId) return;
        
        if (!data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
            throw new Error('Market data unavailable');
        }
        
        const price = data.chart.result[0].meta.regularMarketPrice;
        if (isNaN(price)) {
            throw new Error('Invalid price data');
        }
        
        setCache(marketKey, { price });
        statusElement.classList.remove('fetching', 'no-data');
        statusElement.textContent = formatPrice(price, market.currency);
    } catch (error) {
        console.error('Error:', error.message);
        statusElement.classList.remove('fetching');
        
        if (!cachedData?.price) {
            statusElement.classList.add('no-data');
            statusElement.textContent = 'Failed to fetch data';
        }
    } finally {
        refreshButton.disabled = false;
        refreshButton.classList.remove('loading');
        buttonText.textContent = 'Refresh';
    }
}

function formatPrice(price, currency) {
    return `${currency}${parseFloat(price).toLocaleString('en-IN', {
        maximumFractionDigits: 2
    })}`;
}

// Initialize draggable functionality
function initializeDraggable() {
    const dragHandle = document.getElementById('drag-handle');
    const pinButton = document.getElementById('pin-button');
    const resizeHandle = document.getElementById('resize-handle');
    
    // Pin button click handler
    pinButton.addEventListener('click', async () => {
        isPinned = !isPinned;
        pinButton.classList.toggle('pinned');
        document.body.classList.toggle('pinned');
        
        if (isPinned) {
            try {
                // Get screen dimensions
                const screenWidth = window.screen.availWidth;
                const screenHeight = window.screen.availHeight;
                
                // Use original extension dimensions plus a small buffer for window chrome
                const width = 360;  // 340px body width + 20px buffer for borders
                const height = 320; // 280px content + 40px buffer for window chrome
                
                // Calculate position (20px from top-right corner)
                const left = screenWidth - width - 20;
                const top = 20;
                
                // Create a new window for pinned state with specific dimensions
                const newWindow = await chrome.windows.create({
                    url: 'popup.html?pinned=true', // Add query param to indicate pinned state
                    type: 'popup',
                    width: width,
                    height: height,
                    left: left,
                    top: top,
                    focused: true,
                    state: 'normal'
                });
                
                // Store window id
                localStorage.setItem('pinnedWindowId', newWindow.id);
                
                // Close the popup after creating the new window
                window.close();
            } catch (error) {
                console.error('Error creating pinned window:', error);
                isPinned = false;
                pinButton.classList.remove('pinned');
                document.body.classList.remove('pinned');
            }
        } else {
            try {
                // Get the current window
                const currentWindow = await chrome.windows.getCurrent();
                
                // Close pinned window if exists
                const pinnedWindowId = localStorage.getItem('pinnedWindowId');
                if (pinnedWindowId) {
                    await chrome.windows.remove(parseInt(pinnedWindowId));
                    localStorage.removeItem('pinnedWindowId');
                }
                
                // Reset position and size
                document.body.style.position = '';
                document.body.style.left = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.height = '';
                
                // Close this window if it's a pinned window
                if (currentWindow.type === 'popup') {
                    window.close();
                }
            } catch (error) {
                console.error('Error closing pinned window:', error);
            }
        }
    });

    // Drag functionality
    dragHandle.addEventListener('mousedown', (e) => {
        if (!isPinned) return;
        isDragging = true;
        startX = e.screenX - window.screenX;
        startY = e.screenY - window.screenY;
        e.preventDefault();
    });

    // Resize functionality
    resizeHandle.addEventListener('mousedown', (e) => {
        if (!isPinned) return;
        isResizing = true;
        startX = e.screenX;
        startY = e.screenY;
        startWidth = window.outerWidth;
        startHeight = window.outerHeight;
        e.preventDefault();
        e.stopPropagation();
    });

    // Mouse move handler for both drag and resize
    document.addEventListener('mousemove', async (e) => {
        if (isDragging) {
            try {
                const screenWidth = window.screen.availWidth;
                const screenHeight = window.screen.availHeight;
                
                // Calculate new position
                let newX = e.screenX - startX;
                let newY = e.screenY - startY;
                
                // Get current window size
                const currentWindow = await chrome.windows.getCurrent();
                const windowWidth = currentWindow.width;
                const windowHeight = currentWindow.height;
                
                // Ensure at least 50% of the window remains on screen
                const minVisibleX = -windowWidth / 2;
                const maxVisibleX = screenWidth - windowWidth / 2;
                const minVisibleY = 0; // Keep window from going above screen
                const maxVisibleY = screenHeight - windowHeight / 2;
                
                newX = Math.min(Math.max(minVisibleX, newX), maxVisibleX);
                newY = Math.min(Math.max(minVisibleY, newY), maxVisibleY);
                
                const pinnedWindowId = localStorage.getItem('pinnedWindowId');
                if (pinnedWindowId) {
                    await chrome.windows.update(parseInt(pinnedWindowId), {
                        left: Math.round(newX),
                        top: Math.round(newY),
                        focused: true
                    });
                }
            } catch (error) {
                console.error('Error updating window position:', error);
            }
        } else if (isResizing) {
            try {
                const screenWidth = window.screen.availWidth;
                const screenHeight = window.screen.availHeight;
                
                // Calculate new dimensions
                let newWidth = startWidth + (e.screenX - startX);
                let newHeight = startHeight + (e.screenY - startY);
                
                // Get current window position
                const currentWindow = await chrome.windows.getCurrent();
                const windowLeft = currentWindow.left;
                const windowTop = currentWindow.top;
                
                // Set minimum and maximum sizes
                const minWidth = 300;
                const minHeight = 200;
                
                // Calculate maximum sizes based on screen boundaries and window position
                const maxWidth = screenWidth - windowLeft;
                const maxHeight = screenHeight - windowTop;
                
                // Ensure dimensions are within bounds
                newWidth = Math.min(Math.max(minWidth, newWidth), maxWidth);
                newHeight = Math.min(Math.max(minHeight, newHeight), maxHeight);
                
                // Ensure at least 50% of the window will be visible
                if (windowLeft + newWidth > screenWidth * 1.5) {
                    newWidth = screenWidth * 1.5 - windowLeft;
                }
                if (windowTop + newHeight > screenHeight * 1.5) {
                    newHeight = screenHeight * 1.5 - windowTop;
                }
                
                const pinnedWindowId = localStorage.getItem('pinnedWindowId');
                if (pinnedWindowId) {
                    await chrome.windows.update(parseInt(pinnedWindowId), {
                        width: Math.round(newWidth),
                        height: Math.round(newHeight),
                        focused: true
                    });
                }
            } catch (error) {
                console.error('Error updating window size:', error);
            }
        }
    });

    // Mouse up handler
    document.addEventListener('mouseup', () => {
        isDragging = false;
        isResizing = false;
    });

    // Prevent text selection while dragging
    document.addEventListener('selectstart', (e) => {
        if (isDragging || isResizing) {
            e.preventDefault();
        }
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    const marketSelector = document.getElementById('market-selector');
    if (!marketSelector) {
        console.error('Market selector not found');
        return;
    }

    // Initialize draggable functionality
    initializeDraggable();

    // Check if this is a pinned window
    try {
        const currentWindow = await chrome.windows.getCurrent();
        const pinnedWindowId = localStorage.getItem('pinnedWindowId');
        
        if (pinnedWindowId && currentWindow.id === parseInt(pinnedWindowId)) {
            const pinButton = document.getElementById('pin-button');
            isPinned = true;
            pinButton.classList.add('pinned');
            document.body.classList.add('pinned');
        }
    } catch (error) {
        console.error('Error checking window state:', error);
    }

    const selectedMarket = localStorage.getItem('selectedMarket') || 'SENSEX';
    marketSelector.value = selectedMarket;
    
    fetchMarketValue(selectedMarket);
    
    marketSelector.addEventListener('change', (e) => {
        const selectedMarket = e.target.value;
        localStorage.setItem('selectedMarket', selectedMarket);
        fetchMarketValue(selectedMarket);
    });
    
    // Auto-refresh for open markets
    setInterval(() => {
        const currentMarket = marketSelector.value;
        if (isMarketOpen(MARKETS[currentMarket])) {
            fetchMarketValue(currentMarket);
        }
    }, 60000); // Refresh every minute
    
    // Update DOM content every minute to refresh countdown
    setInterval(() => {
        const currentMarket = document.getElementById('market-selector').value;
        const market = MARKETS[currentMarket];
        updateMarketStatus(market);
        const currentTime = new Date();
        const marketTime = new Date();
        if (market.hours && currentTime < market.hours.start) {
            const openTime = new Date(marketTime);
            openTime.setHours(Math.floor(market.hours.start / 100));
            openTime.setMinutes(market.hours.start % 100);
            return formatTimeDifference(openTime - marketTime);
        }
    }, 60000);
});

// Add refresh button click handler
document.getElementById('refresh-button')?.addEventListener('click', () => {
    const marketSelector = document.getElementById('market-selector');
    if (marketSelector) {
        fetchMarketValue(marketSelector.value);
    }
});