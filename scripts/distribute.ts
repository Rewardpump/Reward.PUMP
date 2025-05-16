import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';
import { CONFIG } from './config';
import { fetchTopHolders } from './fetch_holders';

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

// Helper function to get distribution PDA
async function getDistributionPDA(distributionId: number): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
        [Buffer.from(CONFIG.SEEDS.DISTRIBUTION), Buffer.from(distributionId.toString())],
        CONFIG.PROGRAM_ID
    );
}

// Main distribution function
async function distributeRewards() {
    try {
        // Get creator wallet balance
        const balance = await connection.getBalance(walletKeypair.publicKey);
        console.log(`Creator wallet balance: ${balance / 1e9} SOL`);

        if (balance < CONFIG.MINIMUM_DIVIDEND_AMOUNT * 1e9) {
            console.log('Insufficient balance for distribution');
            return;
        }

        // Fetch top holders
        const holders = await fetchTopHolders();
        console.log(`Fetched ${holders.length} top holders`);

        // Calculate total tokens held by top holders
        const totalTokens = holders.reduce((sum, holder) => sum + holder.amount, BigInt(0));

        // Get program state PDA
        const [programStatePDA] = await getProgramStatePDA();
        const programState = await provider.connection.getAccountInfo(programStatePDA);

        if (!programState) {
            console.log('Program state not initialized');
            return;
        }

        // Create distribution transaction
        const transaction = new Transaction();

        // Distribute rewards to each holder
        for (const holder of holders) {
            const holderShare = Number((BigInt(balance) * holder.amount) / totalTokens);
            
            if (holderShare < CONFIG.MINIMUM_DIVIDEND_AMOUNT * 1e9) {
                console.log(`Skipping holder ${holder.address.toBase58()} due to small amount`);
                continue;
            }

            const [distributionPDA] = await getDistributionPDA(programState.data[0]);

            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: walletKeypair.publicKey,
                    toPubkey: holder.address,
                    lamports: holderShare,
                })
            );

            console.log(`Distributing ${holderShare / 1e9} SOL to ${holder.address.toBase58()}`);
        }

        // Send and confirm transaction
        const signature = await provider.sendAndConfirm(transaction);
        console.log(`Distribution completed. Signature: ${signature}`);

    } catch (error) {
        console.error('Error during distribution:', error);
    }
}

// Start distribution loop
function startDistributionLoop() {
    console.log('Starting distribution loop...');
    
    setInterval(async () => {
        console.log('Running distribution...');
        await distributeRewards();
    }, CONFIG.DISTRIBUTION_INTERVAL);
}

// Start the distribution process
startDistributionLoop();