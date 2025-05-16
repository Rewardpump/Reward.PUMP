use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::errors::RewardPumpError;
use crate::state::{Distribution, ProgramState};

#[derive(Accounts)]
pub struct Distribute<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"program_state"],
        bump = program_state.bump
    )]
    pub program_state: Account<'info, ProgramState>,

    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<Distribution>(),
        seeds = [b"distribution", program_state.total_distributions.to_le_bytes().as_ref()],
        bump
    )]
    pub distribution: Account<'info, Distribution>,

    #[account(mut)]
    pub creator_wallet: SystemAccount<'info>,

    /// CHECK: Account will be checked in handler
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Distribute>, amount: u64) -> Result<()> {
    let program_state = &mut ctx.accounts.program_state;
    let distribution = &mut ctx.accounts.distribution;
    let current_time = Clock::get()?.unix_timestamp;

    // Verify authority
    require_keys_eq!(
        ctx.accounts.authority.key(),
        program_state.authority,
        RewardPumpError::InvalidAuthority
    );

    // Check minimum amount
    require_gt!(
        amount,
        program_state.minimum_dividend_amount,
        RewardPumpError::DistributionAmountTooSmall
    );

    // Check distribution frequency (10 minutes = 600 seconds)
    require_gt!(
        current_time - program_state.last_distribution_time,
        600,
        RewardPumpError::DistributionTooFrequent
    );

    // Transfer SOL from creator wallet to recipient
    let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.creator_wallet.key(),
        &ctx.accounts.recipient.key(),
        amount,
    );

    anchor_lang::solana_program::program::invoke(
        &transfer_ix,
        &[
            ctx.accounts.creator_wallet.to_account_info(),
            ctx.accounts.recipient.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // Update distribution record
    distribution.id = program_state.total_distributions;
    distribution.amount = amount;
    distribution.recipient_count = 1;
    distribution.timestamp = current_time;
    distribution.bump = *ctx.bumps.get("distribution").unwrap();

    // Update program state
    program_state.total_distributions += 1;
    program_state.total_amount_distributed += amount;
    program_state.last_distribution_time = current_time;

    Ok(())
}