use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("RewardPumpv1111111111111111111111111111111111");

#[program]
pub mod reward_pump {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        reward_token_mint: Pubkey,
        minimum_dividend_amount: u64,
    ) -> Result<()> {
        instructions::initialize::handler(ctx, reward_token_mint, minimum_dividend_amount)
    }

    pub fn distribute(
        ctx: Context<Distribute>,
        amount: u64,
    ) -> Result<()> {
        instructions::distribute::handler(ctx, amount)
    }
}