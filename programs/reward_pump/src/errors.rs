use anchor_lang::prelude::*;

#[error_code]
pub enum RewardPumpError {
    #[msg("Invalid authority")]
    InvalidAuthority,

    #[msg("Invalid reward token mint")]
    InvalidRewardTokenMint,

    #[msg("Distribution amount too small")]
    DistributionAmountTooSmall,

    #[msg("Distribution too frequent")]
    DistributionTooFrequent,

    #[msg("Invalid token account owner")]
    InvalidTokenAccountOwner,

    #[msg("Insufficient balance")]
    InsufficientBalance,

    #[msg("Invalid distribution ID")]
    InvalidDistributionId,

    #[msg("Calculation overflow")]
    CalculationOverflow,

    #[msg("Invalid recipient count")]
    InvalidRecipientCount,

    #[msg("Distribution in progress")]
    DistributionInProgress,
}