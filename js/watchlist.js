// Watchlist management module
export class WatchlistManager {
    constructor() {
        this.watchlists = new Map();
    }

    // Load watchlists from storage
    async loadWatchlists() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['watchlists'], (result) => {
                if (result.watchlists) {
                    this.watchlists = new Map(JSON.parse(result.watchlists));
                }
                resolve(this.watchlists);
            });
        });
    }

    // Save watchlists to storage
    async saveWatchlists() {
        return new Promise((resolve) => {
            const watchlistsData = JSON.stringify(Array.from(this.watchlists.entries()));
            chrome.storage.sync.set({ watchlists: watchlistsData }, resolve);
        });
    }

    // Create a new watchlist
    async createWatchlist(name) {
        if (this.watchlists.has(name)) {
            throw new Error('Watchlist with this name already exists');
        }
        this.watchlists.set(name, []);
        await this.saveWatchlists();
        return true;
    }

    // Add symbol to watchlist
    async addToWatchlist(watchlistName, symbol) {
        if (!this.watchlists.has(watchlistName)) {
            throw new Error('Watchlist not found');
        }
        const watchlist = this.watchlists.get(watchlistName);
        if (!watchlist.includes(symbol)) {
            watchlist.push(symbol);
            this.watchlists.set(watchlistName, watchlist);
            await this.saveWatchlists();
        }
        return true;
    }

    // Remove symbol from watchlist
    async removeFromWatchlist(watchlistName, symbol) {
        if (!this.watchlists.has(watchlistName)) {
            throw new Error('Watchlist not found');
        }
        const watchlist = this.watchlists.get(watchlistName);
        const index = watchlist.indexOf(symbol);
        if (index > -1) {
            watchlist.splice(index, 1);
            this.watchlists.set(watchlistName, watchlist);
            await this.saveWatchlists();
        }
        return true;
    }

    // Delete watchlist
    async deleteWatchlist(name) {
        if (!this.watchlists.has(name)) {
            throw new Error('Watchlist not found');
        }
        this.watchlists.delete(name);
        await this.saveWatchlists();
        return true;
    }

    // Get all watchlists
    getAllWatchlists() {
        return Array.from(this.watchlists.entries()).map(([name, symbols]) => ({
            name,
            symbols
        }));
    }

    // Get specific watchlist
    getWatchlist(name) {
        return this.watchlists.get(name) || [];
    }
}
