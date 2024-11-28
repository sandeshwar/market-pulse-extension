import { getMarketTime } from './dateUtils.js';

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

    if (isOpen) {
        statusElement.innerHTML = '<span class="status-open">Market Open</span>';
    } else {
        const timeUntilOpen = calculateTimeUntilOpen(market);
        statusElement.innerHTML = `
            <span class="status-closed">Market Closed</span><br>
            <span class="countdown">Opens in: ${timeUntilOpen}</span>
        `;
    }
    
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