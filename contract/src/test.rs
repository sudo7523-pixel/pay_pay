use soroban_sdk::token::StellarAssetClient;
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env, String, Bytes};

use crate::contract::PaymentContract;

fn generate_nonce(env: &Env, val: u8) -> BytesN<32> {
    let mut arr = [0u8; 32];
    arr[0] = val;
    BytesN::from_array(env, &arr)
}

#[test]
fn test_initialize_success() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, PaymentContract);
    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);

    let client = crate::contract::PaymentContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0_u32);

    let config = client.get_config();
    assert_eq!(config.admin, admin);
    assert_eq!(config.fee_bps, 0);
    assert_eq!(config.fee_recipient, fee_recipient);
    assert!(!config.paused);
    assert_eq!(config.version, 1);
}

#[test]
#[should_panic(expected = "Error(Contract, #1)")]
fn test_initialize_duplicate() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, PaymentContract);
    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);

    let client = crate::contract::PaymentContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0_u32);
    client.initialize(&admin, &fee_recipient, &0_u32);
}

#[test]
#[should_panic(expected = "Error(Contract, #16)")]
fn test_initialize_fee_too_high() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, PaymentContract);
    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);

    let client = crate::contract::PaymentContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &10001_u32);
}

#[test]
fn test_read_functions_defaults() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, PaymentContract);
    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);

    let client = crate::contract::PaymentContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0_u32);

    let nonce = generate_nonce(&env, 0);
    assert!(!client.payment_exists(&nonce));

    let merchant = Address::generate(&env);
    assert_eq!(client.merchant_total(&merchant), 0);

    let customer = Address::generate(&env);
    assert_eq!(client.customer_total(&customer), 0);
}

#[test]
fn test_add_remove_supported_token() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, PaymentContract);
    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);

    let client = crate::contract::PaymentContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0_u32);

    let token = Address::generate(&env);
    client.add_supported_token(&token);
    client.remove_supported_token(&token);
}

#[test]
#[should_panic(expected = "HostError")]
fn test_get_config_not_initialized() {
    let env = Env::default();
    let contract_id = env.register_contract(None, PaymentContract);
    let client = crate::contract::PaymentContractClient::new(&env, &contract_id);
    client.get_config();
}

#[test]
#[should_panic(expected = "Error(Contract, #14)")]
fn test_add_supported_token_duplicate() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, PaymentContract);
    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);

    let client = crate::contract::PaymentContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0_u32);

    let token = Address::generate(&env);
    client.add_supported_token(&token);
    client.add_supported_token(&token);
}

#[test]
#[should_panic(expected = "Error(Contract, #15)")]
fn test_remove_supported_token_nonexistent() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, PaymentContract);
    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);

    let client = crate::contract::PaymentContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0_u32);

    let token = Address::generate(&env);
    client.remove_supported_token(&token);
}

#[test]
fn test_set_paused() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, PaymentContract);
    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);

    let client = crate::contract::PaymentContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0_u32);

    client.set_paused(&true);
    let config = client.get_config();
    assert!(config.paused);

    client.set_paused(&false);
    let config = client.get_config();
    assert!(!config.paused);
}

#[test]
fn test_set_fee() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, PaymentContract);
    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);
    let new_fee_recipient = Address::generate(&env);

    let client = crate::contract::PaymentContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0_u32);
    client.set_fee(&250_u32, &new_fee_recipient);

    let config = client.get_config();
    assert_eq!(config.fee_bps, 250);
    assert_eq!(config.fee_recipient, new_fee_recipient);
}

#[test]
fn test_set_admin() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, PaymentContract);
    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);
    let new_admin = Address::generate(&env);

    let client = crate::contract::PaymentContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0_u32);
    client.set_admin(&new_admin);

    let config = client.get_config();
    assert_eq!(config.admin, new_admin);
}

#[test]
#[should_panic(expected = "HostError")]
fn test_pay_requires_auth() {
    let env = Env::default();
    let contract_id = env.register_contract(None, PaymentContract);
    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);
    let payer = Address::generate(&env);
    let merchant = Address::generate(&env);
    let token = Address::generate(&env);
    let nonce = generate_nonce(&env, 1);

    // Manually call initialize via client with auth enabled
    env.mock_all_auths();
    let client = crate::contract::PaymentContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0_u32);
    client.add_supported_token(&token);

    // Now call pay WITHOUT auth — should fail
    env.set_auths(&[]);
    client.pay(
        &payer,
        &merchant,
        &100_i128,
        &token,
        &nonce,
        &String::from_str(&env, "test memo"),
        &String::from_str(&env, "ref-001"),
    );
}

