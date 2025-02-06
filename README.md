# Solana Wallet Integration with Next.js


`[dapp-solana-sigma.vercel.app](https://dapp-solana-sigma.vercel.app/)`

A modern web application demonstrating Solana wallet integration using Next.js, featuring Phantom wallet connectivity, balance checking, and SOL transfer capabilities.

## Features
- 🌐  Running on Solana Devnet Network
- 🔐 Phantom Wallet Integration
- 💰 Real-time SOL Balance Display
- 💸 Send SOL to Other Addresses
- ⚡ Real-time Transaction Updates
- 🎨 Clean and Responsive UI

## Solana Development Details

### Network Configuration
- Default Network: Devnet
- RPC Endpoint: `https://api.devnet.solana.com`
- Explorer: [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)

### Wallet Integration
- Uses `@solana/wallet-adapter` for wallet connections
- Supports Phantom Wallet by default
- Implements Web3.js for blockchain interactions

### Transaction Features
- SOL transfers using `SystemProgram.transfer`
- Real-time transaction confirmation
- Balance updates after successful transactions
- Lamport conversion handling (1 SOL = 1,000,000,000 Lamports)

### Development Tools
- Solana CLI (for development and testing)
- Solana Web3.js library
- Phantom Wallet Developer Mode

### Getting Devnet SOL
1. Install Solana CLI
2. Configure to devnet:
```bash
solana config set --url devnet
```

## Technologies Used

- Next.js
- Solana Web3.js
- Wallet Adapter Libraries
- TailwindCSS
- React

## Prerequisites

- Node.js 16+ and npm
- Phantom Wallet browser extension
- Some SOL in your wallet (use devnet faucet for testing)

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd dapp-solana
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
```
