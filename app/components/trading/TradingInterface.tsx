'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, HelpCircle, Loader2 } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { getPrice } from '../../lib/services/contractQueryService';
import toast, { Toaster } from 'react-hot-toast';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const MOCK_TOKEN_ID = 0; // Using a mock token ID for this example

const TradingInterface = () => {
  const { isConnected, signingClient, address } = useWallet();
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('1'); // Default to 1 token
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);
  const [price, setPrice] = useState<string | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [isTrading, setIsTrading] = useState(false);

  useEffect(() => {
    const fetchPrice = async () => {
      if (!signingClient) return;
      setIsLoadingPrice(true);
      try {
        const priceResponse = await getPrice(signingClient, MOCK_TOKEN_ID);
        if (priceResponse) {
          const priceInSei = (parseFloat(priceResponse.price) / 1000000).toFixed(4);
          setPrice(priceInSei);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch price.");
      } finally {
        setIsLoadingPrice(false);
      }
    };

    fetchPrice();
  }, [signingClient]);

  const handleExecuteTrade = async () => {
    if (!isConnected || !signingClient || !address) {
      toast.error("Please connect your wallet first.");
      return;
    }
    if (!price) {
        toast.error("Could not determine trade price.");
        return;
    }

    setIsTrading(true);
    const toastId = toast.loading("Executing trade...");

    try {
        const msg = tradeType === 'buy' 
            ? { buy: { token_id: MOCK_TOKEN_ID } }
            : { sell: { token_id: MOCK_TOKEN_ID } };
        
        const fee = {
            amount: [{ denom: "usei", amount: "20000" }],
            gas: "200000",
        };

        const funds = tradeType === 'buy' ? [{ denom: "usei", amount: (parseFloat(price) * 1000000).toString() }] : [];

        const result = await signingClient.execute(address, CONTRACT_ADDRESS, msg, fee, "Seilor.fun Trade", funds);

        toast.success(`Trade successful! TxHash: ${result.transactionHash.substring(0, 10)}...`, { id: toastId });
    } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Trade failed.", { id: toastId });
    } finally {
        setIsTrading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white w-full max-w-md mx-auto">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setTradeType('buy')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tradeType === 'buy' ? 'bg-green-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setTradeType('sell')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tradeType === 'sell' ? 'bg-red-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            Sell
          </button>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="text-zinc-400 hover:text-white">
          <Settings size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex items-center justify-between p-2 bg-zinc-800 rounded-lg">
              <label htmlFor="slippage" className="text-sm text-zinc-400">Slippage Tolerance</label>
              <div className="flex items-center gap-2">
                <input
                  id="slippage"
                  type="text"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="bg-zinc-700 border border-zinc-600 rounded-md w-16 text-right px-2 py-1"
                />
                <span>%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="bg-zinc-800 p-4 rounded-lg mb-2">
        <label htmlFor="amount" className="text-sm text-zinc-400 block mb-2">
            You {tradeType === 'buy' ? 'pay' : 'receive'} (approx)
        </label>
        <div className="flex items-center gap-4">
            {isLoadingPrice ? (
                <Loader2 className="animate-spin" />
            ) : (
                 <p className="text-3xl font-mono w-full">{price || 'N/A'}</p>
            )}
            <div className="bg-zinc-700 px-4 py-2 rounded-full font-bold text-lg">SEI</div>
        </div>
      </div>

       {/* Placeholder for received amount */}
       <div className="text-right text-zinc-400 text-sm mb-2 pr-2">
        ~ 0.00 Tokens
      </div>


      {/* Placeholder for price impact warning */}
      <div className="text-sm text-yellow-500 mb-4 h-5 text-center">
        {parseFloat(amount) > 100 && <p>High Price Impact Warning!</p>}
      </div>

      <button
        onClick={handleExecuteTrade}
        disabled={!isConnected || isTrading || isLoadingPrice}
        className={`w-full py-3 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
          tradeType === 'buy'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {isTrading && <Loader2 className="animate-spin" size={20} />}
        {tradeType === 'buy' ? 'Buy Token' : 'Sell Token'}
      </button>

       <div className="text-xs text-zinc-500 mt-4 flex items-center gap-1 justify-center">
            <HelpCircle size={14} />
            <span>Trading fees and royalties will be applied.</span>
        </div>
    </div>
  );
};

export default TradingInterface; 