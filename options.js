// Options page functionality will be implemented here
import { MARKETS } from './js/config/markets.js';

// Get currently enabled markets from storage
async function getEnabledMarkets() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['enabledMarkets'], (result) => {
            resolve(result.enabledMarkets || ['SENSEX', 'NIFTY']);
        });
    });
}

// Save enabled markets to storage
async function saveEnabledMarkets(markets) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ enabledMarkets: markets }, () => {
            resolve();
        });
    });
}

// Create a market item element
function createMarketItem(marketKey, marketInfo, isEnabled) {
    const item = document.createElement('div');
    item.className = `market-item ${isEnabled ? 'selected' : ''}`;
    item.dataset.market = marketKey;

    const checkbox = document.createElement('div');
    checkbox.className = `checkbox ${isEnabled ? 'checked' : ''}`;

    const info = document.createElement('div');
    info.className = 'market-info';

    const name = document.createElement('div');
    name.className = 'market-name';
    name.textContent = marketInfo.name;

    const details = document.createElement('div');
    details.className = 'market-details';
    details.textContent = `${marketInfo.currency} • ${marketInfo.timezone}`;

    info.appendChild(name);
    info.appendChild(details);

    item.appendChild(checkbox);
    item.appendChild(info);

    return item;
}

// Initialize the options page
async function initializeOptions() {
    const marketGrid = document.getElementById('marketGrid');
    const saveButton = document.getElementById('saveButton');
    const saveStatus = document.getElementById('saveStatus');
    const enabledMarkets = await getEnabledMarkets();

    // Create market items
    Object.entries(MARKETS).forEach(([key, info]) => {
        const isEnabled = enabledMarkets.includes(key);
        const marketItem = createMarketItem(key, info, isEnabled);
        
        // Add click handler
        marketItem.addEventListener('click', () => {
            marketItem.classList.toggle('selected');
            marketItem.querySelector('.checkbox').classList.toggle('checked');
        });

        marketGrid.appendChild(marketItem);
    });

    // Save button handler
    saveButton.addEventListener('click', async () => {
        const selectedMarkets = Array.from(marketGrid.querySelectorAll('.market-item.selected'))
            .map(item => item.dataset.market);

        await saveEnabledMarkets(selectedMarkets);

        // Show save status
        saveStatus.classList.add('visible');
        setTimeout(() => {
            saveStatus.classList.remove('visible');
        }, 2000);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeOptions);
