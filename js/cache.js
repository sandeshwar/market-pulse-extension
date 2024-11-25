const CACHE_KEY = 'marketCache';

export function getCache() {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
}

export function setCache(marketKey, data) {
    const cache = getCache();
    cache[marketKey] = {
        ...data,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}
