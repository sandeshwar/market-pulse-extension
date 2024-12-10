import { WatchlistManager } from '../watchlist.js';

export class WatchlistUI {
    constructor(containerElement) {
        this.container = containerElement;
        this.watchlistManager = new WatchlistManager();
        this.init();
    }

    async init() {
        await this.watchlistManager.loadWatchlists();
        this.setupInitialUI();
        this.attachEventDelegation();
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
        const symbol = prompt('Enter symbol to add:');
        if (!symbol) return;

        try {
            await this.watchlistManager.addToWatchlist(watchlistName, symbol.toUpperCase());
            // Only update the specific watchlist card
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
