import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { MARKETS } from '../../config/markets.js';
import { WatchlistUI } from '../watchlistUI.js';

describe('WatchlistUI', () => {
    let container;
    let watchlistUI;

    beforeEach(() => {
        // Mock Chrome storage API
        global.chrome = {
            storage: {
                sync: {
                    get: jest.fn((keys, callback) => {
                        if (Array.isArray(keys) && keys.includes('watchlists')) {
                            callback({ watchlists: '[]' });
                        } else if (Array.isArray(keys) && keys.includes('primaryMarket')) {
                            callback({ primaryMarket: 'NSE' });
                        } else if (typeof keys === 'string') {
                            callback({ [keys]: null });
                        }
                    }),
                    set: jest.fn()
                }
            }
        };

        // Mock DOM APIs
        global.document = window.document;
        global.setTimeout = jest.fn(fn => fn());
        global.clearTimeout = jest.fn();

        // Reset all mocks
        jest.resetAllMocks();
        
        // Setup DOM
        container = document.createElement('div');
        watchlistUI = new WatchlistUI(container);
        
        // Mock fetch
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Initialization', () => {
        it('should initialize with empty symbols set', () => {
            expect(watchlistUI.symbols).toBeDefined();
            expect(watchlistUI.symbols instanceof Set).toBeTruthy();
            expect(watchlistUI.symbols.size).toBe(0);
        });

        it('should have container element', () => {
            expect(watchlistUI.container).toBe(container);
        });
    });

    describe('Chrome API Handling', () => {
        it('should handle missing Chrome API gracefully', async () => {
            global.chrome = undefined;
            await watchlistUI.loadPrimaryMarketSymbols();
            expect(watchlistUI.symbols.size).toBe(0);
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
    });

    describe('Market Symbol Loading', () => {
        it('should filter BSE symbols correctly', async () => {
            chrome.storage.sync.get.mockImplementation((keys, callback) => {
                callback({ primaryMarket: 'BSE' });
            });

            const mockResponse = {
                quotes: [
                    { symbol: 'INFY.BO', quoteType: 'EQUITY', market: 'in_market', exchange: 'BSE' },
                    { symbol: 'WRONG.NS', quoteType: 'EQUITY', market: 'in_market', exchange: 'NSE' },
                    { symbol: 'INVALID', quoteType: 'EQUITY', market: 'in_market', exchange: 'BSE' }
                ]
            };

            global.fetch.mockImplementation(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            }));

            await watchlistUI.loadPrimaryMarketSymbols();
            expect(watchlistUI.symbols.size).toBe(1);
            expect(Array.from(watchlistUI.symbols)).toContain('INFY.BO');
        });

        it('should handle NYSE symbols correctly', async () => {
            chrome.storage.sync.get.mockImplementation((keys, callback) => {
                callback({ primaryMarket: 'NYSE' });
            });

            const mockResponse = {
                quotes: [
                    { symbol: 'AAPL', quoteType: 'EQUITY', market: 'us_market', exchange: 'NYSE' },
                    { symbol: 'MSFT', quoteType: 'EQUITY', market: 'us_market', exchange: 'NYSE' },
                    { symbol: 'INVALID.XX', quoteType: 'EQUITY', market: 'other_market', exchange: 'OTHER' }
                ]
            };

            global.fetch.mockImplementation(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            }));

            await watchlistUI.loadPrimaryMarketSymbols();
            expect(watchlistUI.symbols.size).toBe(2);
            expect(Array.from(watchlistUI.symbols)).toContain('AAPL');
            expect(Array.from(watchlistUI.symbols)).toContain('MSFT');
        });
    });

    describe('UI Rendering', () => {
        it('should render empty state when no watchlists exist', () => {
            watchlistUI.setupInitialUI();
            expect(container.innerHTML).toContain('No watchlists yet');
            expect(container.innerHTML).toContain('Create one to get started!');
        });

        it('should render watchlist header with create button', () => {
            watchlistUI.setupInitialUI();
            expect(container.querySelector('.watchlist-header')).toBeTruthy();
            expect(container.querySelector('#create-watchlist')).toBeTruthy();
            expect(container.querySelector('#create-watchlist').textContent).toContain('New Watchlist');
        });
    });

    describe('Event Handling', () => {
        it('should attach event listeners to container', () => {
            const addEventListenerSpy = jest.spyOn(container, 'addEventListener');
            watchlistUI.attachEventDelegation();
            expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            // Mock the AbortController and its signal
            global.AbortController = class {
                constructor() {
                    this.signal = { aborted: false };
                }
                abort() {
                    this.signal.aborted = true;
                }
            };

            // Mock timers
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should handle HTTP errors gracefully', async () => {
            expect.assertions(2);

            // Mock Chrome storage to return a valid market
            chrome.storage.sync.get.mockImplementation((keys, callback) => {
                callback({ primaryMarket: 'NYSE' });
            });

            // Mock fetch to return an error response for all retries
            global.fetch.mockRejectedValue(new Error('HTTP error! status: 404'));

            // Start the async operation
            const promise = watchlistUI.loadPrimaryMarketSymbols();

            // Fast-forward through all timeouts
            for (let i = 0; i <= 2; i++) { // Initial try + 2 retries
                await Promise.resolve(); // Let the current fetch reject
                jest.runAllTimers(); // Run any setTimeout
            }

            await promise;

            expect(watchlistUI.symbols.size).toBe(0);
            expect(global.fetch).toHaveBeenCalledTimes(3); // Initial try + 2 retries
        });

        it('should handle malformed response data', async () => {
            // Mock Chrome storage to return a valid market
            chrome.storage.sync.get.mockImplementation((keys, callback) => {
                callback({ primaryMarket: 'NYSE' });
            });

            // Mock fetch to return invalid data for all retries
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ invalidData: true })
            });

            // Start the async operation
            const promise = watchlistUI.loadPrimaryMarketSymbols();

            // Fast-forward through all timeouts and promises
            for (let i = 0; i <= 2; i++) { // Initial try + 2 retries
                await Promise.resolve(); // Let the current fetch resolve
                await Promise.resolve(); // Let the json() promise resolve
                jest.runAllTimers(); // Run any setTimeout
            }

            await promise;

            expect(watchlistUI.symbols.size).toBe(0);
            expect(global.fetch).toHaveBeenCalledTimes(3); // Initial try + 2 retries
        });
    });
});
