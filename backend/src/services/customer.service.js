import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

export const getOrCreateCustomer = async (userId) => {
  let customer = await Customer.findOne({ user: userId });
  if (!customer) {
    customer = await Customer.create({ user: userId });
  }
  return customer;
};

export const registerCustomer = async (userData) => {
  const { name, email, password, walletAddress } = userData;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    walletAddress: walletAddress || null,
    role: "customer",
  });

  const customer = await Customer.create({
    user: user._id,
    walletAddress: walletAddress || null,
  });

  const { generateToken } = await import("./jwt.service.js");
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  const populated = await Customer.findById(customer._id)
    .populate("user", "name email role createdAt");

  return { customer: populated, user, token };
};

export const getCustomerProfile = async (userId) => {
  let customer = await Customer.findOne({ user: userId })
    .populate("user", "name email role profileImage createdAt");

  if (!customer) {
    customer = await Customer.create({ user: userId });
    customer = await Customer.findById(customer._id)
      .populate("user", "name email role profileImage createdAt");
  }

  return customer;
};

export const updateCustomerProfile = async (userId, updateData) => {
  const allowedUpdates = ["walletAddress"];
  const updates = {};

  for (const key of allowedUpdates) {
    if (updateData[key] !== undefined) {
      updates[key] = updateData[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    const err = new Error("No valid fields provided for update");
    err.statusCode = 400;
    throw err;
  }

  if (updates.walletAddress && !/^G[A-Z0-9]{55}$/.test(updates.walletAddress)) {
    const err = new Error("Invalid Stellar public key format");
    err.statusCode = 400;
    throw err;
  }

  if (updates.walletAddress) {
    const duplicate = await Customer.findOne({
      walletAddress: updates.walletAddress,
      user: { $ne: userId },
    });
    if (duplicate) {
      const err = new Error("Wallet address already linked to another customer");
      err.statusCode = 409;
      throw err;
    }
  }

  if (updates.walletAddress) {
    await User.findByIdAndUpdate(userId, { walletAddress: updates.walletAddress });
  }

  const customer = await Customer.findOneAndUpdate(
    { user: userId },
    { $set: updates },
    { new: true, runValidators: true }
  ).populate("user", "name email role profileImage createdAt");

  if (!customer) {
    const err = new Error("Customer profile not found");
    err.statusCode = 404;
    throw err;
  }

  return customer;
};

export const getCustomerTransactions = async (userId, query = {}) => {
  const customer = await getOrCreateCustomer(userId);
  const customerId = customer._id;

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  const sortOrder = query.sort === "oldest" ? 1 : -1;
  const statusFilter = query.status || null;
  const searchQuery = query.search || null;

  const filter = { customer: customerId };

  if (statusFilter) {
    filter.status = statusFilter;
  }

  if (searchQuery) {
    filter.$or = [
      { asset: { $regex: searchQuery, $options: "i" } },
      { transactionHash: { $regex: searchQuery, $options: "i" } },
      { status: { $regex: searchQuery, $options: "i" } },
    ];
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate({
        path: "merchant",
        select: "businessName category logo merchantCode",
      })
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  return {
    data: transactions.map((txn) => ({
      _id: txn._id,
      transactionHash: txn.transactionHash,
      amount: txn.amount,
      asset: txn.asset,
      status: txn.status,
      network: txn.network,
      ledger: txn.ledger,
      confirmed: txn.confirmed,
      createdAt: txn.createdAt,
      merchant: txn.merchant
        ? {
            businessName: txn.merchant.businessName,
            category: txn.merchant.category,
            logo: txn.merchant.logo,
            merchantCode: txn.merchant.merchantCode,
          }
        : null,
      receiverAddress: txn.receiverAddress,
      payerAddress: txn.payerAddress,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getCustomerReceipt = async (userId, transactionId) => {
  const customer = await getOrCreateCustomer(userId);

  const transaction = await Transaction.findOne({
    _id: transactionId,
    customer: customer._id,
  })
    .populate({
      path: "merchant",
      select: "businessName category logo merchantCode",
    })
    .populate("paymentSession", "sessionId status expiresAt");

  if (!transaction) {
    const err = new Error("Transaction not found");
    err.statusCode = 404;
    throw err;
  }

  return {
    receipt: {
      transactionId: transaction._id.toString(),
      transactionHash: transaction.transactionHash,
      ledger: transaction.ledger,
      status: transaction.status,
      network: transaction.network,
      confirmed: transaction.confirmed,
      confirmationTimestamp: transaction.confirmationTimestamp,
    },
    merchant: transaction.merchant
      ? {
          businessName: transaction.merchant.businessName,
          category: transaction.merchant.category,
          logo: transaction.merchant.logo,
          merchantCode: transaction.merchant.merchantCode,
        }
      : null,
    payment: {
      amount: transaction.amount,
      asset: transaction.asset,
      payerAddress: transaction.payerAddress,
      receiverAddress: transaction.receiverAddress,
    },
    timestamp: transaction.updatedAt || transaction.createdAt,
  };
};
