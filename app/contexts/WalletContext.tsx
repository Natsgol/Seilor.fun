'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { OfflineSigner } from '@cosmjs/proto-signing';
import '../types/keplr'; // Import for side effects

const SEI_RPC_URL = process.env.NEXT_PUBLIC_SEI_RPC_URL || "https://rpc.atlantic-2.seinetwork.io/";
const SEI_CHAIN_ID = process.env.NEXT_PUBLIC_SEI_CHAIN_ID || "atlantic-2";
const SEI_REST_URL = process.env.NEXT_PUBLIC_SEI_REST_URL || "https://rest.atlantic-2.seinetwork.io";

// Define the shape of the context data
interface WalletState {
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  signingClient: SigningCosmWasmClient | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

// Create the context with a default value
const WalletContext = createContext<WalletState | undefined>(undefined);

// Create a provider component
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [signingClient, setSigningClient] = useState<SigningCosmWasmClient | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const queryClient = useQueryClient();

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
        if (!window.getOfflineSigner || !window.keplr) {
            alert("Please install Keplr wallet extension.");
            setIsConnecting(false);
            return;
        }

        await window.keplr.enable(SEI_CHAIN_ID);
        const offlineSigner = window.getOfflineSigner(SEI_CHAIN_ID) as OfflineSigner;
        const accounts = await offlineSigner.getAccounts();
        
        if (accounts.length > 0) {
            const userAddress = accounts[0].address;
            setAddress(userAddress);
            
            const client = await SigningCosmWasmClient.connectWithSigner(SEI_RPC_URL, offlineSigner);
            setSigningClient(client);

            const userBalance = await client.getBalance(userAddress, "usei");
            const seiBalance = (parseFloat(userBalance.amount) / 1000000).toFixed(4);
            setBalance(`${seiBalance} SEI`);
        }
    } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert("Failed to connect wallet. See console for details.");
    } finally {
        setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    console.log('Disconnecting wallet...');
    setAddress(null);
    setBalance(null);
    setSigningClient(null);
    queryClient.clear();
  };
  
  const isConnected = !!address && !!signingClient;

  const value = { address, balance, isConnecting, isConnected, signingClient, connectWallet, disconnectWallet };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Create a custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 