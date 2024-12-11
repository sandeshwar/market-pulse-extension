export function getMarketTime(timezone) {
    try {
        const date = new Date();
        // Convert to market timezone and return a Date object
        const marketTime = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
        return marketTime;
    } catch (error) {
        console.error('Error converting timezone:', error);
        // Fallback to local time if timezone conversion fails
        return new Date();
    }
}

export function calculateTimeUntilOpen(market) {
    if (!market.timezone) {
        console.error('Market timezone not defined:', market.name);
        return null;
    }

    const marketTime = getMarketTime(market.timezone);
    const day = marketTime.getDay();
    const hours = marketTime.getHours();
    const minutes = marketTime.getMinutes();

    // If weekend, calculate time until Monday
    if (!market.workDays.includes(day)) {
        const daysUntilMonday = (8 - day) % 7;
        const nextOpen = new Date(marketTime);
        nextOpen.setDate(nextOpen.getDate() + daysUntilMonday);
        nextOpen.setHours(Math.floor(market.hours.start / 100));
        nextOpen.setMinutes(market.hours.start % 100);
        
        const diff = nextOpen - marketTime;
        return formatTimeDifference(diff);
    }

    // If before opening time
    const currentTime = hours * 100 + minutes;
    if (currentTime < market.hours.start) {
        const openTime = new Date(marketTime);
        openTime.setHours(Math.floor(market.hours.start / 100));
        openTime.setMinutes(market.hours.start % 100);
        return formatTimeDifference(openTime - marketTime);
    }

    // If after closing time
    if (currentTime > market.hours.end) {
        const nextOpen = new Date(marketTime);
        nextOpen.setDate(nextOpen.getDate() + 1);
        nextOpen.setHours(Math.floor(market.hours.start / 100));
        nextOpen.setMinutes(market.hours.start % 100);
        return formatTimeDifference(nextOpen - marketTime);
    }

    return null; // Market is open
}

export function formatTimeDifference(ms) {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return parts.join(' ');
}

export function isMarketOpen(market) {
    if (!market.timezone) {
        console.error('Market timezone not defined:', market.name);
        return false;
    }

    const marketTime = getMarketTime(market.timezone);
    const day = marketTime.getDay();
    const hours = marketTime.getHours();
    const minutes = marketTime.getMinutes();
    const currentTime = hours * 100 + minutes;

    // Check if it's a working day
    if (!market.workDays.includes(day)) {
        return false;
    }

    // Check if within trading hours
    return currentTime >= market.hours.start && currentTime <= market.hours.end;
}
