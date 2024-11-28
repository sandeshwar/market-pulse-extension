import { MARKETS } from './js/config/markets.js';
import { isMarketOpen, fetchMarketValue } from './js/utils/marketUtils.js';

let startX = 0;
let startY = 0;
let startWidth = 0;
let startHeight = 0;
let marketData = {};

// Get enabled markets from storage
async function getEnabledMarkets() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['enabledMarkets'], (result) => {
            resolve(result.enabledMarkets || ['SENSEX', 'NIFTY']); // Default markets
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

async function updateMarketCard(marketCard) {
    const market = marketCard.dataset.market;
    const valueElement = marketCard.querySelector('.market-value');
    const changeElement = marketCard.querySelector('.market-change');
    const timeElement = marketCard.querySelector('.market-time');

    try {
        valueElement.textContent = 'Loading...';
        const data = await fetchMarketValue(market);
        
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
            
            marketData[market] = { value, previousClose, lastUpdate, isOpen };
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

async function updateAllMarkets() {
    const refreshButton = document.getElementById('refresh-button');
    refreshButton.classList.add('loading');
    
    // Check if any market is open
    const marketCards = document.querySelectorAll('.market-card');
    let anyMarketOpen = false;
    
    for (const card of marketCards) {
        const market = MARKETS[card.dataset.market];
        if (market && isMarketOpen(market)) {
            anyMarketOpen = true;
            break;
        }
    }
    
    // Update button text based on market status
    const buttonText = refreshButton.querySelector('.button-text');
    refreshButton.disabled = !anyMarketOpen;
    buttonText.textContent = anyMarketOpen ? 'Refresh All' : 'Markets Closed';

    // Update all market cards
    const updatePromises = Array.from(marketCards).map(card => updateMarketCard(card));
    await Promise.all(updatePromises);
    
    refreshButton.classList.remove('loading');
    
    // Schedule next update if any market is open
    if (anyMarketOpen) {
        setTimeout(updateAllMarkets, 60000); // Update every minute
    }
}

// Initialize drag functionality
function initDrag() {
    const dragHandle = document.getElementById('drag-handle');
    const body = document.body;

    dragHandle.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = body.getBoundingClientRect();
        startWidth = rect.width;
        startHeight = rect.height;

        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
    });
}

function onDrag(e) {
    if (document.body.classList.contains('pinned')) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        document.body.style.transform = `translate(${dx}px, ${dy}px)`;
    }
}

function stopDrag() {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
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

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize drag and resize
    initDrag();
    initResize();

    // Get enabled markets and create cards
    const marketsGrid = document.querySelector('.markets-grid');
    const enabledMarkets = await getEnabledMarkets();
    
    // Clear existing cards
    marketsGrid.innerHTML = '';
    
    // Create cards for enabled markets
    enabledMarkets.forEach(marketKey => {
        if (MARKETS[marketKey]) {
            marketsGrid.appendChild(createMarketCard(marketKey));
        }
    });
    
    // Add the "Add Market" button
    const addMarketButton = document.createElement('div');
    addMarketButton.className = 'add-market';
    addMarketButton.id = 'add-market';
    addMarketButton.innerHTML = '<span>+</span>';
    marketsGrid.appendChild(addMarketButton);

    // Handle refresh button
    const refreshButton = document.getElementById('refresh-button');
    refreshButton.addEventListener('click', updateAllMarkets);

    // Handle pin button
    const pinButton = document.getElementById('pin-button');
    pinButton.addEventListener('click', () => {
        pinButton.classList.toggle('pinned');
        document.body.classList.toggle('pinned');
    });

    // Handle add market button
    const addMarketBtn = document.getElementById('add-market');
    addMarketBtn.addEventListener('click', () => {
        window.location.href = 'settings.html';
    });

    // Initial update
    updateAllMarkets();
});