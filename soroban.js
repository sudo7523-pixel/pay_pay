export {
  getContract,
  invokeContract,
  getPayment,
  paymentExists,
  getConfig,
  merchantTotal,
  customerTotal,
} from './backend/src/blockchain/contract.service.js';

export {
  createIntent,
  submitTransaction,
  verifyTransaction,
  getPayment as clientGetPayment,
  paymentExists as clientPaymentExists,
  getConfig as clientGetConfig,
  getMerchantTotal,
  getCustomerTotal,
} from './frontend/src/services/sorobanService.js';
