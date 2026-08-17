use soroban_sdk::{Address, BytesN, Env, String, Symbol};

use crate::types::PaymentId;

pub fn payment_completed(
    env: &Env,
    payment_id: &PaymentId,
    from: &Address,
    to: &Address,
    amount: &i128,
    token: &Address,
    fee: &i128,
    reference: String,
    timestamp: u64,
) {
    let topics = (Symbol::new(env, "payment_completed"), payment_id.clone());
    let data = (
        from.clone(),
        to.clone(),
        *amount,
        token.clone(),
        *fee,
        reference,
        timestamp,
    );
    env.events().publish(topics, data);
}

pub fn contract_upgraded(
    env: &Env,
    old_version: u32,
    new_version: u32,
    new_wasm_hash: BytesN<32>,
) {
    let topics = (Symbol::new(env, "contract_upgraded"),);
    let data = (old_version, new_version, new_wasm_hash);
    env.events().publish(topics, data);
}

pub fn config_updated(
    env: &Env,
    admin: Option<Address>,
    fee_bps: Option<u32>,
    fee_recipient: Option<Address>,
    paused: Option<bool>,
) {
    let topics = (Symbol::new(env, "config_updated"),);
    let data = (admin, fee_bps, fee_recipient, paused);
    env.events().publish(topics, data);
}
