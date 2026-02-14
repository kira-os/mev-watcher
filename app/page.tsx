'use client';

import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';

export default function MEVDashboard() {
  const [sandwichCount, setSandwichCount] = useState(0);
  const [arbitrageCount, setArbitrageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading MEV data
    setTimeout(() => {
      setSandwichCount(12);
      setArbitrageCount(47);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Solana MEV Watcher</h1>
      
      {isLoading ? (
        <p>Loading MEV data...</p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Sandwich Attacks (24h)</h2>
            <p className="text-3xl font-bold text-red-400">{sandwichCount}</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Arbitrage Opportunities (24h)</h2>
            <p className="text-3xl font-bold text-green-400">{arbitrageCount}</p>
          </div>
        </div>
      )}
    </div>
  );
}
