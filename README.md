# Market Pulse Chrome Extension

A powerful Chrome extension that provides real-time tracking of global market indices, offering instant access to SENSEX, NIFTY 50, Dow Jones, and other major market indicators.

## Features

- Real-time market value updates
- Support for multiple global indices:
  - SENSEX (BSE)
  - NIFTY 50 (NSE)
  - Dow Jones (DJIA)
  - S&P 500
  - FTSE 100
  - Nikkei 225
- Intelligent market status detection
- Efficient caching system
- Modern and intuitive UI
- Auto-refresh for active markets

## Get the Extension

[Market Pulse on Chrome Web Store](https://chromewebstore.google.com/detail/market-pulse/kmcdpjbpcmgedcbjboagibnclfooggnf)



## Installation (for devs)

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Development

Built with modern JavaScript and follows Chrome Extension Manifest V3 guidelines.

### Project Structure

```
market-pulse/
├── manifest.json        # Extension configuration
├── popup.html          # Extension popup UI
├── popup.js            # Main extension logic
└── js/
    ├── config/         # Configuration files
    ├── utils/          # Utility functions
    └── cache.js        # Caching system
```

### Features in Detail

- **Real-time Updates**: Automatic refresh of market values while markets are open
<!-- - **Smart Caching**: Efficient caching system with automatic expiration -->
- **Market Status**: Intelligent detection of market hours across different time zones
- **Error Handling**: Robust error handling with user-friendly messages
- **Responsive UI**: Clean and responsive interface with loading states


## Future Enhancements
### Customizable Watchlists

**Description:** Allow users to create and manage personalized watchlists comprising their preferred stocks, indices, or cryptocurrencies.  
**Benefits:** Empowers users to monitor assets of personal interest efficiently, enhancing user engagement and satisfaction.  
**Implementation Example:** The "Stock Tracker" extension enables users to add or remove stock symbols to tailor their watchlist.

---

### Real-Time Price Alerts

**Description:** Enable users to set specific price thresholds for assets, receiving notifications when these levels are reached.  
**Benefits:** Keeps users informed about critical market movements, facilitating timely investment decisions.  
**Implementation Example:** The "Stock & Crypto Alerts" extension provides real-time notifications when user-defined price conditions are met.

---

### In-Depth Financial Data and News Integration

**Description:** Provide comprehensive financial statements, including balance sheets, income statements, and cash flow statements, alongside the latest news related to tracked assets.  
**Benefits:** Offers users a holistic view of their investments, aiding in thorough analysis and informed decision-making.  
**Implementation Example:** "Stock Glance" offers access to detailed financial statements and aggregates relevant news, delivering valuable insights to users.

## Data Source

Market data is fetched from Yahoo Finance API.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this code for your own projects.
