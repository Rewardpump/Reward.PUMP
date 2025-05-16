import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, workspace } from '@project-serum/anchor';
import { CONFIG } from '../scripts/config';
import fs from 'fs';

// Initialize connection and wallet
const connection = new Connection(CONFIG.RPC_ENDPOINT, 'confirmed');
const walletKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(CONFIG.CREATOR_WALLET_KEYPAIR, 'utf-8')))
);
const wallet = new Wallet(walletKeypair);
const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });

// Helper function to get program state PDA
async function getProgramStatePDA(): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
        [Buffer.from(CONFIG.SEEDS.PROGRAM_STATE)],
        CONFIG.PROGRAM_ID
    );
}

// Main deployment function
async function deploy() {
    try {
        console.log('Starting deployment...');

        // Get the program
        const program = workspace.RewardPump as Program;

        // Get program state PDA
        const [programStatePDA] = await getProgramStatePDA();

        console.log('Initializing program state...');

        // Initialize program state
        await program.methods
            .initialize(
                CONFIG.REWARD_TOKEN_MINT,
                new anchor.BN(CONFIG.MINIMUM_DIVIDEND_AMOUNT * 1e9)
            )
            .accounts({
                authority: walletKeypair.publicKey,
                programState: programStatePDA,
                rewardTokenMint: CONFIG.REWARD_TOKEN_MINT,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .rpc();

        console.log('Program state initialized');
        console.log('Deployment completed successfully');

    } catch (error) {
        console.error('Error during deployment:', error);
        process.exit(1);
    }
}

// Run deployment
deploy();