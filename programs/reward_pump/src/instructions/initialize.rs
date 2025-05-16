use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::state::ProgramState;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<ProgramState>(),
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    pub reward_token_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<Initialize>,
    reward_token_mint: Pubkey,
    minimum_dividend_amount: u64,
) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;

    program_state.authority = ctx.accounts.authority.key();
    program_state.reward_token_mint = reward_token_mint;
    program_state.minimum_dividend_amount = minimum_dividend_amount;
    program_state.total_distributions = 0;
    program_state.total_amount_distributed = 0;
    program_state.last_distribution_time = Clock::get()?.unix_timestamp;
    program_state.bump = *ctx.bumps.get("program_state").unwrap();

    Ok(())
}