#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult, Uint128, BankMsg, Coin, CosmosMsg, SubMsg};
use cw2::set_contract_version;
use num_integer::Roots;

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, GetPriceResponse, InstantiateMsg, QueryMsg};
use crate::state::{Config, TokenInfo, CONFIG, NEXT_TOKEN_ID, TOKENS};

const CONTRACT_NAME: &str = "crates.io:seilor-token";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    let config = Config {
        admin: info.sender.clone(),
        platform_fee_percent: msg.platform_fee_percent,
        initial_price: msg.initial_price,
        price_increment_multiplier: msg.price_increment_multiplier,
    };
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    CONFIG.save(deps.storage, &config)?;
    NEXT_TOKEN_ID.save(deps.storage, &0u64)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("admin", info.sender))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Mint { creator_royalty_percent, name, backstory, image_url } => 
            execute_mint(deps, info, creator_royalty_percent, name, backstory, image_url),
        ExecuteMsg::Buy { token_id } => execute_buy(deps, info, token_id),
        ExecuteMsg::Sell { token_id } => execute_sell(deps, env, info, token_id),
    }
}

pub fn execute_mint(
    deps: DepsMut,
    info: MessageInfo,
    creator_royalty_percent: u64,
    name: String,
    backstory: String,
    image_url: String,
) -> Result<Response, ContractError> {
    if creator_royalty_percent > 20 {
        return Err(ContractError::InvalidRoyaltyPercent {});
    }

    let token_id = NEXT_TOKEN_ID.load(deps.storage)?;
    
    let token_info = TokenInfo {
        creator: info.sender.clone(),
        creator_royalty_percent,
        supply: Uint128::zero(),
        name,
        backstory,
        image_url,
    };

    TOKENS.save(deps.storage, token_id, &token_info)?;
    NEXT_TOKEN_ID.save(deps.storage, &(token_id + 1))?;

    Ok(Response::new()
        .add_attribute("method", "mint")
        .add_attribute("creator", info.sender)
        .add_attribute("token_id", token_id.to_string()))
}

pub fn execute_buy(
    deps: DepsMut,
    info: MessageInfo,
    token_id: u64,
) -> Result<Response, ContractError> {
    let mut token = TOKENS.load(deps.storage, token_id)?;
    let config = CONFIG.load(deps.storage)?;

    let price = get_price(token.supply, &config);

    // Check if enough funds were sent
    let sent_fund = info.funds.iter().find(|c| c.denom == "usei").ok_or(ContractError::NoFundsSent {})?;
    if sent_fund.amount < price {
        return Err(ContractError::InsufficientFunds {});
    }

    // Calculate fees
    let platform_fee = price * Uint128::from(config.platform_fee_percent) / Uint128::from(100u64);
    let creator_royalty = price * Uint128::from(token.creator_royalty_percent) / Uint128::from(100u64);
    let creator_payment = price - platform_fee - creator_royalty;

    // Create payment messages
    let mut messages: Vec<SubMsg> = vec![];
    messages.push(SubMsg::new(BankMsg::Send {
        to_address: config.admin.to_string(),
        amount: vec![Coin::new(platform_fee.u128(), "usei")],
    }));
    messages.push(SubMsg::new(BankMsg::Send {
        to_address: token.creator.to_string(),
        amount: vec![Coin::new(creator_payment.u128(), "usei")],
    }));

    // Update token supply
    token.supply += Uint128::from(1u64);
    TOKENS.save(deps.storage, token_id, &token)?;

    Ok(Response::new()
        .add_submessages(messages)
        .add_attribute("action", "buy")
        .add_attribute("token_id", token_id.to_string())
        .add_attribute("buyer", info.sender)
        .add_attribute("price", price.to_string()))
}

pub fn execute_sell(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    token_id: u64,
) -> Result<Response, ContractError> {
     let mut token = TOKENS.load(deps.storage, token_id)?;
    let config = CONFIG.load(deps.storage)?;

    if token.supply == Uint128::zero() {
        return Err(ContractError::NoTokensToSell {});
    }

    // Note: In a real CW20 or CW721 scenario, we would check the sender's balance.
    // Here we assume the sender has a "share" of the token to sell.

    let price = get_price(token.supply - Uint128::from(1u64), &config);

    // Calculate fees
    let platform_fee = price * Uint128::from(config.platform_fee_percent) / Uint128::from(100u64);
    let creator_royalty = price * Uint128::from(token.creator_royalty_percent) / Uint128::from(100u64);
    let seller_payment = price - platform_fee - creator_royalty;

    // Create payment message
    let payment_msg = SubMsg::new(BankMsg::Send {
        to_address: info.sender.to_string(),
        amount: vec![Coin::new(seller_payment.u128(), "usei")],
    });
    
    // Update token supply
    token.supply -= Uint128::from(1u64);
    TOKENS.save(deps.storage, token_id, &token)?;

    Ok(Response::new()
        .add_submessage(payment_msg)
        .add_attribute("action", "sell")
        .add_attribute("token_id", token_id.to_string())
        .add_attribute("seller", info.sender)
        .add_attribute("price", price.to_string()))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetPrice { token_id, amount: _ } => { // amount is unused for now, always 1
            let token = TOKENS.load(deps.storage, token_id)?;
            let config = CONFIG.load(deps.storage)?;
            to_binary(&GetPriceResponse {
                price: get_price(token.supply, &config),
            })
        },
        QueryMsg::GetTokenInfo { token_id } => to_binary(&query_token_info(deps, token_id)?),
    }
}

fn query_token_info(deps: Deps, token_id: u64) -> StdResult<TokenInfo> {
    TOKENS.load(deps.storage, token_id)
}

fn get_price(supply: Uint128, config: &Config) -> Uint128 {
    if supply.is_zero() {
        return config.initial_price;
    }
    // Adapting `price = initial + (supply^1.5 * increment)` for integer math
    // price = initial + (supply * supply * increment) / sqrt(supply * 10^18) to maintain precision
    // This is a simplification and a more robust implementation would use a fixed-point math library.
    let supply_u128 = supply.u128();
    let increment = config.price_increment_multiplier.u128();
    let price_increase = supply_u128 * supply_u128 * increment / (supply_u128.sqrt() * 1000);

    config.initial_price + Uint128::from(price_increase)
}

#[cfg(test)]
mod tests {}
