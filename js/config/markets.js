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
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/search?q=BSE%3A*&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&enableCb=true&region=IN',
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
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/search?q=NSE%3A*&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&enableCb=true&region=IN',
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
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/search?q=TSE%3A*&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&enableCb=true&region=JP',
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
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/search?q=HKEX%3A*&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&enableCb=true&region=HK',
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
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/search?q=NYSE%3A*&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&enableCb=true&region=US',
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
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/search?q=SPX%3A*&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&enableCb=true&region=US',
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
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/search?q=NASDAQ%3A*&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&enableCb=true&region=US',
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
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/search?q=LSE%3A*&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&enableCb=true&region=GB',
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
        symbolsUrl: 'https://query1.finance.yahoo.com/v1/finance/search?q=XETR%3A*&quotesCount=100&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&enableCb=true&region=DE',
        dataUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/^GDAXI'
    }
};
