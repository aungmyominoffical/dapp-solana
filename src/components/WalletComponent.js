import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const WalletComponent = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (publicKey) {
      getBalance();
    }
  }, [publicKey, connection]);

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
        setTimeout(() => setShowSuccess(false), 5000); // Hide after 5 seconds
        await getBalance();

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
            <p className="font-mono text-sm break-all bg-gray-700 p-3 rounded">{publicKey.toString()}</p>
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
        </div>
      )}
    </div>
  );
};

export default WalletComponent;