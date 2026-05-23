# AI Stock Dashboard

A professional AI-powered stock trading simulator with a retro terminal aesthetic. Features real-time synthetic market data, automated trading agents with multi-strategy ensemble, and a WebSocket-connected Python backend.

## Architecture

```
F:\AIProjects
├── stockdashboard/          # React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── components/      # React components (Chart, Trading, Agent, Layout, etc.)
│   │   ├── pages/           # 10 route pages (Dashboard, Trade, Charts, Markets, etc.)
│   │   ├── hooks/           # Custom React hooks (useAgent, useStockData, etc.)
│   │   ├── lib/             # Core logic (dataGenerator, indicators, agentBridge, etc.)
│   │   ├── data/            # Market data (exchanges, currencies, providers, markets)
│   │   └── store/           # Zustand state management
│   └── package.json
│
└── TradingAgent/            # Python backend
    ├── server.py            # WebSocket server (port 8765)
    ├── core/                # Core domain (Market, Portfolio, Agent, Session, Decision)
    ├── strategies/          # Trading strategies (SMA, RSI, Momentum, Ensemble)
    ├── analyzers/           # Analysis modules (Predictor, Risk, Technical, Scanner)
    ├── providers/           # Data provider abstraction layer
    └── data/                # Exchange definitions
```

## Quick Start

### Frontend
```bash
cd stockdashboard
npm install
npm run dev
```
Opens at `http://localhost:5173`

### Backend (optional — for AI Agent features)
```bash
cd TradingAgent
run.bat
```
WebSocket server at `ws://localhost:8765`

## Features

### Pages
- **Dashboard** — Real-time chart (CandlestickChart), Order Book, Order Panel, Portfolio, Watchlist, Market Movers
- **Trade** — Place buy/sell orders, view order book, trade history
- **Charts** — Multi-timeframe OHLC (1m–1M) with SMA20/50 indicators
- **Markets** — 17 global exchanges including NSE India, 14+ US stocks, futures, forex, crypto
- **News** — Live market news feed (simulated)
- **AI Agent** — Automated trading agent with SCAN → PREDICT → ANALYZE → TRADE workflow
- **Leaderboard** — Top traders ranking
- **Profile/Settings/Providers** — User preferences and data source config

### AI Agent
- Phased workflow: Scan markets → Predict prices → Analyze → Trade
- Multi-strategy ensemble voting (SMA Crossover, RSI Reversal, Momentum)
- Configurable pre-session + trading duration
- Real-time session status via WebSocket

### Markets Supported
- **Stocks**: US (NASDAQ, NYSE), UK (LSE), Japan (TSE), Hong Kong (HKEX), India (NSE), EU (Euronext, Deutsche Börse), Canada (TSX), Switzerland (SIX)
- **Futures**: S&P 500 E-mini, NASDAQ 100, Gold, Crude Oil, Treasury Bonds
- **Forex**: EUR/USD, GBP/USD, USD/JPY, and 5 more pairs
- **Crypto**: BTC, ETH, SOL, XRP (via Binance)
- **Options**: Basic call/put contracts

### Data Sources
- Simulated synthetic data (default) — geometric Brownian motion prices
- Provider abstraction ready for: Yahoo Finance, Alpha Vantage, IEX, Polygon, Twelve Data, Finnhub, OANDA, Binance

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS 4 |
| State | Zustand 5 |
| Charts | TradingView Lightweight Charts 5 |
| Backend | Python 3.13+, asyncio, websockets |
| Database | Dexie.js (IndexedDB) for logging |
| Styling | Retro terminal theme (CRT scanline, neon glow, monospace) |
