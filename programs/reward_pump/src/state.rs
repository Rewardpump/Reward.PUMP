use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct ProgramState {
    /// The authority who can update program parameters
    pub authority: Pubkey,
    /// The mint address of the reward token
    pub reward_token_mint: Pubkey,
    /// Minimum amount of SOL required for dividend distribution
    pub minimum_dividend_amount: u64,
    /// Total number of distributions performed
    pub total_distributions: u64,
    /// Total amount of SOL distributed
    pub total_amount_distributed: u64,
    /// Last distribution timestamp
    pub last_distribution_time: i64,
    /// Reserved space for future program upgrades
    pub bump: u8,
}

#[account]
pub struct Distribution {
    /// The distribution ID
    pub id: u64,
    /// Amount of SOL distributed
    pub amount: u64,
    /// Number of recipients
    pub recipient_count: u32,
    /// Timestamp of distribution
    pub timestamp: i64,
    /// Reserved space for future program upgrades
    pub bump: u8,
}