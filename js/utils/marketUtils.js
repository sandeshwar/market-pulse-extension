import { getMarketTime } from './dateUtils.js';
import { MARKETS } from '../config/markets.js';

export async function fetchMarketValue(marketKey) {
    if (!MARKETS[marketKey]) {
        console.error(`Invalid market key: ${marketKey}`);
        return null;
    }

    const market = MARKETS[marketKey];
    const isOpen = isMarketOpen(market);
    
    try {
        // Construct the Yahoo Finance API URL
        const symbol = market.symbol;
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d&includePrePost=false&events=div%2Csplit`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data?.chart?.result?.[0]?.meta) {
            throw new Error('Invalid data format');
        }

        const result = data.chart.result[0];
        const meta = result.meta;
        const regularMarketPrice = meta.regularMarketPrice;
        const previousClose = meta.previousClose || meta.chartPreviousClose;
        const regularMarketTime = meta.regularMarketTime;
        
        // Get either current price or previous close based on market status
        const value = isOpen ? regularMarketPrice : previousClose;
        const timestamp = regularMarketTime * 1000; // Convert to milliseconds

        if (typeof value !== 'number') {
            throw new Error('Invalid price data');
        }

        return {
            value,
            previousClose,
            lastUpdate: timestamp,
            isOpen
        };
    } catch (error) {
        console.error('Error fetching market value:', error);
        return null;
    }
}

export function updateMarketStatus(market) {
    if (!market) {
        console.error('Invalid market configuration');
        return false;
    }

    const isOpen = isMarketOpen(market);
    const statusElement = document.getElementById('status-line');
    
    if (!statusElement) {
        console.error('Status element not found');
        return isOpen;
    }

    // Clear any existing status display
    statusElement.innerHTML = '';
    
    return isOpen;
}

export function isMarketOpen(market) {
    try {
        if (!market?.timezone || !market?.hours) {
            console.error('Invalid market configuration:', market);
            return false;
        }

        const marketTime = getMarketTime(market.timezone);
        if (!(marketTime instanceof Date)) {
            console.error('Invalid date object returned');
            return false;
        }

        const day = marketTime.getDay();
        if (!market.workDays?.includes(day)) {
            return false;
        }

        const currentTime = marketTime.getHours() * 100 + marketTime.getMinutes();
        return currentTime >= market.hours.start && currentTime <= market.hours.end;
    } catch (error) {
        console.error('Error checking market status:', error);
        return false;
    }
}

export function calculateTimeUntilOpen(market) {
    try {
        if (!market?.timezone || !market?.hours) {
            return 'Unknown';
        }

        const marketTime = getMarketTime(market.timezone);
        if (!(marketTime instanceof Date)) {
            return 'Unknown';
        }

        const day = marketTime.getDay();
        const currentTime = marketTime.getHours() * 100 + marketTime.getMinutes();
        
        // If it's a working day but before market opens
        if (market.workDays.includes(day) && currentTime < market.hours.start) {
            const minutesUntilOpen = 
                (Math.floor(market.hours.start / 100) * 60 + market.hours.start % 100) -
                (marketTime.getHours() * 60 + marketTime.getMinutes());
            
            const hours = Math.floor(minutesUntilOpen / 60);
            const minutes = minutesUntilOpen % 60;
            return `${hours}h ${minutes}m`;
        }
        
        // Find next working day
        let nextDay = day;
        let daysToAdd = 1;
        
        while (daysToAdd <= 7) {
            nextDay = (nextDay + 1) % 7;
            if (market.workDays.includes(nextDay)) {
                break;
            }
            daysToAdd++;
        }
        
        if (daysToAdd > 7) {
            return 'Unknown';
        }
        
        return `${daysToAdd} day${daysToAdd > 1 ? 's' : ''}`;
    } catch (error) {
        console.error('Error calculating time until open:', error);
        return 'Unknown';
    }
}