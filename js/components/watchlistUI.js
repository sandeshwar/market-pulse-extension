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

    async loadPrimaryMarketSymbols() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['primaryMarket'], async (result) => {
                const primaryMarket = result.primaryMarket;
                if (primaryMarket && MARKETS[primaryMarket]) {
                    try {
                        const response = await fetch(MARKETS[primaryMarket].symbolsUrl);
                        if (!response.ok) throw new Error('Failed to fetch symbols');
                        const data = await response.json();
                        this.symbols = new Set(data.symbols || []);
                    } catch (error) {
                        console.error('Error loading symbols:', error);
                        this.symbols = new Set();
                    }
                }
                resolve();
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
                // Only update the watchlist container
                watchlistContainer.innerHTML = this.renderWatchlists();
            }
        } catch (error) {
            alert(error.message);
        }
    }

    async handleAddSymbol(watchlistName) {
        if (this.symbols.size === 0) {
            alert('Please select a primary market in settings first');
            return;
        }

        const symbolsArray = Array.from(this.symbols);
        const dialog = document.createElement('div');
        dialog.className = 'symbol-selector-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Add Symbol to ${watchlistName}</h3>
                <div class="search-container">
                    <input type="text" id="symbol-search" placeholder="Search symbols..." class="symbol-search">
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
        dialog.querySelector('#cancel-symbol').addEventListener('click', () => {
            dialog.remove();
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

            .search-container {
                margin: 16px 0;
            }

            .symbol-search {
                width: 100%;
                padding: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                background: rgba(255, 255, 255, 0.05);
                color: #fff;
            }

            .symbols-list {
                flex: 1;
                overflow-y: auto;
                max-height: 300px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                padding: 8px;
            }

            .symbol-item {
                padding: 8px;
                cursor: pointer;
                border-radius: 4px;
            }

            .symbol-item:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .dialog-actions {
                margin-top: 16px;
                display: flex;
                justify-content: flex-end;
            }

            .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
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
            // Only update the specific watchlist card's symbols
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
            // Remove only the specific watchlist card
            const watchlistCard = this.container.querySelector(`.watchlist-card[data-name="${watchlistName}"]`);
            if (watchlistCard) {
                watchlistCard.remove();
                // Check if we need to show empty state
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
