use soroban_sdk::{contracttype, Address, BytesN, String};

pub type PaymentId = BytesN<32>;

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub enum PaymentStatus {
    Completed,
    Refunded,
    Cancelled,
    Disputed,
}

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct Payment {
    pub id: BytesN<32>,
    pub from: Address,
    pub to: Address,
    pub amount: i128,
    pub token: Address,
    pub fee: i128,
    pub fee_recipient: Address,
    pub memo: String,
    pub reference: String,
    pub status: PaymentStatus,
    pub created_at: u64,
    pub completed_at: Option<u64>,
}

#[derive(Clone, Debug, PartialEq)]
#[contracttype]
pub struct Config {
    pub admin: Address,
    pub fee_bps: u32,
    pub fee_recipient: Address,
    pub paused: bool,
    pub version: u32,
}
