import Merchant from "../models/Merchant.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Customer from "../models/Customer.js";
import { generateMerchantCode } from "../utils/merchantCode.js";
import { config } from "../config/index.js";

export const registerMerchant = async (userId, merchantData) => {
  const existingMerchant = await Merchant.findOne({ owner: userId });
  if (existingMerchant) {
    const err = new Error("Merchant profile already exists for this user");
    err.statusCode = 409;
    throw err;
  }

  const user = await User.findById(userId);
  if (user && user.role === "customer") {
    const err = new Error("Customer accounts cannot register as merchants");
    err.statusCode = 403;
    throw err;
  }

  const merchantCode = await generateMerchantCode();

  const merchant = await Merchant.create({
    owner: userId,
    merchantCode,
    ...merchantData,
  });

  if (config.autoVerifyMerchants) {
    merchant.verificationStatus = "Verified";
    await merchant.save();
  }

  await User.findByIdAndUpdate(userId, { role: "merchant" });

  return merchant;
};

export const getMerchantProfile = async (userId) => {
  const merchant = await Merchant.findOne({ owner: userId }).populate(
    "owner",
    "name email"
  );

  if (!merchant) {
    const err = new Error("Merchant profile not found");
    err.statusCode = 404;
    throw err;
  }

  return merchant;
};

export const updateMerchantProfile = async (userId, updateData) => {
  const allowedUpdates = [
    "businessName",
    "description",
    "category",
    "businessEmail",
    "businessPhone",
    "businessAddress",
    "city",
    "state",
    "country",
    "website",
    "logo",
    "walletAddress",
  ];

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

  const merchant = await Merchant.findOneAndUpdate(
    { owner: userId },
    { $set: updates },
    { new: true, runValidators: true }
  ).populate("owner", "name email");

  if (!merchant) {
    const err = new Error("Merchant profile not found");
    err.statusCode = 404;
    throw err;
  }

  return merchant;
};

export const deleteMerchantProfile = async (userId) => {
  const merchant = await Merchant.findOneAndDelete({ owner: userId });

  if (!merchant) {
    const err = new Error("Merchant profile not found");
    err.statusCode = 404;
    throw err;
  }

  await User.findByIdAndUpdate(userId, { role: "user" });

  return merchant;
};

export const getAllMerchants = async (query = {}) => {
  const filter = {};

  if (query.verificationStatus) {
    filter.verificationStatus = query.verificationStatus;
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }
  if (query.category) {
    filter.category = query.category;
  }

  return Merchant.find(filter)
    .populate("owner", "name email")
    .sort({ createdAt: -1 });
};

export const getMerchantById = async (merchantId) => {
  const merchant = await Merchant.findById(merchantId).populate(
    "owner",
    "name email"
  );

  if (!merchant) {
    const err = new Error("Merchant not found");
    err.statusCode = 404;
    throw err;
  }

  return merchant;
};

export const verifyMerchant = async (merchantId) => {
  const merchant = await Merchant.findByIdAndUpdate(
    merchantId,
    { verificationStatus: "Verified" },
    { new: true, runValidators: true }
  ).populate("owner", "name email");

  if (!merchant) {
    const err = new Error("Merchant not found");
    err.statusCode = 404;
    throw err;
  }

  return merchant;
};

export const rejectMerchant = async (merchantId) => {
  const merchant = await Merchant.findByIdAndUpdate(
    merchantId,
    { verificationStatus: "Rejected" },
    { new: true, runValidators: true }
  ).populate("owner", "name email");

  if (!merchant) {
    const err = new Error("Merchant not found");
    err.statusCode = 404;
    throw err;
  }

  return merchant;
};

export const suspendMerchant = async (merchantId) => {
  const merchant = await Merchant.findByIdAndUpdate(
    merchantId,
    { verificationStatus: "Suspended" },
    { new: true, runValidators: true }
  ).populate("owner", "name email");

  if (!merchant) {
    const err = new Error("Merchant not found");
    err.statusCode = 404;
    throw err;
  }

  return merchant;
};

export const getCustomerAnalytics = async (merchantId) => {
  const transactions = await Transaction.find({ merchant: merchantId })
    .populate({
      path: "customer",
      select: "paymentCount totalSpent lastPaymentAt",
      populate: { path: "user", select: "name email" },
    })
    .sort({ createdAt: -1 })
    .lean();

  const customerMap = new Map();

  for (const txn of transactions) {
    if (txn.customer) {
      const customerId = txn.customer._id.toString();
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          _id: customerId,
          name: txn.customer.user?.name || "Unknown",
          email: txn.customer.user?.email || "",
          walletAddress: txn.payerAddress,
          totalSpent: txn.customer.totalSpent,
          paymentCount: txn.customer.paymentCount,
          firstPaymentAt: txn.createdAt,
          lastPaymentAt: txn.customer.lastPaymentAt,
        });
      }
    }
  }

  const customers = Array.from(customerMap.values());
  const totalCustomers = customers.length;
  const repeatCustomers = customers.filter((c) => c.paymentCount >= 2).length;

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = customers.filter(
    (c) => new Date(c.firstPaymentAt) >= firstOfMonth
  ).length;

  const topBySpent = [...customers].sort(
    (a, b) => (b.totalSpent || 0) - (a.totalSpent || 0)
  );

  const recentWithCustomer = transactions
    .filter((txn) => txn.customer)
    .slice(0, 20)
    .map((txn) => ({
      _id: txn._id,
      amount: txn.amount,
      asset: txn.asset,
      status: txn.status,
      createdAt: txn.createdAt,
      payerAddress: txn.payerAddress,
      customer: txn.customer
        ? {
            name: txn.customer.user?.name || "Unknown",
            email: txn.customer.user?.email || "",
          }
        : null,
    }));

  return {
    totalCustomers,
    repeatCustomers,
    newCustomersThisMonth: newThisMonth,
    uniqueCustomerRate: totalCustomers > 0
      ? Math.round((repeatCustomers / totalCustomers) * 100)
      : 0,
    topCustomers: topBySpent.slice(0, 10),
    recentCustomers: recentWithCustomer.slice(0, 10),
  };
};
