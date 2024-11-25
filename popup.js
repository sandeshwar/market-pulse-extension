import { MARKETS } from './js/config/markets.js';
import { updateMarketStatus, isMarketOpen } from './js/utils/marketUtils.js';
import { getCache, setCache } from './js/cache.js';

const CACHE_KEY = 'marketCache';
const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');

let currentRequest = null;

async function fetchMarketValue(marketKey) {
    const requestId = Date.now();
    currentRequest = requestId;
    
    const market = MARKETS[marketKey];
    const statusElement = document.getElementById('sensex-value');
    const refreshButton = document.getElementById('refresh-button');
    const buttonText = refreshButton.querySelector('.button-text');
    const isOpen = updateMarketStatus(market);
    
    // Remove loading state if it was there from initial load
    statusElement.classList.remove('fetching');
    
    // Show cached value first if available
    const cachedData = getCache()[marketKey];
    if (cachedData) {
        statusElement.classList.remove('no-data');
        statusElement.textContent = `${market.currency}${parseFloat(cachedData.price).toLocaleString('en-IN', {
            maximumFractionDigits: 2
        })}`;
    }
    
    // Don't fetch if market is closed
    if (!isOpen) {
        if (!cachedData) {
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
        
        const apiKey = "9T1MJAB2OZ08REYP";
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${market.symbol}&apikey=${apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Check if this is still the current request
        if (currentRequest !== requestId) return;
        
        if (!data || !data['Global Quote'] || !data['Global Quote']['05. price']) {
            throw new Error('Market data unavailable');
        }
        
        const price = parseFloat(data['Global Quote']['05. price']);
        if (isNaN(price)) {
            throw new Error('Invalid price data');
        }
        
        setCache(marketKey, { price });
        statusElement.classList.remove('fetching', 'no-data');
        statusElement.textContent = `${market.currency}${price.toLocaleString('en-IN', {
            maximumFractionDigits: 2
        })}`;
    } catch (error) {
        console.error('Error:', error.message);
        statusElement.classList.remove('fetching');
        
        if (!cachedData) {
            statusElement.classList.add('no-data');
            statusElement.textContent = 'Failed to fetch data';
        }
    } finally {
        refreshButton.disabled = false;
        refreshButton.classList.remove('loading');
        buttonText.textContent = 'Refresh';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const marketSelector = document.getElementById('market-selector');
    const selectedMarket = localStorage.getItem('selectedMarket') || 'SENSEX';
    marketSelector.value = selectedMarket;
    
    fetchMarketValue(selectedMarket);
    
    marketSelector.addEventListener('change', (e) => {
        const selectedMarket = e.target.value;
        localStorage.setItem('selectedMarket', selectedMarket);
        fetchMarketValue(selectedMarket);
    });
    
    setInterval(() => {
        const currentMarket = marketSelector.value;
        if (isMarketOpen(MARKETS[currentMarket])) {
            fetchMarketValue(currentMarket);
        }
    }, 60000);
    
    document.getElementById('refresh-button').addEventListener('click', () => {
        const marketSelector = document.getElementById('market-selector');
        fetchMarketValue(marketSelector.value);
    });
});

// Update DOM content every minute to refresh countdown
setInterval(() => {
    const currentMarket = document.getElementById('market-selector').value;
    const market = MARKETS[currentMarket];
    updateMarketStatus(market);
}, 60000);