'use client';

import { useWallet } from '../contexts/WalletContext';
import { Loader2 } from 'lucide-react';

export const ConnectWalletButton = () => {
  const { connectWallet, disconnectWallet, isConnected, isConnecting, address, balance } = useWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-right">
            <p className="text-sm font-mono truncate">{address}</p>
            <p className="text-xs font-bold text-zinc-400">{balance}</p>
        </div>
        <button onClick={disconnectWallet} className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-70"
    >
      {isConnecting && <Loader2 className="animate-spin" size={20} />}
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}; 