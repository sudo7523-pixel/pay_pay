import Merchant from "../models/Merchant.js";
import Transaction from "../models/Transaction.js";
import {
  createPaymentIntent,
  submitSignedTransaction,
  verifyTransaction,
  getTransactionStatus,
  getRecentTransactions,
  getReceipt,
} from "../services/transaction.service.js";

const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const intent = async (req, res, next) => {
  try {
    const { sessionId, amount, asset } = req.body;

    if (!sessionId || !amount) {
      const err = new Error("sessionId and amount are required");
      err.statusCode = 400;
      throw err;
    }

    const userId = req.user ? req.user.userId : null;

    const result = await createPaymentIntent(
      sessionId,
      amount,
      asset || "XLM",
      userId
    );

    successResponse(res, 201, "Payment intent created successfully", result);
  } catch (error) {
    next(error);
  }
};

export const submit = async (req, res, next) => {
  try {
    const { transactionId, signedXDR } = req.body;

    if (!transactionId || !signedXDR) {
      const err = new Error("transactionId and signedXDR are required");
      err.statusCode = 400;
      throw err;
    }

    const userId = req.user ? req.user.userId : null;

    const result = await submitSignedTransaction(transactionId, signedXDR, userId);

    successResponse(res, 200, "Transaction submitted successfully", result);
  } catch (error) {
    next(error);
  }
};

export const recent = async (req, res, next) => {
  try {
    if (!req.user) {
      const err = new Error("Authentication required");
      err.statusCode = 401;
      throw err;
    }

    const merchant = await Merchant.findOne({ owner: req.user.userId });
    if (!merchant) {
      return successResponse(res, 200, "Recent transactions retrieved", []);
    }

    const limit = parseInt(req.query.limit) || 4;
    const transactions = await getRecentTransactions(merchant._id, limit);
    successResponse(res, 200, "Recent transactions retrieved", transactions);
  } catch (error) {
    next(error);
  }
};

export const verify = async (req, res, next) => {
  try {
    const result = await verifyTransaction(req.params.transactionId);

    successResponse(res, 200, "Transaction verification completed", result);
  } catch (error) {
    next(error);
  }
};

export const status = async (req, res, next) => {
  try {
    const result = await getTransactionStatus(req.params.transactionId);

    successResponse(res, 200, "Transaction status retrieved", result);
  } catch (error) {
    next(error);
  }
};

export const transactions = async (req, res, next) => {
  try {
    if (!req.user) {
      const err = new Error("Authentication required");
      err.statusCode = 401;
      throw err;
    }

    const merchant = await Merchant.findOne({ owner: req.user.userId });
    if (!merchant) {
      return successResponse(res, 200, "Transactions retrieved", {
        data: [], total: 0, page: 1, limit: 10, totalPages: 0,
      });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const sortOrder = req.query.sort === "oldest" ? 1 : -1;
    const statusFilter = req.query.status || null;
    const searchQuery = req.query.search || null;

    const query = { merchant: merchant._id };
    if (statusFilter) query.status = statusFilter;
    if (searchQuery) {
      query.$or = [
        { asset: { $regex: searchQuery, $options: "i" } },
        { transactionId: { $regex: searchQuery, $options: "i" } },
        { status: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Transaction.find(query)
        .populate({
          path: "customer",
          select: "walletAddress",
          populate: { path: "user", select: "name email" },
        })
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    successResponse(res, 200, "Transactions retrieved", {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const receipt = async (req, res, next) => {
  try {
    const result = await getReceipt(req.params.transactionId);

    successResponse(res, 200, "Receipt retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};
