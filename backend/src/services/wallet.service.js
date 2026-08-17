import Wallet from "../models/Wallet.js";
import Merchant from "../models/Merchant.js";
import {
  isValidPublicKey,
  checkAccountExists,
  getAccountInfo,
} from "./stellar.service.js";

export const linkWallet = async (userId, walletData) => {
  const merchant = await Merchant.findOne({ owner: userId });
  if (!merchant) {
    const err = new Error("Merchant profile not found. Register as a merchant first.");
    err.statusCode = 404;
    throw err;
  }

  const existingWallet = await Wallet.findOne({ merchant: merchant._id });
  if (existingWallet) {
    const err = new Error("Wallet already linked to this merchant");
    err.statusCode = 409;
    throw err;
  }

  const { walletAddress, walletProvider, network } = walletData;

  if (!walletAddress) {
    const err = new Error("Wallet address is required");
    err.statusCode = 400;
    throw err;
  }

  if (!isValidPublicKey(walletAddress)) {
    const err = new Error("Invalid Stellar public key format");
    err.statusCode = 400;
    throw err;
  }

  const duplicate = await Wallet.findOne({ walletAddress });
  if (duplicate) {
    const err = new Error(
      "Wallet address already linked to another merchant"
    );
    err.statusCode = 409;
    throw err;
  }

  const accountExists = await checkAccountExists(walletAddress);
  const walletStatus = accountExists.exists ? "Verified" : "Invalid";

  const wallet = await Wallet.create({
    merchant: merchant._id,
    walletAddress,
    walletProvider: walletProvider || "Freighter",
    network: network || "testnet",
    isPrimary: true,
    walletStatus,
    lastVerified: accountExists.exists ? new Date() : null,
  });

  const populated = await Wallet.findById(wallet._id).populate(
    "merchant",
    "businessName merchantCode"
  );

  return populated;
};

export const getWallet = async (userId) => {
  const merchant = await Merchant.findOne({ owner: userId });
  if (!merchant) {
    const err = new Error("Merchant profile not found");
    err.statusCode = 404;
    throw err;
  }

  const wallet = await Wallet.findOne({ merchant: merchant._id }).populate(
    "merchant",
    "businessName merchantCode"
  );

  if (!wallet) {
    const err = new Error("No wallet linked to this merchant");
    err.statusCode = 404;
    throw err;
  }

  return wallet;
};

export const updateWallet = async (userId, updateData) => {
  const merchant = await Merchant.findOne({ owner: userId });
  if (!merchant) {
    const err = new Error("Merchant profile not found");
    err.statusCode = 404;
    throw err;
  }

  const wallet = await Wallet.findOne({ merchant: merchant._id });
  if (!wallet) {
    const err = new Error("No wallet linked to this merchant");
    err.statusCode = 404;
    throw err;
  }

  const allowedUpdates = ["walletAddress", "walletProvider", "network"];
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

  if (updates.walletAddress) {
    if (!isValidPublicKey(updates.walletAddress)) {
      const err = new Error("Invalid Stellar public key format");
      err.statusCode = 400;
      throw err;
    }

    if (updates.walletAddress !== wallet.walletAddress) {
      const duplicate = await Wallet.findOne({
        walletAddress: updates.walletAddress,
        _id: { $ne: wallet._id },
      });
      if (duplicate) {
        const err = new Error(
          "Wallet address already linked to another merchant"
        );
        err.statusCode = 409;
        throw err;
      }
    }

    updates.walletStatus = "Invalid";
    updates.lastVerified = null;
  }

  const updated = await Wallet.findByIdAndUpdate(
    wallet._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate("merchant", "businessName merchantCode");

  return updated;
};

export const removeWallet = async (userId) => {
  const merchant = await Merchant.findOne({ owner: userId });
  if (!merchant) {
    const err = new Error("Merchant profile not found");
    err.statusCode = 404;
    throw err;
  }

  const wallet = await Wallet.findOneAndDelete({
    merchant: merchant._id,
  }).populate("merchant", "businessName merchantCode");

  if (!wallet) {
    const err = new Error("No wallet linked to this merchant");
    err.statusCode = 404;
    throw err;
  }

  return wallet;
};

export const verifyWallet = async (userId) => {
  const merchant = await Merchant.findOne({ owner: userId });
  if (!merchant) {
    const err = new Error("Merchant profile not found");
    err.statusCode = 404;
    throw err;
  }

  const wallet = await Wallet.findOne({ merchant: merchant._id });
  if (!wallet) {
    const err = new Error("No wallet linked to this merchant");
    err.statusCode = 404;
    throw err;
  }

  if (!wallet.walletAddress) {
    const err = new Error(
      "No wallet address set. Link a wallet address first."
    );
    err.statusCode = 400;
    throw err;
  }

  const result = await checkAccountExists(wallet.walletAddress);

  wallet.walletStatus = result.exists ? "Verified" : "Invalid";
  wallet.lastVerified = new Date();
  await wallet.save();

  const populated = await Wallet.findById(wallet._id).populate(
    "merchant",
    "businessName merchantCode"
  );

  return {
    wallet: populated,
    walletStatus: wallet.walletStatus,
    accountExists: result.exists,
    ...(result.exists
      ? { accountInfo: await getAccountInfo(wallet.walletAddress) }
      : {}),
  };
};
