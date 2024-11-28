const CACHE_KEY = 'marketCache';
const DEFAULT_EXPIRATION_MINUTES = 5;

export function getCache() {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const now = new Date().getTime();
    
    // Remove expired entries
    Object.keys(cache).forEach(key => {
        if (cache[key].expires && new Date(cache[key].expires).getTime() < now) {
            delete cache[key];
        }
    });
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    return cache;
}

export function setCache(marketKey, data) {
    if (!marketKey || !data) return;
    
    const cache = getCache();
    cache[marketKey] = {
        ...data,
        timestamp: new Date().toISOString(),
        expires: new Date(Date.now() + DEFAULT_EXPIRATION_MINUTES * 60000).toISOString()
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}
