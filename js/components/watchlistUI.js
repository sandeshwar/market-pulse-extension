import { WatchlistManager } from '../watchlist.js';
import { MARKETS } from '../config/markets.js';

export class WatchlistUI {
    constructor(containerElement) {
        this.container = containerElement;
        this.watchlistManager = new WatchlistManager();
        this.symbols = new Set();
        this.init();
    }

    async init() {
        await this.watchlistManager.loadWatchlists();
        await this.loadPrimaryMarketSymbols();
        this.setupInitialUI();
        this.attachEventDelegation();
    }

    /**
     * Loads stock symbols for the selected primary market
     * @returns {Promise<void>}
     */
    async loadPrimaryMarketSymbols() {
        return new Promise((resolve) => {
            // Ensure we're running in a Chrome extension context
            if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
                console.error('Chrome storage API not available');
                this.symbols = new Set();
                resolve();
                return;
            }

            chrome.storage.sync.get(['primaryMarket'], async (result) => {
                try {
                    // Reset symbols at the start
                    this.symbols = new Set();

                    const primaryMarket = result?.primaryMarket;
                    if (!primaryMarket) {
                        throw new Error('No primary market selected');
                    }

                    console.log('Loading symbols for primary market:', primaryMarket);

                    const market = MARKETS?.[primaryMarket];
                    if (!market || !market.symbolsUrl) {
                        throw new Error(`Invalid market configuration for: ${primaryMarket}`);
                    }

                    const maxRetries = 2;
                    const timeout = 10000; // 10 seconds timeout
                    let lastError = null;

                    for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
                        try {
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), timeout);

                            const response = await fetch(market.symbolsUrl, {
                                signal: controller.signal,
                                headers: {
                                    'Accept': 'application/json'
                                }
                            });

                            clearTimeout(timeoutId);

                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }

                            const data = await response.json();
                            
                            if (!data.quotes || !Array.isArray(data.quotes)) {
                                throw new Error('Invalid response format: missing quotes array');
                            }

                            // Process the symbols
                            data.quotes.forEach(quote => {
                                if (!quote.symbol) return;
                                
                                const symbol = quote.symbol.trim();
                                if (symbol.length === 0) return;

                                // Check if it's a valid equity type
                                const isEquity = quote.quoteType === 'EQUITY' || 
                                               quote.typeDisp === 'Equity' ||
                                               quote.type === 'S';
                                
                                if (!isEquity) return;

                                let shouldAdd = false;
                                const exchange = quote.exchange || '';
                                const market = quote.market || '';
                                    
                                switch (primaryMarket) {
                                    case 'NSE':
                                        shouldAdd = symbol.endsWith('.NS') && market === 'in_market';
                                        break;
                                    case 'BSE':
                                        shouldAdd = symbol.endsWith('.BO') && market === 'in_market';
                                        break;
                                    case 'NYSE':
                                        // NYSE stocks typically don't have a suffix and are on NYSE exchange
                                        shouldAdd = (!symbol.includes('.') || symbol.endsWith('.N')) && 
                                                  (exchange.toUpperCase().includes('NYSE') || market === 'us_market');
                                        break;
                                    case 'NASDAQ_EXCHANGE':
                                        // NASDAQ stocks typically don't have a suffix and are on NASDAQ exchange
                                        shouldAdd = (!symbol.includes('.') || symbol.endsWith('.O')) && 
                                                  (exchange.toUpperCase().includes('NASDAQ') || market === 'us_market');
                                        break;
                                    case 'SNP500':
                                        // S&P 500 stocks can be from either NYSE or NASDAQ
                                        shouldAdd = (!symbol.includes('.') || symbol.endsWith('.N') || symbol.endsWith('.O')) && 
                                                  market === 'us_market';
                                        break;
                                    case 'LSE':
                                        shouldAdd = symbol.endsWith('.L') && market === 'gb_market';
                                        break;
                                    case 'TSE':
                                        shouldAdd = symbol.endsWith('.T') && market === 'jp_market';
                                        break;
                                    case 'HKEX':
                                        shouldAdd = symbol.endsWith('.HK') && market === 'hk_market';
                                        break;
                                    case 'DAX':
                                        shouldAdd = symbol.endsWith('.DE') && market === 'de_market';
                                        break;
                                    default:
                                        console.warn(`Unknown market: ${primaryMarket}`);
                                        break;
                                }

                                if (shouldAdd) {
                                    this.symbols.add(symbol);
                                    if (this.symbols.size <= 5) {
                                        console.log(`Added symbol: ${symbol} (Exchange: ${exchange}, Market: ${market})`);
                                    }
                                }
                            });

                            if (this.symbols.size === 0) {
                                console.error('Response data:', data);
                                throw new Error(`No symbols found for ${primaryMarket}. Please check market configuration.`);
                            }

                            console.log(`Final symbol set size: ${this.symbols.size}`);
                            console.log('Sample symbols:', Array.from(this.symbols).slice(0, 5));

                            // Success - break the retry loop
                            break;

                        } catch (error) {
                            lastError = error;
                            console.error(`Attempt ${retryCount + 1} failed:`, error.message);

                            if (error.name === 'AbortError') {
                                console.error('Request timed out');
                            }

                            // If this was the last retry, throw the error
                            if (retryCount === maxRetries) {
                                throw error;
                            }

                            // Wait before retrying (exponential backoff)
                            await new Promise(r => setTimeout(r, Math.pow(2, retryCount) * 1000));
                        }
                    }

                    resolve();
                } catch (error) {
                    console.error('Fatal error in loadPrimaryMarketSymbols:', error);
                    this.symbols = new Set();
                    resolve();
                }
            });
        });
    }

    setupInitialUI() {
        this.container.innerHTML = `
            <div class="watchlist-section">
                <div class="watchlist-header">
                    <h2>Watchlists</h2>
                    <button id="create-watchlist" class="btn-primary">
                        <i class="fas fa-plus"></i> New Watchlist
                    </button>
                </div>
                <div id="watchlist-container" class="watchlist-container">
                    ${this.renderWatchlists()}
                </div>
            </div>
        `;
    }

    renderWatchlists() {
        const watchlists = this.watchlistManager.getAllWatchlists();
        if (watchlists.length === 0) {
            return '<div class="empty-state">No watchlists yet. Create one to get started!</div>';
        }
        return watchlists.map(({ name, symbols }) => this.renderWatchlistCard(name, symbols)).join('');
    }

    renderWatchlistCard(name, symbols) {
        return `
            <div class="watchlist-card" data-name="${name}">
                <div class="watchlist-card-header">
                    <h3>${name}</h3>
                    <div class="watchlist-actions">
                        <button class="btn-icon add-symbol" title="Add Symbol" data-action="add-symbol">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn-icon delete-watchlist" title="Delete Watchlist" data-action="delete-watchlist">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="symbols-container">
                    ${symbols.length ? symbols.map(symbol => this.renderSymbolChip(symbol)).join('') : 
                        '<div class="empty-symbols">No symbols added</div>'}
                </div>
            </div>
        `;
    }

    renderSymbolChip(symbol) {
        return `
            <div class="symbol-chip">
                ${symbol}
                <button class="remove-symbol" data-action="remove-symbol" data-symbol="${symbol}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    attachEventDelegation() {
        // Use event delegation for all watchlist actions
        this.container.addEventListener('click', async (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const watchlistCard = target.closest('.watchlist-card');
            const watchlistName = watchlistCard?.dataset.name;

            switch (action) {
                case 'add-symbol':
                    if (watchlistName) {
                        await this.handleAddSymbol(watchlistName);
                    }
                    break;
                case 'remove-symbol':
                    if (watchlistName && target.dataset.symbol) {
                        await this.handleRemoveSymbol(watchlistName, target.dataset.symbol);
                    }
                    break;
                case 'delete-watchlist':
                    if (watchlistName) {
                        await this.handleDeleteWatchlist(watchlistName);
                    }
                    break;
            }
        });

        // Handle create watchlist button
        const createBtn = this.container.querySelector('#create-watchlist');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.handleCreateWatchlist());
        }
    }

    async handleCreateWatchlist() {
        const name = prompt('Enter watchlist name:');
        if (!name) return;

        try {
            await this.watchlistManager.createWatchlist(name);
            const watchlistContainer = this.container.querySelector('#watchlist-container');
            if (watchlistContainer) {
                watchlistContainer.innerHTML = this.renderWatchlists();
            }
        } catch (error) {
            alert(error.message);
        }
    }

    async handleAddSymbol(watchlistName) {
        // First check if primary market is selected
        const primaryMarket = await new Promise(resolve => {
            chrome.storage.sync.get(['primaryMarket'], result => resolve(result.primaryMarket));
        });

        if (!primaryMarket) {
            alert('Please select a primary market in settings first');
            return;
        }

        if (this.symbols.size === 0) {
            alert('Unable to load symbols from the selected market. Please try refreshing the extension.');
            return;
        }

        const symbolsArray = Array.from(this.symbols);
        const dialog = document.createElement('div');
        dialog.className = 'symbol-selector-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Add Symbol to ${watchlistName}</h3>
                <div class="search-container">
                    <input type="text" id="symbol-search" placeholder="Search symbols..." class="symbol-search" autocomplete="off">
                </div>
                <div class="symbols-list">
                    ${symbolsArray.map(symbol => `
                        <div class="symbol-item" data-symbol="${symbol}">
                            ${symbol}
                        </div>
                    `).join('')}
                </div>
                <div class="dialog-actions">
                    <button class="btn-secondary" id="cancel-symbol">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        const searchInput = dialog.querySelector('#symbol-search');
        const symbolsList = dialog.querySelector('.symbols-list');

        // Focus search input
        searchInput.focus();

        // Handle symbol search
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toUpperCase();
            const items = symbolsList.querySelectorAll('.symbol-item');
            items.forEach(item => {
                const symbol = item.dataset.symbol;
                item.style.display = symbol.includes(searchTerm) ? 'block' : 'none';
            });
        });

        // Handle symbol selection
        symbolsList.addEventListener('click', async (e) => {
            const symbolItem = e.target.closest('.symbol-item');
            if (symbolItem) {
                const symbol = symbolItem.dataset.symbol;
                try {
                    await this.watchlistManager.addToWatchlist(watchlistName, symbol);
                    const watchlistCard = this.container.querySelector(`.watchlist-card[data-name="${watchlistName}"]`);
                    if (watchlistCard) {
                        const symbols = this.watchlistManager.getWatchlist(watchlistName);
                        const symbolsContainer = watchlistCard.querySelector('.symbols-container');
                        symbolsContainer.innerHTML = symbols.length ? 
                            symbols.map(sym => this.renderSymbolChip(sym)).join('') : 
                            '<div class="empty-symbols">No symbols added</div>';
                    }
                } catch (error) {
                    alert(error.message);
                }
                dialog.remove();
            }
        });

        // Handle cancel
        const handleClose = () => dialog.remove();
        dialog.querySelector('#cancel-symbol').addEventListener('click', handleClose);
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) handleClose();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') handleClose();
        });

        // Add styles for the dialog
        const style = document.createElement('style');
        style.textContent = `
            .symbol-selector-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }

            .dialog-content {
                background: #2a3142;
                border-radius: 8px;
                padding: 20px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
            }

            .dialog-content h3 {
                margin: 0;
                color: #fff;
            }

            .search-container {
                margin: 16px 0;
            }

            .symbol-search {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                background: rgba(255, 255, 255, 0.05);
                color: #fff;
                font-size: 14px;
            }

            .symbol-search:focus {
                outline: none;
                border-color: rgba(255, 255, 255, 0.3);
            }

            .symbols-list {
                flex: 1;
                overflow-y: auto;
                max-height: 300px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                padding: 8px;
            }

            .symbols-list::-webkit-scrollbar {
                width: 8px;
            }

            .symbols-list::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
            }

            .symbols-list::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
            }

            .symbol-item {
                padding: 8px 12px;
                cursor: pointer;
                border-radius: 4px;
                transition: background-color 0.2s;
                font-size: 14px;
            }

            .symbol-item:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .dialog-actions {
                margin-top: 16px;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }

            .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s;
                font-size: 14px;
            }

            .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        `;
        document.head.appendChild(style);
    }

    async handleRemoveSymbol(watchlistName, symbol) {
        if (!confirm(`Remove ${symbol} from watchlist?`)) return;

        try {
            await this.watchlistManager.removeFromWatchlist(watchlistName, symbol);
            const watchlistCard = this.container.querySelector(`.watchlist-card[data-name="${watchlistName}"]`);
            if (watchlistCard) {
                const symbols = this.watchlistManager.getWatchlist(watchlistName);
                const symbolsContainer = watchlistCard.querySelector('.symbols-container');
                symbolsContainer.innerHTML = symbols.length ? 
                    symbols.map(sym => this.renderSymbolChip(sym)).join('') : 
                    '<div class="empty-symbols">No symbols added</div>';
            }
        } catch (error) {
            alert(error.message);
        }
    }

    async handleDeleteWatchlist(watchlistName) {
        if (!confirm(`Delete watchlist "${watchlistName}"?`)) return;

        try {
            await this.watchlistManager.deleteWatchlist(watchlistName);
            const watchlistCard = this.container.querySelector(`.watchlist-card[data-name="${watchlistName}"]`);
            if (watchlistCard) {
                watchlistCard.remove();
                const watchlistContainer = this.container.querySelector('#watchlist-container');
                if (watchlistContainer && !watchlistContainer.children.length) {
                    watchlistContainer.innerHTML = '<div class="empty-state">No watchlists yet. Create one to get started!</div>';
                }
            }
        } catch (error) {
            alert(error.message);
        }
    }
}
