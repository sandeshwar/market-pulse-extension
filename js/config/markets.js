export const MARKET_CATEGORIES = {
    INDIAN: 'Indian Markets',
    US: 'US Markets',
    CRYPTO: 'Cryptocurrency',
    ASIA: 'Asian Markets',
    EUROPE: 'European Markets'
};

export const MARKETS = {
    'SENSEX': {
        symbol: '^BSESN',
        name: 'SENSEX',
        hours: { start: 915, end: 1530 },
        currency: '₹',
        workDays: [1, 2, 3, 4, 5],
        category: 'INDIAN',
        timezone: 'Asia/Kolkata',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&lang=en-US&region=IN&scrIds=all_stocks_in_bse&start=0&count=100',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^BSESN'
    },
    'NIFTY50': {
        symbol: '^NSEI',
        name: 'NIFTY 50',
        hours: { start: 915, end: 1530 },
        currency: '₹',
        workDays: [1, 2, 3, 4, 5],
        category: 'INDIAN',
        timezone: 'Asia/Kolkata',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&lang=en-US&region=IN&scrIds=nifty50_stocks&start=0&count=50',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^NSEI'
    },
    'NIKKEI': {
        symbol: '^N225',
        name: 'Nikkei 225',
        hours: { start: 900, end: 1530 },
        currency: '¥',
        workDays: [1, 2, 3, 4, 5],
        category: 'ASIA',
        timezone: 'Asia/Tokyo',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&lang=en-US&region=JP&scrIds=nikkei225_stocks&start=0&count=225',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^N225'
    },
    'HANG_SENG': {
        symbol: '^HSI',
        name: 'Hang Seng',
        hours: { start: 930, end: 1600 },
        currency: 'HK$',
        workDays: [1, 2, 3, 4, 5],
        category: 'ASIA',
        timezone: 'Asia/Hong_Kong',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&lang=en-US&region=HK&scrIds=hangseng_stocks&start=0&count=50',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^HSI'
    },
    'DJIA': {
        symbol: '^DJI',
        name: 'Dow Jones',
        hours: { start: 930, end: 1600 },
        currency: '$',
        workDays: [1, 2, 3, 4, 5],
        category: 'US',
        timezone: 'America/New_York',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&lang=en-US&region=US&scrIds=dow_jones_stocks&start=0&count=30',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^DJI'
    },
    'SNP500': {
        symbol: '^GSPC',
        name: 'S&P 500',
        hours: { start: 930, end: 1600 },
        currency: '$',
        workDays: [1, 2, 3, 4, 5],
        category: 'US',
        timezone: 'America/New_York',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&lang=en-US&region=US&scrIds=sp500_stocks&start=0&count=500',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^GSPC'
    },
    'NASDAQ': {
        symbol: '^IXIC',
        name: 'NASDAQ',
        hours: { start: 930, end: 1600 },
        currency: '$',
        workDays: [1, 2, 3, 4, 5],
        category: 'US',
        timezone: 'America/New_York',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&lang=en-US&region=US&scrIds=nasdaq_stocks&start=0&count=100',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^IXIC'
    },
    'FTSE': {
        symbol: '^FTSE',
        name: 'FTSE 100',
        hours: { start: 800, end: 1630 },
        currency: '£',
        workDays: [1, 2, 3, 4, 5],
        category: 'EUROPE',
        timezone: 'Europe/London',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&lang=en-US&region=GB&scrIds=ftse100_stocks&start=0&count=100',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^FTSE'
    },
    'DAX': {
        symbol: '^GDAXI',
        name: 'DAX',
        hours: { start: 900, end: 1730 },
        currency: '€',
        workDays: [1, 2, 3, 4, 5],
        category: 'EUROPE',
        timezone: 'Europe/Berlin',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&lang=en-US&region=DE&scrIds=dax_stocks&start=0&count=40',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^GDAXI'
    }
};
