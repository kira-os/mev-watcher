import { Connection, PublicKey } from '@solana/web3.js';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export const connection = new Connection(RPC_URL, 'confirmed');

// Common DEX program IDs for MEV detection
export const DEX_PROGRAMS = {
  JUPITER: new PublicKey('JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'),
  RAYDIUM: new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'),
  ORCA: new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'),
  METEORA: new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo'),
};

export interface SandwichAttack {
  victimTx: string;
  frontrunTx: string;
  backrunTx: string;
  profit: number;
  timestamp: number;
}

export interface ArbitrageOpportunity {
  buyDex: string;
  sellDex: string;
  tokenIn: string;
  tokenOut: string;
  profit: number;
  timestamp: number;
}

export async function getRecentTransactions(limit: number = 100) {
  // Placeholder for Helius API integration
  return [];
}
