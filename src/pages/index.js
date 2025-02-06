import React, { useMemo } from 'react';
import Head from 'next/head';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import WalletComponent from '../components/WalletComponent';
import '@solana/wallet-adapter-react-ui/styles.css';
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function Home() {
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <>
      <Head>
        <title>Solana Wallet Integration | Send & Receive SOL</title>
        <meta name="description" content="Send and receive SOL using Phantom wallet integration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
              <div className="container mx-auto px-4 py-8">
                <main className="max-w-3xl mx-auto">
                  <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Solana Wallet Integration
                  </h1>
                  
                  <div className="bg-gray-800 rounded-lg p-8 shadow-2xl mb-8">
                    <div className="flex justify-center mb-4">
                      <span className="px-4 py-1 bg-purple-600 rounded-full text-sm font-medium">
                        Network: Devnet
                      </span>
                    </div>
                    <p className="text-xl text-center mb-6 text-purple-300">
                      Welcome to the Solana Wallet Integration Demo
                    </p>
                    <div className="bg-gray-700 rounded-lg p-6 mb-8">
                      <p className="text-lg text-purple-200 mb-4">This application demonstrates:</p>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-center">
                          <span className="mr-2">🌐</span>
                          <span>Running on <span className="font-bold">Solana Devnet Network</span></span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">🔐</span>
                          <span>Connecting to Phantom Wallet</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">💰</span>
                          <span>Checking SOL Balance</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">💸</span>
                          <span>Sending SOL to other addresses</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">⚡</span>
                          <span>Real-time transaction updates</span>
                        </li>
                      </ul>
                    </div>
                    <div className="backdrop-blur-sm bg-white/10 rounded-lg p-6">
                      <WalletComponent />
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
}