import { MARKETS } from './js/config/markets.js';

// Get enabled markets from storage
async function getEnabledMarkets() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['enabledMarkets'], (result) => {
            resolve(result.enabledMarkets || ['SENSEX', 'NIFTY50']);
        });
    });
}

// Get primary market from storage
async function getPrimaryMarket() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['primaryMarket'], (result) => {
            resolve(result.primaryMarket || '');
        });
    });
}

// Save settings to storage
async function saveSettings(enabledMarkets, primaryMarket) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({
            enabledMarkets: enabledMarkets,
            primaryMarket: primaryMarket
        }, resolve);
    });
}

// Initialize the options page
async function initializeOptions() {
    const marketGrid = document.getElementById('market-grid');
    const primaryMarketSelect = document.getElementById('primary-market');
    const saveButton = document.getElementById('save');

    const enabledMarkets = await getEnabledMarkets();
    const primaryMarket = await getPrimaryMarket();

    // Populate primary market select
    Object.entries(MARKETS).forEach(([key, market]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = market.name;
        if (key === primaryMarket) {
            option.selected = true;
        }
        primaryMarketSelect.appendChild(option);
    });

    // Create market cards
    Object.entries(MARKETS).forEach(([key, market]) => {
        const card = document.createElement('div');
        card.className = `market-card ${enabledMarkets.includes(key) ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="market-info">
                <div class="market-name">${market.name}</div>
                <div class="market-location">${market.currency} • ${market.category}</div>
            </div>
            <input type="checkbox" class="checkbox" value="${key}" ${enabledMarkets.includes(key) ? 'checked' : ''}>
        `;
        marketGrid.appendChild(card);

        // Add click handler for the entire card
        card.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                const checkbox = card.querySelector('.checkbox');
                checkbox.checked = !checkbox.checked;
                card.classList.toggle('selected', checkbox.checked);
            }
        });

        // Add change handler for checkbox
        const checkbox = card.querySelector('.checkbox');
        checkbox.addEventListener('change', () => {
            card.classList.toggle('selected', checkbox.checked);
        });
    });

    // Save button handler
    saveButton.addEventListener('click', async () => {
        const selectedMarkets = Array.from(marketGrid.querySelectorAll('.checkbox:checked'))
            .map(checkbox => checkbox.value);
        const selectedPrimaryMarket = primaryMarketSelect.value;

        if (!selectedPrimaryMarket) {
            alert('Please select a primary market');
            return;
        }

        if (selectedMarkets.length === 0) {
            alert('Please select at least one market to track');
            return;
        }

        if (!selectedMarkets.includes(selectedPrimaryMarket)) {
            alert('Primary market must be included in selected markets');
            primaryMarketSelect.focus();
            return;
        }

        await saveSettings(selectedMarkets, selectedPrimaryMarket);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.textContent = 'Settings saved successfully!';
        successMessage.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
            animation: fadeOut 3s forwards;
        `;
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeOptions);
