# MEV Watcher Dashboard

Real-time Solana MEV visualization. Track sandwich attacks, JIT liquidity, arbitrage.

## Features

- **Sandwich Attack Detection**: Identify and visualize sandwich attacks in real-time
- **JIT Liquidity Tracking**: Monitor Just-In-Time liquidity movements
- **Arbitrage Scanner**: Track profitable arbitrage opportunities across DEXs
- **Whale Watcher**: Large transaction monitoring
- **Historical Analysis**: Trend analysis and pattern recognition

## Tech Stack

- Next.js 15 + TypeScript
- Solana Web3.js
- Jupiter SDK for DEX data
- Helius API for enhanced transaction data
- Real-time WebSocket feeds
- Chart.js for visualizations

## Data Sources

1. **Helius** - Enhanced transaction streams
2. **Jupiter** - DEX aggregator data
3. **Solana FM** - MEV-specific APIs
4. **Custom RPC** - Jito/Helius for mempool access

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
mev-watcher/
├── app/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── page.tsx
├── components/
│   └── ui/
├── public/
└── package.json
```

## License

MIT
