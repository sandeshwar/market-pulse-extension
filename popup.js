import { MARKETS } from './js/config/markets.js';
import { updateMarketStatus, isMarketOpen } from './js/utils/marketUtils.js';
import { getCache, setCache } from './js/cache.js';

const CACHE_KEY = 'marketCache';
let currentRequest = null;

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

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const marketSelector = document.getElementById('market-selector');
    if (!marketSelector) {
        console.error('Market selector not found');
        return;
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