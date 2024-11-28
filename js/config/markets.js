export const MARKETS = {
    'SENSEX': {
        symbol: '^BSESN',
        name: 'SENSEX',
        timezone: 'Asia/Kolkata',
        hours: { start: 915, end: 1530 },
        currency: '₹',
        workDays: [1, 2, 3, 4, 5]
    },
    'NIFTY': {
        symbol: '^NSEI',
        name: 'NIFTY 50',
        timezone: 'Asia/Kolkata',
        hours: { start: 915, end: 1530 },
        currency: '₹',
        workDays: [1, 2, 3, 4, 5]
    },
    'NIFTY50': {  // Alias for NIFTY
        symbol: '^NSEI',
        name: 'NIFTY 50',
        timezone: 'Asia/Kolkata',
        hours: { start: 915, end: 1530 },
        currency: '₹',
        workDays: [1, 2, 3, 4, 5]
    },
    'DJIA': {
        symbol: '^DJI',
        name: 'Dow Jones',
        timezone: 'America/New_York',
        hours: { start: 930, end: 1600 },
        currency: '$',
        workDays: [1, 2, 3, 4, 5]
    },
    'SNP500': {
        symbol: '^GSPC',
        name: 'S&P 500',
        timezone: 'America/New_York',
        hours: { start: 930, end: 1600 },
        currency: '$',
        workDays: [1, 2, 3, 4, 5]
    },
    'FTSE': {
        symbol: '^FTSE',
        name: 'FTSE 100',
        timezone: 'Europe/London',
        hours: { start: 800, end: 1630 },
        currency: '£',
        workDays: [1, 2, 3, 4, 5]
    },
    'NIKK': {
        symbol: '^N225',
        name: 'Nikkei 225',
        timezone: 'Asia/Tokyo',
        hours: { start: 900, end: 1510 },
        currency: '¥',
        workDays: [1, 2, 3, 4, 5]
    }
};
