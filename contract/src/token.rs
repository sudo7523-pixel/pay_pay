use soroban_sdk::{panic_with_error, Address, Env};
use soroban_sdk::token::Client as TokenClient;

use crate::errors::ContractError;
use crate::types::Config;

pub fn transfer_tokens(
    env: &Env,
    token: &Address,
    from: &Address,
    to: &Address,
    amount: &i128,
) {
    let token_client = TokenClient::new(env, token);
    let result = token_client.try_transfer(from, to, amount);
    match result {
        Ok(_) => {}
        Err(_) => {
            panic_with_error!(env, ContractError::TokenTransferFailed);
        }
    }
}

pub fn calculate_fee(amount: i128, config: &Config) -> (i128, i128) {
    if config.fee_bps == 0 {
        return (0_i128, amount);
    }
    let fee = amount
        .checked_mul(config.fee_bps as i128)
        .map(|v| v / 10000)
        .unwrap_or(0);
    let net = amount.checked_sub(fee).unwrap_or(amount);
    (fee, net)
}
