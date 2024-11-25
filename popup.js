import { MARKETS } from '/js/config/markets.js';
import { updateMarketStatus, isMarketOpen } from '/js/utils/marketUtils.js';
import { getCache, setCache } from '/js/cache.js';

const CACHE_KEY = 'marketCache';
const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');

let currentRequest = null;

async function fetchMarketValue(marketKey) {
    // Generate unique request ID
    const requestId = Date.now();
    currentRequest = requestId;
    
    const market = MARKETS[marketKey];
    const statusElement = document.getElementById('sensex-value');
    const isOpen = updateMarketStatus(market);
    
    // Show cached value first if available
    const cachedData = cache[marketKey];
    if (cachedData) {
        statusElement.textContent = `${market.currency}${parseFloat(cachedData.price).toLocaleString('en-IN', {
            maximumFractionDigits: 2
        })}`;
    } else {
        statusElement.textContent = 'No data available';
        // Hide "No data available" after 3 seconds
        setTimeout(() => {
            if (statusElement.textContent === 'No data available') {
                statusElement.textContent = '';
            }
        }, 3000);
    }
    
    // Don't fetch if market is closed
    if (!isOpen) {
        return;
    }
    
    try {
        statusElement.textContent = 'Fetching...';
        statusElement.classList.add('fetching');
        
        const apiKey = "9T1MJAB2OZ08REYP";
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${market.symbol}&apikey=${apiKey}`;
        
        const response = await fetch(url);
        
        // Check if this is still the current request
        if (currentRequest !== requestId) {
            console.log('Market changed, aborting old request');
            return;
        }
        
        const data = await response.json();
        
        if (!data || !data['Global Quote'] || !data['Global Quote']['05. price']) {
            throw new Error('Market data temporarily unavailable');
        }
        
        const price = parseFloat(data['Global Quote']['05. price']);
        if (isNaN(price)) {
            throw new Error('Invalid price data received');
        }
        
        // Check again before updating UI
        if (currentRequest !== requestId) {
            console.log('Market changed, skipping update');
            return;
        }
        
        // Cache and display new value
        setCache(marketKey, { price });
        statusElement.classList.remove('fetching');
        statusElement.textContent = `${market.currency}${price.toLocaleString('en-IN', {
            maximumFractionDigits: 2
        })}`;
    } catch (error) {
        statusElement.classList.remove('fetching');
        // Only show error if this is still the current request
        if (currentRequest === requestId) {
            console.error('Error:', error.message);
            if (cachedData) {
                statusElement.textContent = `${market.currency}${parseFloat(cachedData.price).toLocaleString('en-IN', {
                    maximumFractionDigits: 2
                })}`;
            } else {
                statusElement.textContent = 'No data available';
                // Hide error message after 3 seconds
                setTimeout(() => {
                    if (statusElement.textContent === 'No data available' && currentRequest === requestId) {
                        statusElement.textContent = '';
                    }
                }, 3000);
            }
        }
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
    
    document.getElementById('refresh-button').addEventListener('click', () => 
        fetchMarketValue(marketSelector.value));
});

// Update DOM content every minute to refresh countdown
setInterval(() => {
    const currentMarket = document.getElementById('market-selector').value;
    const market = MARKETS[currentMarket];
    updateMarketStatus(market);
}, 60000);