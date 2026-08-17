import {
  createSorobanPaymentIntent,
  submitSorobanPayment,
  verifySorobanPayment,
} from "../blockchain/payment.service.js";
import {
  getPayment,
  paymentExists,
  getConfig,
  merchantTotal,
  customerTotal,
} from "../blockchain/contract.service.js";
import { getSyncStatus, triggerManualSync } from "../blockchain/event-sync.service.js";
import { getSorobanAccountBalances } from "../blockchain/wallet.service.js";
import { getHealth, getLatestLedger } from "../blockchain/rpc.service.js";

const ok = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const sorobanIntent = async (req, res, next) => {
  try {
    const { sessionId, payerAddress, amount, token, memo, reference } = req.body;

    if (!sessionId) {
      const err = new Error("sessionId is required");
      err.statusCode = 400;
      throw err;
    }
    if (!payerAddress) {
      const err = new Error("payerAddress is required");
      err.statusCode = 400;
      throw err;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      const err = new Error("A valid positive amount is required");
      err.statusCode = 400;
      throw err;
    }

    const userId = req.user ? req.user.userId : null;

    const result = await createSorobanPaymentIntent({
      sessionId,
      payerAddress: payerAddress.trim(),
      amount,
      token: token || null,
      memo: memo || "",
      reference: reference || "",
      userId,
    });

    ok(res, 201, "Soroban payment intent created successfully", result);
  } catch (error) {
    next(error);
  }
};

export const sorobanSubmit = async (req, res, next) => {
  try {
    const { transactionId, signedXDR } = req.body;

    if (!transactionId) {
      const err = new Error("transactionId is required");
      err.statusCode = 400;
      throw err;
    }
    if (!signedXDR) {
      const err = new Error("signedXDR is required");
      err.statusCode = 400;
      throw err;
    }

    const userId = req.user ? req.user.userId : null;

    const result = await submitSorobanPayment(transactionId, signedXDR, userId);

    ok(res, 200, "Soroban transaction submitted successfully", result);
  } catch (error) {
    next(error);
  }
};

export const sorobanVerify = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      const err = new Error("transactionId is required");
      err.statusCode = 400;
      throw err;
    }

    const result = await verifySorobanPayment(transactionId);

    ok(res, 200, "Soroban transaction verification completed", result);
  } catch (error) {
    next(error);
  }
};

export const sorobanGetPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      const err = new Error("paymentId is required");
      err.statusCode = 400;
      throw err;
    }

    const paymentIdHex = paymentId.startsWith("0x")
      ? paymentId.slice(2)
      : paymentId;
    const paymentIdBuffer = Buffer.from(paymentIdHex, "hex");

    if (paymentIdBuffer.length !== 32) {
      const err = new Error("paymentId must be 32 bytes (64 hex chars)");
      err.statusCode = 400;
      throw err;
    }

    const payment = await getPayment(paymentIdBuffer);

    if (!payment) {
      const err = new Error("Payment not found on-chain");
      err.statusCode = 404;
      throw err;
    }

    ok(res, 200, "On-chain payment retrieved", { payment });
  } catch (error) {
    next(error);
  }
};

export const sorobanPaymentExists = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      const err = new Error("paymentId is required");
      err.statusCode = 400;
      throw err;
    }

    const paymentIdHex = paymentId.startsWith("0x")
      ? paymentId.slice(2)
      : paymentId;
    const paymentIdBuffer = Buffer.from(paymentIdHex, "hex");

    const exists = await paymentExists(paymentIdBuffer);

    ok(res, 200, "On-chain payment existence checked", {
      paymentId,
      exists,
    });
  } catch (error) {
    next(error);
  }
};

export const sorobanGetConfig = async (req, res, next) => {
  try {
    const config = await getConfig();
    ok(res, 200, "On-chain config retrieved", { config });
  } catch (error) {
    next(error);
  }
};

export const sorobanMerchantTotal = async (req, res, next) => {
  try {
    const { address } = req.params;

    if (!address) {
      const err = new Error("address is required");
      err.statusCode = 400;
      throw err;
    }

    const total = await merchantTotal(address.trim());
    ok(res, 200, "Merchant total retrieved", { address, total });
  } catch (error) {
    next(error);
  }
};

export const sorobanCustomerTotal = async (req, res, next) => {
  try {
    const { address } = req.params;

    if (!address) {
      const err = new Error("address is required");
      err.statusCode = 400;
      throw err;
    }

    const total = await customerTotal(address.trim());
    ok(res, 200, "Customer total retrieved", { address, total });
  } catch (error) {
    next(error);
  }
};

export const sorobanBalance = async (req, res, next) => {
  try {
    const { address } = req.params;

    if (!address) {
      const err = new Error("address is required");
      err.statusCode = 400;
      throw err;
    }

    const balances = await getSorobanAccountBalances(address.trim());
    ok(res, 200, "Account balances retrieved", balances);
  } catch (error) {
    next(error);
  }
};

export const sorobanHealth = async (req, res, next) => {
  try {
    const [health, latestLedger, syncStatus] = await Promise.all([
      getHealth(),
      getLatestLedger(),
      getSyncStatus(),
    ]);

    ok(res, 200, "Soroban blockchain status", {
      rpcStatus: health,
      latestLedger: latestLedger.sequence,
      eventSync: syncStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const sorobanSyncStatus = async (req, res, next) => {
  try {
    const status = getSyncStatus();
    ok(res, 200, "Event sync status", status);
  } catch (error) {
    next(error);
  }
};

export const sorobanManualSync = async (req, res, next) => {
  try {
    const result = await triggerManualSync();
    ok(res, 200, "Manual sync triggered", result);
  } catch (error) {
    next(error);
  }
};
