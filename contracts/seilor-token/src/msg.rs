use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::Uint128;
use crate::state::TokenInfo;

#[cw_serde]
pub struct InstantiateMsg {
    pub platform_fee_percent: u64,
    pub initial_price: Uint128,
    pub price_increment_multiplier: Uint128,
}

#[cw_serde]
pub enum ExecuteMsg {
    Mint {
        creator_royalty_percent: u64,
        name: String,
        backstory: String,
        image_url: String,
    },
    Buy {
        token_id: u64,
    },
    Sell {
        token_id: u64,
    },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(GetPriceResponse)]
    GetPrice { token_id: u64, amount: Uint128 },

    #[returns(TokenInfo)]
    GetTokenInfo { token_id: u64 },
}

#[cw_serde]
pub struct GetPriceResponse {
    pub price: Uint128,
}
