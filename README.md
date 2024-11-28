# SENSEX Chrome Extension

A Chrome extension that displays real-time market values for major stock indices including SENSEX, NIFTY 50, Dow Jones, and more.

## Features

- Real-time market value updates
- Support for multiple indices:
  - SENSEX (BSE)
  - NIFTY 50 (NSE)
  - Dow Jones (DJIA)
  - S&P 500
  - FTSE 100
  - Nikkei 225
- Automatic market status detection
- Smart caching system
- Clean and intuitive UI

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Development

The extension is built using vanilla JavaScript and follows Chrome Extension Manifest V3 guidelines.

### Project Structure

```
SENSEXChromeExt/
├── manifest.json        # Extension configuration
├── popup.html          # Extension popup UI
├── popup.js            # Main extension logic
└── js/
    ├── config/         # Configuration files
    ├── utils/          # Utility functions
    └── cache.js        # Caching system
```

## Data Source

Market data is fetched from Yahoo Finance API.
