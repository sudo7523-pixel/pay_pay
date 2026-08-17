use soroban_sdk::{contract, contractimpl, panic_with_error, Address, Bytes, BytesN, Env, String};
use soroban_sdk::xdr::ToXdr;

use crate::admin;
use crate::errors::ContractError;
use crate::events;
use crate::storage;
use crate::token;
use crate::types::{Config, Payment, PaymentId, PaymentStatus};

#[contract]
pub struct PaymentContract;

#[contractimpl]
impl PaymentContract {
    // ── Initialization ──

    pub fn initialize(env: Env, admin: Address, fee_recipient: Address, fee_bps: u32) {
        admin::require_not_initialized(&env);

        if fee_bps > 10000 {
            panic_with_error!(&env, ContractError::FeeTooHigh);
        }

        let config = Config {
            admin,
            fee_bps,
            fee_recipient,
            paused: false,
            version: 1,
        };

        storage::set_config(&env, &config);
    }

    // ── Core Payment ──

    pub fn pay(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
        token: Address,
        nonce: BytesN<32>,
        memo: String,
        reference: String,
    ) -> BytesN<32> {
        from.require_auth();
        admin::require_initialized(&env);
        admin::require_not_paused(&env);
        admin::require_token_supported(&env, &token);

        if amount <= 0 {
            panic_with_error!(&env, ContractError::InvalidAmount);
        }
        if from == to {
            panic_with_error!(&env, ContractError::SelfPayment);
        }
        if memo.len() > 64 {
            panic_with_error!(&env, ContractError::InvalidMemoLength);
        }
        if reference.len() > 128 {
            panic_with_error!(&env, ContractError::InvalidReferenceLength);
        }

        let config = storage::get_config(&env);
        let payment_id = generate_payment_id(&env, &from, &to, &amount, &token, &nonce, &reference);

        if storage::has_payment(&env, &payment_id) {
            panic_with_error!(&env, ContractError::DuplicatePayment);
        }

        if !storage::use_nonce(&env, &from, &nonce) {
            panic_with_error!(&env, ContractError::NonceAlreadyUsed);
        }

        let (fee_amount, net_amount) = token::calculate_fee(amount, &config);
        let timestamp = env.ledger().timestamp();

        let payment = Payment {
            id: payment_id.clone(),
            from: from.clone(),
            to: to.clone(),
            amount,
            token: token.clone(),
            fee: fee_amount,
            fee_recipient: config.fee_recipient.clone(),
            memo,
            reference: reference.clone(),
            status: PaymentStatus::Completed,
            created_at: timestamp,
            completed_at: Some(timestamp),
        };

        storage::write_payment(&env, &payment);

        if fee_amount > 0 {
            token::transfer_tokens(
                &env,
                &token,
                &from,
                &config.fee_recipient,
                &fee_amount,
            );
        }

        token::transfer_tokens(&env, &token, &from, &to, &net_amount);

        storage::increase_merchant_count(&env, &to);
        storage::increase_customer_count(&env, &from);

        events::payment_completed(
            &env,
            &payment_id,
            &from,
            &to,
            &amount,
            &token,
            &fee_amount,
            reference,
            timestamp,
        );

        payment_id
    }

    // ── Read Functions ──

    pub fn get_payment(env: Env, id: BytesN<32>) -> Payment {
        admin::require_initialized(&env);
        storage::read_payment(&env, &id)
    }

    pub fn payment_exists(env: Env, id: BytesN<32>) -> bool {
        admin::require_initialized(&env);
        storage::has_payment(&env, &id)
    }

    pub fn merchant_total(env: Env, merchant: Address) -> u64 {
        admin::require_initialized(&env);
        storage::read_merchant_count(&env, &merchant)
    }

    pub fn customer_total(env: Env, customer: Address) -> u64 {
        admin::require_initialized(&env);
        storage::read_customer_count(&env, &customer)
    }

    pub fn get_config(env: Env) -> Config {
        admin::require_initialized(&env);
        storage::get_config(&env)
    }

    // ── Admin: Contract Management ──

    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
        let mut config = admin::require_admin(&env);
        config.version = config.version.saturating_add(1);
        storage::set_config(&env, &config);

        events::contract_upgraded(
            &env,
            config.version - 1,
            config.version,
            new_wasm_hash.clone(),
        );

        env.deployer().update_current_contract_wasm(new_wasm_hash);
    }

    pub fn set_paused(env: Env, paused: bool) {
        let config = admin::require_admin(&env);
        let mut new_config = config.clone();
        new_config.paused = paused;
        storage::set_config(&env, &new_config);

        events::config_updated(&env, None, None, None, Some(paused));
    }

    // ── Admin: Token Whitelist ──

    pub fn add_supported_token(env: Env, token: Address) {
        admin::require_admin(&env);
        if storage::is_token_supported(&env, &token) {
            panic_with_error!(&env, ContractError::AlreadySupported);
        }
        storage::add_supported_token(&env, &token);
    }

    pub fn remove_supported_token(env: Env, token: Address) {
        admin::require_admin(&env);
        if !storage::is_token_supported(&env, &token) {
            panic_with_error!(&env, ContractError::NotSupported);
        }
        storage::remove_supported_token(&env, &token);
    }

    // ── Admin: Fee Configuration ──

    pub fn set_fee(env: Env, fee_bps: u32, fee_recipient: Address) {
        let config = admin::require_admin(&env);
        if fee_bps > 10000 {
            panic_with_error!(&env, ContractError::FeeTooHigh);
        }
        let mut new_config = config;
        new_config.fee_bps = fee_bps;
        new_config.fee_recipient = fee_recipient.clone();
        storage::set_config(&env, &new_config);

        events::config_updated(&env, None, Some(fee_bps), Some(fee_recipient), None);
    }

    // ── Admin: Ownership Transfer ──

    pub fn set_admin(env: Env, new_admin: Address) {
        let config = admin::require_admin(&env);
        let mut new_config = config;
        new_config.admin = new_admin.clone();
        storage::set_config(&env, &new_config);

        events::config_updated(&env, Some(new_admin), None, None, None);
    }
}

// ── Internal Helpers ──

fn generate_payment_id(
    env: &Env,
    from: &Address,
    to: &Address,
    amount: &i128,
    token: &Address,
    nonce: &BytesN<32>,
    reference: &String,
) -> PaymentId {
    let mut combined = Bytes::new(env);
    combined.append(&from.to_xdr(env));
    combined.append(&to.to_xdr(env));
    combined.append(&token.to_xdr(env));
    combined.append(&nonce.clone().to_xdr(env));
    combined.append(&(*amount).to_xdr(env));
    combined.append(&reference.clone().to_xdr(env));

    env.crypto().sha256(&combined).into()
}
