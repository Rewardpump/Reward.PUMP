import { PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
    // Program ID
    PROGRAM_ID: new PublicKey('RewardPumpv1111111111111111111111111111111111'),

    // Creator wallet keypair path
    CREATOR_WALLET_KEYPAIR: process.env.CREATOR_WALLET_KEYPAIR || '',

    // Reward token mint address
    REWARD_TOKEN_MINT: new PublicKey(process.env.REWARD_TOKEN_MINT || ''),

    // Minimum dividend amount in SOL
    MINIMUM_DIVIDEND_AMOUNT: Number(process.env.MINIMUM_DIVIDEND_AMOUNT || 0.01),

    // Number of top holders to receive dividends
    TOP_HOLDERS_COUNT: 500,

    // Distribution interval in milliseconds (10 minutes)
    DISTRIBUTION_INTERVAL: 10 * 60 * 1000,

    // RPC endpoint
    RPC_ENDPOINT: process.env.RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com',

    // Seeds for PDA derivation
    SEEDS: {
        PROGRAM_STATE: 'program_state',
        DISTRIBUTION: 'distribution',
    },
};