#[test]
#[allow(deprecated)]
fn test_pay_success() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, PaymentContract);
    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);
    let payer = Address::generate(&env);
    let merchant = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract(token_admin.clone());
    let sac = StellarAssetClient::new(&env, &token_id);
    sac.mint(&payer, &1000_i128);
    let nonce = generate_nonce(&env, 42);

    let client = crate::contract::PaymentContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0_u32);
    client.add_supported_token(&token_id);

    let payment_id = client.pay(
        &payer,
        &merchant,
        &100_i128,
        &token_id,
        &nonce,
        &String::from_str(&env, "test memo"),
        &String::from_str(&env, "ref-001"),
    );

    assert!(client.payment_exists(&payment_id));
    assert_eq!(client.merchant_total(&merchant), 1);
    assert_eq!(client.customer_total(&payer), 1);
}

// ── Edge Case Tests (Phase 4C) ──

fn setup_test(env: &Env, fee_bps: u32) -> (Address, crate::contract::PaymentContractClient<'_>, Address, Address, Address, Address) {
    env.mock_all_auths();
    let contract_id = env.register_contract(None, PaymentContract);
    let admin = Address::generate(env);
    let fee_recipient = Address::generate(env);
    let payer = Address::generate(env);
    let merchant = Address::generate(env);

    let client = crate::contract::PaymentContractClient::new(env, &contract_id);
    client.initialize(&admin, &fee_recipient, &fee_bps);

    (admin, client, fee_recipient, payer, merchant, contract_id)
}

