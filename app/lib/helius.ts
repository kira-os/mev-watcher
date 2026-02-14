import { Helius } from 'helius-sdk';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';

export const helius = new Helius(HELIUS_API_KEY);

export async function getRecentTransactions(address: string, limit: number = 100) {
  try {
    const response = await helius.rpc.getSignaturesForAddress(
      { address, limit }
    );
    return response;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function parseTransaction(signature: string) {
  try {
    const response = await helius.rpc.getTransaction(signature);
    return response;
  } catch (error) {
    console.error('Error parsing transaction:', error);
    return null;
  }
}
