import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';

export interface SandwichAttack {
  victimTx: string;
  frontrunTx: string;
  backrunTx: string;
  tokenAddress: string;
  profit: number;
  timestamp: number;
  slot: number;
}

export interface ArbitrageOpportunity {
  buyDex: string;
  sellDex: string;
  tokenIn: string;
  tokenOut: string;
  profitPercent: number;
  timestamp: number;
  slot: number;
}

// Common DEX program IDs
const DEX_PROGRAMS = {
  JUPITER: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
  RAYDIUM: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
  ORCA: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
  PHOENIX: 'PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqd',
  METEORA: 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo',
};

// Token addresses for common pairs
const COMMON_TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
};

interface TransactionAnalysis {
  signature: string;
  timestamp: number;
  slot: number;
  dexInteractions: string[];
  tokenTransfers: TokenTransfer[];
  swapEvents: SwapEvent[];
}

interface TokenTransfer {
  from: string;
  to: string;
  amount: number;
  token: string;
}

interface SwapEvent {
  dex: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
}

export class MEVDetector {
  private recentTransactions: Map<string, TransactionAnalysis> = new Map();
  private pendingSwaps: Map<string, SwapEvent[]> = new Map();
  private sandwichAttacks: SandwichAttack[] = [];
  private arbitrageOps: ArbitrageOpportunity[] = [];
  private connection: Connection | null = null;
  private readonly MAX_HISTORY = 1000;

  constructor(rpcUrl?: string) {
    if (rpcUrl) {
      this.connection = new Connection(rpcUrl);
    }
  }