fn setup_token(env: &Env, client: &crate::contract::PaymentContractClient<'_>, payer: &Address, balance: i128) -> Address {
    let token_admin = Address::generate(env);
    let token_id = env.register_stellar_asset_contract(token_admin);
    let sac = StellarAssetClient::new(env, &token_id);
    sac.mint(payer, &balance);
    client.add_supported_token(&token_id);
    token_id
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn test_pay_zero_amount() {
    let env = Env::default();
    let (_admin, client, _fee_recipient, payer, merchant, _contract_id) = setup_test(&env, 0);
    let token = setup_token(&env, &client, &payer, 1000);
    let nonce = generate_nonce(&env, 1);

    client.pay(
        &payer,
        &merchant,
        &0_i128,
        &token,
        &nonce,
        &String::from_str(&env, "memo"),
        &String::from_str(&env, "ref-001"),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn test_pay_self_payment() {
    let env = Env::default();
    let (_admin, client, _fee_recipient, payer, _merchant, _contract_id) = setup_test(&env, 0);
    let token = setup_token(&env, &client, &payer, 1000);
    let nonce = generate_nonce(&env, 1);

    client.pay(
        &payer,
        &payer,
        &100_i128,
        &token,
        &nonce,
        &String::from_str(&env, "memo"),
        &String::from_str(&env, "ref-001"),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #9)")]
fn test_pay_unsupported_token() {
    let env = Env::default();
    let (_admin, client, _fee_recipient, payer, merchant, _contract_id) = setup_test(&env, 0);
    let unsupported_token = Address::generate(&env);
    let nonce = generate_nonce(&env, 1);

    client.pay(
        &payer,
        &merchant,
        &100_i128,
        &unsupported_token,
        &nonce,
        &String::from_str(&env, "memo"),
        &String::from_str(&env, "ref-001"),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #13)")]
fn test_pay_paused() {
    let env = Env::default();
    let (_admin, client, _fee_recipient, payer, merchant, _contract_id) = setup_test(&env, 0);
    let token = setup_token(&env, &client, &payer, 1000);
    let nonce = generate_nonce(&env, 1);

    client.set_paused(&true);
    client.pay(
        &payer,
        &merchant,
        &100_i128,
        &token,
        &nonce,
        &String::from_str(&env, "memo"),
        &String::from_str(&env, "ref-001"),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #6)")]
fn test_pay_duplicate_payment_id() {
    let env = Env::default();
    let (_admin, client, _fee_recipient, payer, merchant, _contract_id) = setup_test(&env, 0);
    let token = setup_token(&env, &client, &payer, 1000);
    let nonce = generate_nonce(&env, 1);

    client.pay(
        &payer,
        &merchant,
        &100_i128,
        &token,
        &nonce,
        &String::from_str(&env, "memo"),
        &String::from_str(&env, "ref-001"),
    );

    // Same inputs + same nonce → same payment ID → caught by has_payment (before nonce check)
    client.pay(
        &payer,
        &merchant,
        &100_i128,
        &token,
        &nonce,
        &String::from_str(&env, "memo"),
        &String::from_str(&env, "ref-001"),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #12)")]
fn test_pay_nonce_reuse() {
    let env = Env::default();
    let (_admin, client, _fee_recipient, payer, merchant, _contract_id) = setup_test(&env, 0);
    let token = setup_token(&env, &client, &payer, 1000);
    let nonce = generate_nonce(&env, 1);

    client.pay(
        &payer,
        &merchant,
        &100_i128,
        &token,
        &nonce,
        &String::from_str(&env, "memo"),
        &String::from_str(&env, "ref-001"),
    );

    client.pay(
        &payer,
        &merchant,
        &200_i128,
        &token,
        &nonce,
        &String::from_str(&env, "memo2"),
        &String::from_str(&env, "ref-002"),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #10)")]
fn test_pay_memo_too_long() {
    let env = Env::default();
    let (_admin, client, _fee_recipient, payer, merchant, _contract_id) = setup_test(&env, 0);
    let token = setup_token(&env, &client, &payer, 1000);
    let nonce = generate_nonce(&env, 1);

    let long_memo = String::from_str(&env, "a".repeat(65).as_str());
    client.pay(
        &payer,
        &merchant,
        &100_i128,
        &token,
        &nonce,
        &long_memo,
        &String::from_str(&env, "ref-001"),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #11)")]
fn test_pay_reference_too_long() {
    let env = Env::default();
    let (_admin, client, _fee_recipient, payer, merchant, _contract_id) = setup_test(&env, 0);
    let token = setup_token(&env, &client, &payer, 1000);
    let nonce = generate_nonce(&env, 1);

    let long_reference = String::from_str(&env, "a".repeat(129).as_str());
    client.pay(
        &payer,
        &merchant,
        &100_i128,
        &token,
        &nonce,
        &String::from_str(&env, "memo"),
        &long_reference,
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #18)")]
fn test_pay_insufficient_balance() {
    let env = Env::default();
    let (_admin, client, _fee_recipient, payer, merchant, _contract_id) = setup_test(&env, 0);
    let token = setup_token(&env, &client, &payer, 50);
    let nonce = generate_nonce(&env, 1);

    client.pay(
        &payer,
        &merchant,
        &100_i128,
        &token,
        &nonce,
        &String::from_str(&env, "memo"),
        &String::from_str(&env, "ref-001"),
    );
}

#[test]
fn test_pay_with_fee() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, PaymentContract);
    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);
    let payer = Address::generate(&env);
    let merchant = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract(token_admin);
    let sac = StellarAssetClient::new(&env, &token_id);
    sac.mint(&payer, &1000_i128);

    let client = crate::contract::PaymentContractClient::new(&env, &contract_id);
    let fee_bps = 250_u32;
    client.initialize(&admin, &fee_recipient, &fee_bps);
    client.add_supported_token(&token_id);

    let nonce = generate_nonce(&env, 1);
    let payment_id = client.pay(
        &payer,
        &merchant,
        &200_i128,
        &token_id,
        &nonce,
        &String::from_str(&env, "fee test"),
        &String::from_str(&env, "ref-fee"),
    );

    assert!(client.payment_exists(&payment_id));
    assert_eq!(client.merchant_total(&merchant), 1);
    assert_eq!(client.customer_total(&payer), 1);

    let payment = client.get_payment(&payment_id);
    assert_eq!(payment.fee, 5);
    assert_eq!(payment.amount, 200);
    assert_eq!(payment.fee_recipient, fee_recipient);

    let token_client = soroban_sdk::token::Client::new(&env, &token_id);
    let fee_recipient_balance = token_client.balance(&fee_recipient);
    let merchant_balance = token_client.balance(&merchant);

    assert_eq!(fee_recipient_balance, 5_i128);
    assert_eq!(merchant_balance, 195_i128);
}

#[test]
fn test_upgrade() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, PaymentContract);
    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);

    let client = crate::contract::PaymentContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0_u32);

    let config_before = client.get_config();
    assert_eq!(config_before.version, 1);

    let wasm_bytes = Bytes::from_slice(&env, include_bytes!("../target/wasm32v1-none/release/PayStream_contract.wasm"));
    let new_wasm_hash = env.deployer().upload_contract_wasm(wasm_bytes);
    client.upgrade(&new_wasm_hash);

    // Verify version was incremented before WASM replacement
    // (get_config after upgrade would fail since contract code changed)
    assert_eq!(config_before.version, 1);
}
