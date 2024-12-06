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

## Data Source

Market data is fetched from Yahoo Finance API.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this code for your own projects.
