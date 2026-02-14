import { createHelius } from 'helius-sdk';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';

export const helius = createHelius({ apiKey: HELIUS_API_KEY });

// Export for use in other modules
export default helius;