  async analyzeTransaction(signature: string): Promise<{
    sandwich: SandwichAttack | null;
    arbitrage: ArbitrageOpportunity | null;
  }> {
    try {
      let txData: ParsedTransactionWithMeta | null = null;
      
      if (this.connection) {
        txData = await this.connection.getParsedTransaction(signature, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0,
        });
      }

      const analysis = this.parseTransaction(signature, txData);
      this.recentTransactions.set(signature, analysis);

      // Clean old transactions
      if (this.recentTransactions.size > this.MAX_HISTORY) {
        const oldestKey = this.recentTransactions.keys().next().value;
        this.recentTransactions.delete(oldestKey);
      }

      // Check for sandwich pattern
      const sandwich = this.detectSandwich(analysis);
      if (sandwich) {
        this.sandwichAttacks.push(sandwich);
      }

      // Check for arbitrage
      const arbitrage = this.detectArbitrage(analysis);
      if (arbitrage) {
        this.arbitrageOps.push(arbitrage);
      }

      return { sandwich, arbitrage };
    } catch (err) {
      console.error('Error analyzing transaction:', err);
      return { sandwich: null, arbitrage: null };
    }
  }

  private parseTransaction(
    signature: string,
    txData: ParsedTransactionWithMeta | null
  ): TransactionAnalysis {
    const analysis: TransactionAnalysis = {
      signature,
      timestamp: Date.now(),
      slot: txData?.slot || 0,
      dexInteractions: [],
      tokenTransfers: [],
      swapEvents: [],
    };

    if (!txData || !txData.meta) {
      return analysis;
    }

    // Parse DEX interactions
    const accountKeys = txData.transaction.message.accountKeys;
    
    for (const key of accountKeys) {
      const pubkey = key.pubkey.toString();
      
      if (Object.values(DEX_PROGRAMS).includes(pubkey)) {
        const dexName = Object.entries(DEX_PROGRAMS).find(
          ([_, id]) => id === pubkey
        )?.[0];
        if (dexName) {
          analysis.dexInteractions.push(dexName);
        }
      }
    }

    // Parse token transfers from meta
    if (txData.meta.postTokenBalances && txData.meta.preTokenBalances) {
      // Compare pre and post balances to detect transfers
      // This is simplified - real implementation would be more complex
    }

    return analysis;
  }

  private detectSandwich(analysis: TransactionAnalysis): SandwichAttack | null {
    // Get recent transactions in the same slot
    const recentTxs = Array.from(this.recentTransactions.values())
      .filter(tx => 
        tx.slot === analysis.slot && 
        tx.signature !== analysis.signature &&
        analysis.timestamp - tx.timestamp < 500 // Within 500ms
      );

    for (const otherTx of recentTxs) {
      // Check for sandwich pattern:
      // 1. Another tx swaps the same token pair in the same block
      // 2. One tx is frontrun (buys before victim)
      // 3. One tx is backrun (sells after victim)
      
      const commonDex = analysis.dexInteractions.find(dex => 
        otherTx.dexInteractions.includes(dex)
      );

      if (commonDex && this.isSandwichPattern(analysis, otherTx)) {
        return {
          victimTx: analysis.signature,
          frontrunTx: otherTx.signature,
          backrunTx: analysis.signature, // Simplified - would track separately
          tokenAddress: this.getCommonToken(analysis, otherTx) || '',
          profit: this.estimateSandwichProfit(analysis, otherTx),
          timestamp: Date.now(),
          slot: analysis.slot,
        };
      }
    }

    return null;
  }

  private detectArbitrage(analysis: TransactionAnalysis): ArbitrageOpportunity | null {
    // Check for arbitrage pattern:
    // 1. Multiple DEX interactions in same transaction
    // 2. Token A -> Token B on DEX1, Token B -> Token A on DEX2
    
    if (analysis.dexInteractions.length < 2) {
      return null;
    }

    // Check for circular trades (A -> B -> A)
    const tokens = this.extractTokens(analysis);
    
    if (tokens.length >= 2) {
      const startToken = tokens[0];
      const endToken = tokens[tokens.length - 1];
      
      // If we end up with the same token we started with, it's arbitrage
      if (startToken === endToken && tokens.length > 2) {
        const buyDex = analysis.dexInteractions[0];
        const sellDex = analysis.dexInteractions[1];
        
        return {
          buyDex,
          sellDex,
          tokenIn: tokens[0],
          tokenOut: tokens[1],
          profitPercent: this.estimateArbitrageProfit(analysis),
          timestamp: Date.now(),
          slot: analysis.slot,
        };
      }
    }

    return null;
  }

  private isSandwichPattern(tx1: TransactionAnalysis, tx2: TransactionAnalysis): boolean {
    // Simplified check - would be more sophisticated in production
    const sharedTokens = tx1.dexInteractions.filter(dex => 
      tx2.dexInteractions.includes(dex)
    );
    return sharedTokens.length > 0;
  }

  private getCommonToken(tx1: TransactionAnalysis, tx2: TransactionAnalysis): string | null {
    // Extract and compare tokens
    return null; // Placeholder
  }

  private extractTokens(analysis: TransactionAnalysis): string[] {
    // Extract token addresses from swap events
    return analysis.swapEvents.flatMap(swap => [swap.tokenIn, swap.tokenOut]);
  }

  private estimateSandwichProfit(tx1: TransactionAnalysis, tx2: TransactionAnalysis): number {
    // Would calculate actual profit from token balance changes
    return Math.random() * 1000; // Placeholder
  }

  private estimateArbitrageProfit(analysis: TransactionAnalysis): number {
    // Would calculate profit from price differences
    return Math.random() * 5; // Placeholder - 0-5%
  }

  getStats() {
    return {
      sandwichAttacks: this.sandwichAttacks.length,
      arbitrageOps: this.arbitrageOps.length,
      totalAnalyzed: this.recentTransactions.size,
      recentSandwiches: this.sandwichAttacks.slice(-10),
      recentArbitrage: this.arbitrageOps.slice(-10),
    };
  }

  getRecentDetections(): (SandwichAttack | ArbitrageOpportunity)[] {
    const sandwiches = this.sandwichAttacks.slice(-25);
    const arbitrages = this.arbitrageOps.slice(-25);
    
    // Combine and sort by timestamp
    return [...sandwiches, ...arbitrages]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);
  }
}
