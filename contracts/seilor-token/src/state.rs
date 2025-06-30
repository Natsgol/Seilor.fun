use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, Uint128};
use cw_storage_plus::{Item, Map};

#[cw_serde]
pub struct Config {
    pub admin: Addr,
    pub platform_fee_percent: u64,
    pub initial_price: Uint128,
    pub price_increment_multiplier: Uint128,
}

#[cw_serde]
pub struct TokenInfo {
    pub creator: Addr,
    pub creator_royalty_percent: u64,
    pub supply: Uint128,
    pub name: String,
    pub backstory: String,
    pub image_url: String,
}

pub const CONFIG: Item<Config> = Item::new("config");

// Maps the character token ID (a simple integer) to its info
pub const TOKENS: Map<u64, TokenInfo> = Map::new("tokens");

// A counter to keep track of the next token ID
pub const NEXT_TOKEN_ID: Item<u64> = Item::new("next_token_id");
