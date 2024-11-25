import { getMarketTime, calculateTimeUntilOpen } from './dateUtils.js';

export function updateMarketStatus(market) {
    const isOpen = isMarketOpen(market);
    const timeUntilOpen = !isOpen ? calculateTimeUntilOpen(market) : null;
    
    const statusElement = document.getElementById('status-line');
    statusElement.innerHTML = isOpen ? 
        '<span class="status-open">Market Open</span>' :
        `<span class="status-closed">Market Closed</span><br>
         <span class="countdown">Opens in: ${timeUntilOpen}</span>`;
    
    return isOpen;
}

export function isMarketOpen(market) {
    const marketTime = new Date(getMarketTime(market.timezone));
    const day = marketTime.getDay();
    const hours = marketTime.getHours();
    const minutes = marketTime.getMinutes();
    const currentTime = hours * 100 + minutes;

    if (!market.workDays.includes(day)) return false;
    return currentTime >= market.hours.start && currentTime <= market.hours.end;
}
