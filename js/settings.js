import { MARKETS } from './config/markets.js';

// Default market configuration
const DEFAULT_MARKETS = ['SENSEX', 'NIFTY'];

// Get enabled markets from storage
async function getEnabledMarkets() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['enabledMarkets'], (result) => {
            resolve(result.enabledMarkets || DEFAULT_MARKETS);
        });
    });
}

// Save enabled markets to storage
async function saveEnabledMarkets(markets) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ enabledMarkets: markets }, resolve);
    });
}

// Create a market list item
function createMarketItem(key, market, enabled) {
    const item = document.createElement('div');
    item.className = 'market-item';
    item.innerHTML = `
        <div class="market-info">
            <div class="market-icon">📈</div>
            <div class="market-details">
                <div class="market-name">${market.name}</div>
                <div class="market-description">${market.description || market.symbol}</div>
            </div>
        </div>
        <label class="toggle-switch">
            <input type="checkbox" data-market="${key}" ${enabled ? 'checked' : ''}>
            <span class="toggle-slider"></span>
        </label>
    `;
    return item;
}

// Initialize the settings page
async function initializeSettings() {
    const marketList = document.getElementById('market-list');
    const enabledMarkets = await getEnabledMarkets();
    
    // Create market items
    Object.entries(MARKETS).forEach(([key, market]) => {
        const isEnabled = enabledMarkets.includes(key);
        const marketItem = createMarketItem(key, market, isEnabled);
        marketList.appendChild(marketItem);
    });
    
    // Handle back button
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.href = 'popup.html';
    });
    
    // Handle save button
    document.getElementById('save-button').addEventListener('click', async () => {
        const checkboxes = document.querySelectorAll('input[data-market]');
        const enabledMarkets = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.dataset.market);
        
        if (enabledMarkets.length === 0) {
            alert('Please select at least one market');
            return;
        }
        
        await saveEnabledMarkets(enabledMarkets);
        window.location.href = 'popup.html';
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSettings);
