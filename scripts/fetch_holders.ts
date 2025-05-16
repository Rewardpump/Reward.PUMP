import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { CONFIG } from './config';

// Interface for token holder data
interface TokenHolder {
    address: PublicKey;
    amount: bigint;
}

// Function to fetch token accounts for a mint
async function getTokenAccounts(connection: Connection, mintAddress: PublicKey): Promise<TokenHolder[]> {
    try {
        const accounts = await connection.getProgramAccounts(
            TOKEN_PROGRAM_ID,
            {
                filters: [
                    {
                        dataSize: 165, // Size of token account data
                    },
                    {
                        memcmp: {
                            offset: 0,
                            bytes: mintAddress.toBase58(),
                        },
                    },
                ],
            }
        );

        return accounts.map(account => {
            const data = Buffer.from(account.account.data);
            const amount = data.readBigUInt64LE(64); // Amount is stored at offset 64

            return {
                address: account.pubkey,
                amount,
            };
        });
    } catch (error) {
        console.error('Error fetching token accounts:', error);
        return [];
    }
}

// Function to fetch top token holders
export async function fetchTopHolders(): Promise<TokenHolder[]> {
    const connection = new Connection(CONFIG.RPC_ENDPOINT, 'confirmed');

    try {
        console.log('Fetching token holders...');
        
        // Get all token accounts
        const holders = await getTokenAccounts(connection, CONFIG.REWARD_TOKEN_MINT);
        
        // Sort holders by amount in descending order
        const sortedHolders = holders
            .sort((a, b) => {
                if (b.amount > a.amount) return 1;
                if (b.amount < a.amount) return -1;
                return 0;
            })
            // Take only top holders based on configuration
            .slice(0, CONFIG.TOP_HOLDERS_COUNT);

        console.log(`Found ${sortedHolders.length} top holders`);
        
        return sortedHolders;
    } catch (error) {
        console.error('Error in fetchTopHolders:', error);
        return [];
    }
}

// For testing purposes
if (require.main === module) {
    fetchTopHolders().then(holders => {
        console.log('Top holders:');
        holders.forEach((holder, index) => {
            console.log(`${index + 1}. ${holder.address.toBase58()}: ${holder.amount.toString()} tokens`);
        });
    });
}