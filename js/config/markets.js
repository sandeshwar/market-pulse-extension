export const MARKET_CATEGORIES = {
    INDIAN: 'Indian Exchanges',
    US: 'US Exchanges',
    CRYPTO: 'Cryptocurrency',
    ASIA: 'Asian Exchanges',
    EUROPE: 'European Exchanges'
};

export const MARKETS = {
    'BSE': {
        symbol: '^BSESN',
        name: 'BSE (Bombay Stock Exchange)',
        indexName: 'SENSEX',
        hours: { start: 915, end: 1530 },
        currency: '₹',
        workDays: [1, 2, 3, 4, 5],
        category: 'INDIAN',
        timezone: 'Asia/Kolkata',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query2.finance.yahoo.com/v1/finance/search?q=SENSEX%20components&quotesCount=30&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^BSESN'
    },
    'NSE': {
        symbol: '^NSEI',
        name: 'NSE (National Stock Exchange)',
        indexName: 'NIFTY 50',
        hours: { start: 915, end: 1530 },
        currency: '₹',
        workDays: [1, 2, 3, 4, 5],
        category: 'INDIAN',
        timezone: 'Asia/Kolkata',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query2.finance.yahoo.com/v1/finance/search?q=NIFTY%2050%20components&quotesCount=50&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^NSEI'
    },
    'NYSE': {
        symbol: '^DJI',
        name: 'NYSE (New York Stock Exchange)',
        indexName: 'Dow Jones Industrial Average',
        hours: { start: 930, end: 1600 },
        currency: '$',
        workDays: [1, 2, 3, 4, 5],
        category: 'US',
        timezone: 'America/New_York',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query2.finance.yahoo.com/v1/finance/search?q=NYSE%20listed%20stocks&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^DJI'
    },
    'NASDAQ_EXCHANGE': {
        symbol: '^IXIC',
        name: 'NASDAQ Stock Exchange',
        indexName: 'NASDAQ Composite',
        hours: { start: 930, end: 1600 },
        currency: '$',
        workDays: [1, 2, 3, 4, 5],
        category: 'US',
        timezone: 'America/New_York',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query2.finance.yahoo.com/v1/finance/search?q=NASDAQ%20listed%20stocks&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^IXIC'
    },
    'LSE': {
        symbol: '^FTSE',
        name: 'LSE (London Stock Exchange)',
        indexName: 'FTSE 100',
        hours: { start: 800, end: 1630 },
        currency: '£',
        workDays: [1, 2, 3, 4, 5],
        category: 'EUROPE',
        timezone: 'Europe/London',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query2.finance.yahoo.com/v1/finance/search?q=FTSE%20100%20components&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^FTSE'
    },
    'TSE': {
        symbol: '^N225',
        name: 'TSE (Tokyo Stock Exchange)',
        indexName: 'Nikkei 225',
        hours: { start: 900, end: 1530 },
        currency: '¥',
        workDays: [1, 2, 3, 4, 5],
        category: 'ASIA',
        timezone: 'Asia/Tokyo',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query2.finance.yahoo.com/v1/finance/search?q=Nikkei%20225%20components&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^N225'
    },
    'HKEX': {
        symbol: '^HSI',
        name: 'HKEX (Hong Kong Stock Exchange)',
        indexName: 'Hang Seng Index',
        hours: { start: 930, end: 1600 },
        currency: 'HK$',
        workDays: [1, 2, 3, 4, 5],
        category: 'ASIA',
        timezone: 'Asia/Hong_Kong',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query2.finance.yahoo.com/v1/finance/search?q=Hang%20Seng%20components&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^HSI'
    },
    'DAX': {
        symbol: '^GDAXI',
        name: 'DAX (Deutsche Börse)',
        indexName: 'DAX',
        hours: { start: 900, end: 1730 },
        currency: '€',
        workDays: [1, 2, 3, 4, 5],
        category: 'EUROPE',
        timezone: 'Europe/Berlin',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
        symbolsUrl: 'https://query2.finance.yahoo.com/v1/finance/search?q=DAX%20components&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^GDAXI'
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
        symbolsUrl: 'https://query2.finance.yahoo.com/v1/finance/search?q=S%26P%20500%20components&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^GSPC'
    }
};
