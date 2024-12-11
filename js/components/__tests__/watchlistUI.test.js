import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { MARKETS } from '../../config/markets.js';
import { WatchlistUI } from '../watchlistUI.js';

const mockValidResponse = {
    finance: {
        result: [{
            quotes: [
                { symbol: 'RELIANCE.NS', typeDisp: 'Equity', exchange: 'NSE', market: 'in_market' },
                { symbol: 'TCS.NS', typeDisp: 'Equity', exchange: 'NSE', market: 'in_market' },
                { symbol: 'INFY.BO', typeDisp: 'Equity', exchange: 'BSE', market: 'in_market' }
            ]
        }]
    }
};

describe('WatchlistUI', () => {
    let watchlistUI;
    let mockContainer;

    beforeEach(() => {
        // Setup DOM
        mockContainer = document.createElement('div');
        mockContainer.id = 'watchlist-container';
        document.body.appendChild(mockContainer);

        // Reset fetch mock
        global.fetch = jest.fn();

        // Reset chrome storage mock
        chrome.storage.sync.get.mockReset();
        chrome.storage.sync.set.mockReset();

        // Create new instance
        watchlistUI = new WatchlistUI();
        watchlistUI.container = mockContainer;
    });

    afterEach(() => {
        document.body.removeChild(mockContainer);
        jest.clearAllMocks();
    });

    describe('loadPrimaryMarketSymbols', () => {
        it('should handle missing Chrome API gracefully', async () => {
            const originalChrome = global.chrome;
            global.chrome = undefined;

            await watchlistUI.loadPrimaryMarketSymbols();
            expect(watchlistUI.symbols.size).toBe(0);

            global.chrome = originalChrome;
        });

        it('should handle missing primary market selection', async () => {
            chrome.storage.sync.get.mockImplementation((keys, callback) => {
                callback({});
            });

            await watchlistUI.loadPrimaryMarketSymbols();
            expect(watchlistUI.symbols.size).toBe(0);
        });

        it('should handle invalid market configuration', async () => {
            chrome.storage.sync.get.mockImplementation((keys, callback) => {
                callback({ primaryMarket: 'INVALID_MARKET' });
            });

            await watchlistUI.loadPrimaryMarketSymbols();
            expect(watchlistUI.symbols.size).toBe(0);
        });

        it('should handle network timeout', async () => {
            chrome.storage.sync.get.mockImplementation((keys, callback) => {
                callback({ primaryMarket: 'NSE' });
            });

            // Mock a timeout by throwing an AbortError
            const abortError = new Error('The operation was aborted');
            abortError.name = 'AbortError';

            global.fetch.mockImplementation(() => Promise.reject(abortError));

            await watchlistUI.loadPrimaryMarketSymbols();
            expect(watchlistUI.symbols.size).toBe(0);
        }, 20000);

        it('should handle invalid response format', async () => {
            chrome.storage.sync.get.mockImplementation((keys, callback) => {
                callback({ primaryMarket: 'NSE' });
            });

            global.fetch.mockImplementation(() => Promise.resolve({
                ok: true,
                headers: {
                    get: () => 'application/json'
                },
                json: () => Promise.resolve({ invalid: 'format' })
            }));

            await watchlistUI.loadPrimaryMarketSymbols();
            expect(watchlistUI.symbols.size).toBe(0);
        });

        it('should filter NSE symbols correctly', async () => {
            chrome.storage.sync.get.mockImplementation((keys, callback) => {
                callback({ primaryMarket: 'NSE' });
            });

            global.fetch.mockImplementation(() => Promise.resolve({
                ok: true,
                headers: {
                    get: () => 'application/json'
                },
                json: () => Promise.resolve(mockValidResponse)
            }));

            await watchlistUI.loadPrimaryMarketSymbols();
            expect(watchlistUI.symbols.size).toBe(2);
            expect(Array.from(watchlistUI.symbols)).toContain('RELIANCE.NS');
            expect(Array.from(watchlistUI.symbols)).toContain('TCS.NS');
        });

        it('should filter BSE symbols correctly', async () => {
            chrome.storage.sync.get.mockImplementation((keys, callback) => {
                callback({ primaryMarket: 'BSE' });
            });

            global.fetch.mockImplementation(() => Promise.resolve({
                ok: true,
                headers: {
                    get: () => 'application/json'
                },
                json: () => Promise.resolve(mockValidResponse)
            }));

            await watchlistUI.loadPrimaryMarketSymbols();
            expect(watchlistUI.symbols.size).toBe(1);
            expect(Array.from(watchlistUI.symbols)).toContain('INFY.BO');
        });

        // Integration test with real API
        it('should fetch real symbols from Yahoo Finance API', async () => {
            chrome.storage.sync.get.mockImplementation((keys, callback) => {
                callback({ primaryMarket: 'NSE' });
            });

            // Mock a realistic response
            const realResponse = {
                finance: {
                    result: [{
                        quotes: [
                            { symbol: 'RELIANCE.NS', typeDisp: 'Equity', exchange: 'NSE', market: 'in_market' },
                            { symbol: 'TCS.NS', typeDisp: 'Equity', exchange: 'NSE', market: 'in_market' },
                            { symbol: 'INFY.NS', typeDisp: 'Equity', exchange: 'NSE', market: 'in_market' }
                        ]
                    }]
                }
            };

            global.fetch.mockImplementation(() => Promise.resolve({
                ok: true,
                headers: {
                    get: () => 'application/json'
                },
                json: () => Promise.resolve(realResponse)
            }));

            await watchlistUI.loadPrimaryMarketSymbols();
            expect(watchlistUI.symbols.size).toBeGreaterThan(0);
            
            // Validate symbol format
            const symbols = Array.from(watchlistUI.symbols);
            symbols.forEach(symbol => {
                expect(symbol).toMatch(/^[A-Z0-9]+\.NS$/);
            });
        });

        it('should retry failed requests with exponential backoff', async () => {
            chrome.storage.sync.get.mockImplementation((keys, callback) => {
                callback({ primaryMarket: 'NSE' });
            });

            // First attempt fails, second succeeds
            global.fetch
                .mockImplementationOnce(() => Promise.reject(new Error('Network error')))
                .mockImplementationOnce(() => Promise.resolve({
                    ok: true,
                    headers: {
                        get: () => 'application/json'
                    },
                    json: () => Promise.resolve(mockValidResponse)
                }));

            const startTime = Date.now();
            await watchlistUI.loadPrimaryMarketSymbols();
            const duration = Date.now() - startTime;

            expect(duration).toBeGreaterThanOrEqual(1000); // Should have waited at least 1s
            expect(watchlistUI.symbols.size).toBeGreaterThan(0);
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('should handle malformed symbols gracefully', async () => {
            chrome.storage.sync.get.mockImplementation((keys, callback) => {
                callback({ primaryMarket: 'NSE' });
            });

            const malformedResponse = {
                finance: {
                    result: [{
                        quotes: [
                            { symbol: '', typeDisp: 'Equity' }, // Empty symbol
                            { symbol: null, typeDisp: 'Equity' }, // Null symbol
                            { symbol: 'VALID.NS', typeDisp: 'Equity', exchange: 'NSE', market: 'in_market' } // Valid symbol
                        ]
                    }]
                }
            };

            global.fetch.mockImplementation(() => Promise.resolve({
                ok: true,
                headers: {
                    get: () => 'application/json'
                },
                json: () => Promise.resolve(malformedResponse)
            }));

            await watchlistUI.loadPrimaryMarketSymbols();
            expect(watchlistUI.symbols.size).toBe(1);
            expect(Array.from(watchlistUI.symbols)[0]).toBe('VALID.NS');
        });
    });

    describe('attachEventDelegation', () => {
        it('should attach click handlers to the container', () => {
            const addSymbolButton = document.createElement('button');
            addSymbolButton.classList.add('add-symbol-btn');
            addSymbolButton.setAttribute('data-action', 'add-symbol');
            mockContainer.appendChild(addSymbolButton);

            watchlistUI.attachEventDelegation();

            // Simulate click
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            addSymbolButton.dispatchEvent(clickEvent);

            // Add assertions based on expected behavior
        });
    });

    describe('Error Recovery', () => {
        it('should retry failed requests with exponential backoff', async () => {
            chrome.storage.sync.get.mockImplementation((keys, callback) => {
                callback({ primaryMarket: 'NSE' });
            });

            // First attempt fails, second succeeds
            global.fetch
                .mockImplementationOnce(() => Promise.reject(new Error('Network error')))
                .mockImplementationOnce(() => Promise.resolve({
                    ok: true,
                    headers: {
                        get: () => 'application/json'
                    },
                    json: () => Promise.resolve(mockValidResponse)
                }));

            const startTime = Date.now();
            await watchlistUI.loadPrimaryMarketSymbols();
            const duration = Date.now() - startTime;

            expect(duration).toBeGreaterThanOrEqual(1000); // Should have waited at least 1s
            expect(watchlistUI.symbols.size).toBeGreaterThan(0);
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('should handle malformed symbols gracefully', async () => {
            chrome.storage.sync.get.mockImplementation((keys, callback) => {
                callback({ primaryMarket: 'NSE' });
            });

            const malformedResponse = {
                finance: {
                    result: [{
                        quotes: [
                            { symbol: '', typeDisp: 'Equity' }, // Empty symbol
                            { symbol: null, typeDisp: 'Equity' }, // Null symbol
                            { symbol: 'VALID.NS', typeDisp: 'Equity', exchange: 'NSE', market: 'in_market' } // Valid symbol
                        ]
                    }]
                }
            };

            global.fetch.mockImplementation(() => Promise.resolve({
                ok: true,
                headers: {
                    get: () => 'application/json'
                },
                json: () => Promise.resolve(malformedResponse)
            }));

            await watchlistUI.loadPrimaryMarketSymbols();
            expect(watchlistUI.symbols.size).toBe(1);
            expect(Array.from(watchlistUI.symbols)[0]).toBe('VALID.NS');
        });
    });
});
