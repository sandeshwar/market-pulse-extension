export const MARKET_CATEGORIES = {
    'ASIA': 'Asian Markets',
    'US': 'US Markets',
    'EUROPE': 'European Markets'
};

export const MARKETS = {
    'SENSEX': {
        symbol: '^BSESN',
        name: 'SENSEX',
        timezone: 'Asia/Kolkata',
        hours: { start: 915, end: 1530 },
        currency: '₹',
        workDays: [1, 2, 3, 4, 5],
        category: 'ASIA'
    },
    'NIFTY50': {  
        symbol: '^NSEI',
        name: 'NIFTY 50',
        timezone: 'Asia/Kolkata',
        hours: { start: 915, end: 1530 },
        currency: '₹',
        workDays: [1, 2, 3, 4, 5],
        category: 'ASIA'
    },
    'NIKKEI': {
        symbol: '^N225',
        name: 'Nikkei 225',
        timezone: 'Asia/Tokyo',
        hours: { start: 900, end: 1530 },
        currency: '¥',
        workDays: [1, 2, 3, 4, 5],
        category: 'ASIA'
    },
    'HANG_SENG': {
        symbol: '^HSI',
        name: 'Hang Seng',
        timezone: 'Asia/Hong_Kong',
        hours: { start: 930, end: 1600 },
        currency: 'HK$',
        workDays: [1, 2, 3, 4, 5],
        category: 'ASIA'
    },
    'DJIA': {
        symbol: '^DJI',
        name: 'Dow Jones',
        timezone: 'America/New_York',
        hours: { start: 930, end: 1600 },
        currency: '$',
        workDays: [1, 2, 3, 4, 5],
        category: 'US'
    },
    'SNP500': {
        symbol: '^GSPC',
        name: 'S&P 500',
        timezone: 'America/New_York',
        hours: { start: 930, end: 1600 },
        currency: '$',
        workDays: [1, 2, 3, 4, 5],
        category: 'US'
    },
    'NASDAQ': {
        symbol: '^IXIC',
        name: 'NASDAQ',
        timezone: 'America/New_York',
        hours: { start: 930, end: 1600 },
        currency: '$',
        workDays: [1, 2, 3, 4, 5],
        category: 'US'
    },
    'FTSE': {
        symbol: '^FTSE',
        name: 'FTSE 100',
        timezone: 'Europe/London',
        hours: { start: 800, end: 1630 },
        currency: '£',
        workDays: [1, 2, 3, 4, 5],
        category: 'EUROPE'
    },
    'DAX': {
        symbol: '^GDAXI',
        name: 'DAX',
        timezone: 'Europe/Berlin',
        hours: { start: 900, end: 1730 },
        currency: '€',
        workDays: [1, 2, 3, 4, 5],
        category: 'EUROPE'
    }
};
