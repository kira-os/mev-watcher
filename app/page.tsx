'use client';

import { useMEVStream } from '../hooks/useMEVStream';

export default function MEVDashboard() {
  const { stats, isConnected, recentDetections } = useMEVStream();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Solana MEV Watcher</h1>
          <p className="text-slate-400">
            Real-time MEV detection and analysis
          </p>
          <div className={`inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full text-sm ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {isConnected ? 'Live' : 'Disconnected'}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Sandwich Attacks (24h)" 
            value={stats.sandwichAttacks} 
            color="red"
            icon="🥪"
          />
          <StatCard 
            title="Arbitrage Ops (24h)" 
            value={stats.arbitrageOps} 
            color="green"
            icon="⚡"
          />
          <StatCard 
            title="Tx Analyzed" 
            value={stats.totalAnalyzed} 
            color="blue"
            icon="📊"
          />
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Detections</h2>
          {recentDetections.length === 0 ? (
            <p className="text-slate-400">No MEV activity detected yet...</p>
          ) : (
            <div className="space-y-3">
              {recentDetections.map((detection, i) => (
                <DetectionRow key={i} detection={detection} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }: { 
  title: string; 
  value: number; 
  color: 'red' | 'green' | 'blue';
  icon: string;
}) {
  const colorClasses = {
    red: 'bg-red-500/10 border-red-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold">{value.toLocaleString()}</div>
      <div className="text-slate-400 text-sm">{title}</div>
    </div>
  );
}

function DetectionRow({ detection }: { detection: any }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
      <div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          detection.type === 'sandwich' 
            ? 'bg-red-500/20 text-red-400' 
            : 'bg-green-500/20 text-green-400'
        }`}>
          {detection.type === 'sandwich' ? 'Sandwich' : 'Arbitrage'}
        </span>
        <p className="text-sm text-slate-300 mt-1">
          {detection.signature?.slice(0, 20)}...
        </p>
      </div>
      <div className="text-right">
        <div className="text-green-400 font-medium">
          +{detection.profit?.toFixed(4)} SOL
        </div>
        <div className="text-slate-400 text-sm">
          {new Date(detection.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
