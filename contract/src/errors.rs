use soroban_sdk::contracterror;

#[derive(Debug, Clone, Copy, PartialEq)]
#[contracterror]
pub enum ContractError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    SelfPayment = 5,
    DuplicatePayment = 6,
    PaymentNotFound = 7,
    InvalidToken = 8,
    UnsupportedToken = 9,
    InvalidMemoLength = 10,
    InvalidReferenceLength = 11,
    NonceAlreadyUsed = 12,
    ContractPaused = 13,
    AlreadySupported = 14,
    NotSupported = 15,
    FeeTooHigh = 16,
    ArithmeticError = 17,
    TokenTransferFailed = 18,
}
