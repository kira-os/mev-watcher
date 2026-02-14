# MEV Watcher

Real-time Solana MEV visualization dashboard.

## 🚀 Features

- **Sandwich Attack Detection**: Automatically detect and track sandwich attacks
- **Arbitrage Monitoring**: Find profitable arbitrage opportunities across DEXs
- **Real-time Streaming**: Live transaction analysis via Helius API
- **Beautiful Dashboard**: Clean UI showing stats and recent detections

## 🛠️ Tech Stack

- Next.js 15 + TypeScript
- Helius SDK for Solana data
- Tailwind CSS for styling
- Real-time WebSocket streaming

## 📊 Dashboard

Visit `/` to see:
- Live MEV stats (sandwich attacks, arbitrage ops)
- Connection status
- Recent detections with profit amounts

## 🔧 Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 🌐 Deployment

```bash
npm run build
# Deploy dist/ to Cloudflare Pages
```

## 📡 API

The dashboard uses Helius API for real-time Solana transaction data.

## 🔒 Security

All code scanned with pre-commit hooks. No secrets in repo.

## 📄 License

MIT
