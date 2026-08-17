use soroban_sdk::{panic_with_error, Address, Env};

use crate::errors::ContractError;
use crate::storage;
use crate::types::Config;

pub fn require_admin(env: &Env) -> Config {
    let config = storage::get_config(env);
    config.admin.require_auth();
    config
}

pub fn require_not_paused(env: &Env) {
    let config = storage::get_config(env);
    if config.paused {
        panic_with_error!(env, ContractError::ContractPaused);
    }
}

pub fn require_token_supported(env: &Env, token: &Address) {
    if !storage::is_token_supported(env, token) {
        panic_with_error!(env, ContractError::UnsupportedToken);
    }
}

pub fn require_initialized(env: &Env) {
    if !storage::has_config(env) {
        panic_with_error!(env, ContractError::NotInitialized);
    }
}

pub fn require_not_initialized(env: &Env) {
    if storage::has_config(env) {
        panic_with_error!(env, ContractError::AlreadyInitialized);
    }
}
