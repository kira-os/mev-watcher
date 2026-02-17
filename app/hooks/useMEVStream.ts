'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { MEVDetector, SandwichAttack, ArbitrageOpportunity } from '../lib/mev-detector';

interface JitoBundle {
  bundleId: string;
  transactions: string[];
  timestamp: number;
  landed: boolean;
  slot: number;
}

interface MEVStats {
  sandwichAttacks: number;
  arbitrageOps: number;
  totalAnalyzed: number;
  bundlesSeen: number;
  jitoBundles: number;
}

export function useMEVStream() {
  const [detector] = useState(() => new MEVDetector());
  const [stats, setStats] = useState<MEVStats>({
    sandwichAttacks: 0,
    arbitrageOps: 0,
    totalAnalyzed: 0,
    bundlesSeen: 0,
    jitoBundles: 0,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [recentDetections, setRecentDetections] = useState<(SandwichAttack | ArbitrageOpportunity)[]>([]);
  const [bundles, setBundles] = useState<JitoBundle[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to Jito bundle stream
  const connectJitoStream = useCallback(() => {
    try {
      // Jito bundles API endpoint (would use actual Jito API in production)
      const ws = new WebSocket('wss://mainnet.block-engine.jito.ws/api/v1/bundles/stream');
      
      ws.onopen = () => {
        console.log('Connected to Jito bundle stream');
        setIsConnected(true);
        
        // Subscribe to bundles
        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'subscribeBundles',
          params: []
        }));
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.params?.result) {
            const bundle: JitoBundle = {
              bundleId: data.params.result.bundleId,
              transactions: data.params.result.transactions || [],
              timestamp: Date.now(),
              landed: data.params.result.landed || false,
              slot: data.params.result.slot || 0,
            };

            setBundles(prev => [bundle, ...prev].slice(0, 100));
            setStats(prev => ({ ...prev, jitoBundles: prev.jitoBundles + 1 }));

            // Analyze each transaction in the bundle
            for (const signature of bundle.transactions) {
              const result = await detector.analyzeTransaction(signature);
              
              if (result.sandwich) {
                setRecentDetections(prev => [result.sandwich!, ...prev].slice(0, 50));
                setStats(prev => ({ 
                  ...prev, 
                  sandwichAttacks: prev.sandwichAttacks + 1,
                  totalAnalyzed: prev.totalAnalyzed + 1 
                }));
              }
              
              if (result.arbitrage) {
                setRecentDetections(prev => [result.arbitrage!, ...prev].slice(0, 50));
                setStats(prev => ({ 
                  ...prev, 
                  arbitrageOps: prev.arbitrageOps + 1,
                  totalAnalyzed: prev.totalAnalyzed + 1 
                }));
              }
            }
          }
        } catch (err) {
          console.error('Error processing bundle:', err);
        }
      };

      ws.onclose = () => {
        console.log('Jito stream disconnected');
        setIsConnected(false);
        // Auto-reconnect after 5 seconds
        setTimeout(connectJitoStream, 5000);
      };

      ws.onerror = (error) => {
        console.error('Jito stream error:', error);
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to connect to Jito stream:', err);
      setIsConnected(false);
    }
  }, [detector]);

  // Fallback to Helius WebSocket for transaction monitoring
  const connectHeliusStream = useCallback(() => {
    const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
    if (!HELIUS_API_KEY) {
      console.warn('No Helius API key, using simulation mode');
      return;
    }

    const ws = new WebSocket(`wss://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`);
    
    ws.onopen = () => {
      console.log('Connected to Helius stream');
      setIsConnected(true);
      
      // Subscribe to account changes for major DEXes
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'accountSubscribe',
        params: [
          'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter
          { commitment: 'confirmed', encoding: 'jsonParsed' }
        ]
      }));
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.params?.result?.value) {
          // Process account changes for MEV detection
          setStats(prev => ({ ...prev, totalAnalyzed: prev.totalAnalyzed + 1 }));
        }
      } catch (err) {
        console.error('Error processing Helius message:', err);
      }
    };

    ws.onclose = () => {
      console.log('Helius stream disconnected');
      setIsConnected(false);
      setTimeout(connectHeliusStream, 5000);
    };

    wsRef.current = ws;
  }, []);

  // Simulation mode for development/demo
  const startSimulation = useCallback(() => {
    console.log('Starting MEV simulation mode');
    setIsConnected(true);
    
    const interval = setInterval(() => {
      // Simulate random MEV detection
      const random = Math.random();
      
      if (random < 0.1) {
        // Simulate sandwich attack
        const sandwich: SandwichAttack = {
          victimTx: Math.random().toString(36).substring(7),
          frontrunTx: Math.random().toString(36).substring(7),
          backrunTx: Math.random().toString(36).substring(7),
          tokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
          profit: Math.random() * 1000,
          timestamp: Date.now(),
        };
        
        setRecentDetections(prev => [sandwich, ...prev].slice(0, 50));
        setStats(prev => ({
          ...prev,
          sandwichAttacks: prev.sandwichAttacks + 1,
          totalAnalyzed: prev.totalAnalyzed + 1,
        }));
      } else if (random < 0.2) {
        // Simulate arbitrage
        const arbitrage: ArbitrageOpportunity = {
          buyDex: 'Jupiter',
          sellDex: 'Raydium',
          tokenIn: 'So11111111111111111111111111111111111111112', // SOL
          tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
          profitPercent: Math.random() * 5,
          timestamp: Date.now(),
        };
        
        setRecentDetections(prev => [arbitrage, ...prev].slice(0, 50));
        setStats(prev => ({
          ...prev,
          arbitrageOps: prev.arbitrageOps + 1,
          totalAnalyzed: prev.totalAnalyzed + 1,
        }));
      } else {
        setStats(prev => ({
          ...prev,
          totalAnalyzed: prev.totalAnalyzed + 1,
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Try to connect to real streams, fallback to simulation
    const hasJitoAccess = false; // Would check env/config
    const hasHeliusKey = !!process.env.NEXT_PUBLIC_HELIUS_API_KEY;

    if (hasJitoAccess) {
      connectJitoStream();
    } else if (hasHeliusKey) {
      connectHeliusStream();
    } else {
      startSimulation();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectJitoStream, connectHeliusStream, startSimulation]);

  return {
    stats,
    isConnected,
    recentDetections,
    bundles,
  };
}
