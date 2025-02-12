import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const WalletComponent = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, wallet } = useWallet();  // Add wallet here
  const [balance, setBalance] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [showCopied, setShowCopied] = useState(false);  // Add this state

  const copyAddress = async () => {  // Add this function
    await navigator.clipboard.writeText(publicKey.toString());
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const getRecentTransactions = async () => {
    if (!publicKey) return;
    try {
      const signatures = await connection.getSignaturesForAddress(
        publicKey,
        { limit: 5 },
        'confirmed'
      );

      // In getRecentTransactions function, modify the transaction details mapping
      const transactionDetails = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });
          const isReceived = tx?.transaction?.message?.accountKeys[0]?.toBase58() !== publicKey.toString();
          return {
            signature: sig.signature,
            timestamp: new Date(sig.blockTime * 1000).toLocaleString(),
            amount: tx?.meta?.postBalances[0] 
              ? (tx.meta.preBalances[0] - tx.meta.postBalances[0]) / LAMPORTS_PER_SOL
              : 0,
            address: isReceived 
              ? tx?.transaction?.message?.accountKeys[0]?.toBase58() || 'Unknown'
              : tx?.transaction?.message?.accountKeys[1]?.toBase58() || 'Unknown',
            isReceived,
            status: sig.confirmationStatus
          };
        })
      );

      setRecentTransactions(transactionDetails);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Add wallet to dependency array
  useEffect(() => {
    const fetchData = async () => {
      if (publicKey) {
        await Promise.all([
          getBalance(),
          getRecentTransactions()
        ]);
      } else {
        setRecentTransactions([]); // Clear transactions when wallet disconnects
      }
    };

    fetchData();
  }, [publicKey, connection]); // Remove wallet from dependencies as it's not needed

  const getBalance = async () => {
    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  const sendSol = async (e) => {
    e.preventDefault();
    if (!publicKey || !recipient || !amount) {
      console.log('Missing required fields:', { publicKey: !!publicKey, recipient: !!recipient, amount: !!amount });
      return;
    }

    try {
      setLoading(true);
      
      // Validate recipient address
      let recipientPubKey;
      try {
        recipientPubKey = new PublicKey(recipient);
      } catch (err) {
        console.log('Invalid recipient address:', err);
        alert('Invalid recipient address');
        return;
      }

      // Create transaction
      const transaction = new Transaction();
      
      try {
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Add transfer instruction
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipientPubKey,
            lamports: Math.floor(amount * LAMPORTS_PER_SOL),
          })
        );

        console.log('Transaction created:', {
          from: publicKey.toString(),
          to: recipientPubKey.toString(),
          amount: amount,
          blockhash: blockhash
        });

        // Send transaction
        const signature = await sendTransaction(transaction, connection, {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 5
        });

        console.log('Transaction sent, signature:', signature);

        // Wait for confirmation
        const confirmationResponse = await connection.confirmTransaction(
          {
            signature,
            blockhash,
            lastValidBlockHeight
          },
          'confirmed'
        );

        if (confirmationResponse.value.err) {
          console.log('Transaction confirmation error:', confirmationResponse.value.err);
          throw new Error(`Transaction failed: ${confirmationResponse.value.err.toString()}`);
        }

        // Replace alert with success notification
        console.log('Transaction confirmed successfully');
        setSuccessMessage(`Transaction successful! Signature: ${signature}`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
        await getBalance();
        await getRecentTransactions(); // This will update the transaction list

        // Remove these lines
        // const newTransaction = {
        //   signature,
        //   recipient: recipientPubKey.toString(),
        //   amount,
        //   timestamp: new Date().toLocaleString()
        // };
        // setTransactions(prev => [newTransaction, ...prev].slice(0, 5));

      } catch (txError) {
        console.log('Transaction processing error:', txError);
        throw txError;
      }
    } catch (error) {
      console.log('Overall transaction error:', error);
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setLoading(false);
      setRecipient('');
      setAmount('');
    }
  };

  return (
    <div className="flex flex-col items-center w-full relative">
      {showSuccess && (
        <div className="fixed top-4 right-4 max-w-md animate-fade-in">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 backdrop-blur-sm bg-opacity-90 px-6 py-4 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="animate-bounce-in">
                <div className="bg-white rounded-full p-1">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-medium">Transaction Successful!</span>
                <span className="text-xs text-white/80 font-mono mt-1 break-all max-w-xs">
                  {successMessage}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 w-full flex justify-center">
        <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 transition-colors" />
      </div>
      
      {publicKey && (
        <div className="w-full space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm text-gray-400">Your wallet address:</h3>
            <div className="relative group">
              <div 
                onClick={copyAddress}
                className="font-mono text-sm break-all bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600/50 transition-colors flex items-center justify-between"
              >
                <span>{publicKey.toString()}</span>
                <svg 
                  className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              {showCopied && (
                <div className="absolute top-0 right-0 -mt-8 bg-green-500 text-white text-sm px-2 py-1 rounded shadow-lg animate-fade-in-down">
                  Copied!
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm text-gray-400">Balance:</h3>
            <p className="text-2xl font-bold text-purple-300">{balance} SOL</p>
          </div>
      
          <form onSubmit={sendSol} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Recipient Address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <input
                type="number"
                step="0.000000001"
                placeholder="Amount in SOL"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !publicKey}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                loading || !publicKey
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Send SOL'
              )}
            </button>
          </form>

          {/* Add Recent Transactions List */}
          {recentTransactions.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-medium text-purple-300">Recent Transactions</h3>
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.signature} className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Amount</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          tx.isReceived 
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {tx.isReceived ? 'INCOMING' : 'OUT'}
                        </span>
                      </div>
                      <span className="font-medium text-purple-300">{Math.abs(tx.amount)} SOL</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{tx.isReceived ? 'From' : 'To'}</span>
                      <span className="font-mono text-xs text-gray-300 truncate max-w-[200px]">
                        {tx.address}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Time</span>
                      <span className="text-xs text-gray-300">{tx.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Status</span>
                      <span className={`text-xs ${
                        tx.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    <a
                      href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View on Explorer →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Add footer */}
      <div className="mt-12 pb-6 text-center">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-gray-500">Created with</span>
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-500">by</span>
          <a
            href="https://github.com/aungmyominoffical/dapp-solana"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent hover:from-purple-500 hover:to-pink-600 transition-all duration-300"
          >
            Aung Myo Min
          </a>
        </div>
      </div>
    </div>
  );
};

export default WalletComponent;