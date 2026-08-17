use soroban_sdk::{contracttype, Address, BytesN, Env};

use crate::types::{Config, Payment, PaymentId};

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub enum DataKey {
    Config,
    Payment(BytesN<32>),
    MerchantPaymentCount(Address),
    CustomerPaymentCount(Address),
    SupportedToken(Address),
    Nonce(Address, BytesN<32>),
}

// ── Config ──

pub fn has_config(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Config)
}

pub fn get_config(env: &Env) -> Config {
    env.storage()
        .instance()
        .get(&DataKey::Config)
        .expect("contract not initialized")
}

pub fn set_config(env: &Env, config: &Config) {
    env.storage().instance().set(&DataKey::Config, config);
}

// ── Payments ──

pub fn has_payment(env: &Env, id: &PaymentId) -> bool {
    env.storage().persistent().has(&DataKey::Payment(id.clone()))
}

pub fn write_payment(env: &Env, payment: &Payment) {
    env.storage()
        .persistent()
        .set(&DataKey::Payment(payment.id.clone()), payment);
}

pub fn read_payment(env: &Env, id: &PaymentId) -> Payment {
    env.storage()
        .persistent()
        .get(&DataKey::Payment(id.clone()))
        .expect("payment not found")
}

// ── Merchant Payment Counters ──

pub fn increase_merchant_count(env: &Env, merchant: &Address) {
    let key = DataKey::MerchantPaymentCount(merchant.clone());
    let count: u64 = env.storage().persistent().get(&key).unwrap_or(0);
    env.storage()
        .persistent()
        .set(&key, &(count.saturating_add(1)));
}

pub fn read_merchant_count(env: &Env, merchant: &Address) -> u64 {
    env.storage()
        .persistent()
        .get(&DataKey::MerchantPaymentCount(merchant.clone()))
        .unwrap_or(0)
}

// ── Customer Payment Counters ──

pub fn increase_customer_count(env: &Env, customer: &Address) {
    let key = DataKey::CustomerPaymentCount(customer.clone());
    let count: u64 = env.storage().persistent().get(&key).unwrap_or(0);
    env.storage()
        .persistent()
        .set(&key, &(count.saturating_add(1)));
}

pub fn read_customer_count(env: &Env, customer: &Address) -> u64 {
    env.storage()
        .persistent()
        .get(&DataKey::CustomerPaymentCount(customer.clone()))
        .unwrap_or(0)
}

// ── Supported Token Whitelist ──

pub fn is_token_supported(env: &Env, token: &Address) -> bool {
    env.storage()
        .persistent()
        .has(&DataKey::SupportedToken(token.clone()))
}

pub fn add_supported_token(env: &Env, token: &Address) {
    env.storage()
        .persistent()
        .set(&DataKey::SupportedToken(token.clone()), &());
}

pub fn remove_supported_token(env: &Env, token: &Address) {
    env.storage()
        .persistent()
        .remove(&DataKey::SupportedToken(token.clone()));
}

// ── Nonce (Replay Prevention) ──

const NONCE_TTL: u32 = 720;

pub fn use_nonce(env: &Env, from: &Address, nonce: &BytesN<32>) -> bool {
    let key = DataKey::Nonce(from.clone(), nonce.clone());
    if env.storage().temporary().has(&key) {
        return false;
    }
    env.storage().temporary().set(&key, &());
    env.storage()
        .temporary()
        .extend_ttl(&key, NONCE_TTL, NONCE_TTL);
    true
}
