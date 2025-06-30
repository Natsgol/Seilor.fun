use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("Royalty percent must be between 0 and 20")]
    InvalidRoyaltyPercent {},
    
    #[error("Token not found")]
    TokenNotFound {},

    #[error("No funds were sent to the contract")]
    NoFundsSent {},

    #[error("Insufficient funds sent to the contract")]
    InsufficientFunds {},

    #[error("There are no tokens of this type to sell")]
    NoTokensToSell {},
    // Add any other custom errors you like here.
    // Look at https://docs.rs/thiserror/1.0.21/thiserror/ for details.
}
