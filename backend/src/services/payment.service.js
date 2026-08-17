import Merchant from "../models/Merchant.js";
import Wallet from "../models/Wallet.js";
import PaymentSession from "../models/PaymentSession.js";

export const resolveMerchant = async (merchantCode) => {
  const merchant = await Merchant.findOne({ merchantCode });
  if (!merchant) {
    const err = new Error("Merchant not found");
    err.statusCode = 404;
    throw err;
  }

  if (!merchant.isActive) {
    const err = new Error("Merchant account is inactive");
    err.statusCode = 400;
    throw err;
  }

  if (merchant.verificationStatus !== "Verified") {
    const err = new Error("Merchant is not verified");
    err.statusCode = 400;
    throw err;
  }

  return merchant;
};

export const createPaymentSession = async (merchantCode) => {
  const merchant = await resolveMerchant(merchantCode);

  const wallet = await Wallet.findOne({ merchant: merchant._id });
  if (!wallet) {
    const err = new Error("No wallet linked to this merchant");
    err.statusCode = 404;
    throw err;
  }

  if (wallet.walletStatus !== "Verified") {
    const err = new Error("Merchant wallet is not verified");
    err.statusCode = 400;
    throw err;
  }

  if (!wallet.walletAddress) {
    const err = new Error("Merchant wallet has no address set");
    err.statusCode = 400;
    throw err;
  }

  const session = await PaymentSession.create({
    merchant: merchant._id,
    wallet: wallet._id,
    status: "Pending",
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  return {
    merchant: {
      businessName: merchant.businessName,
      category: merchant.category,
      logo: merchant.logo,
    },
    wallet: {
      network: wallet.network,
      provider: wallet.walletProvider,
      walletAddress: wallet.walletAddress,
    },
    session: {
      sessionId: session.sessionId,
      status: session.status,
      expiresAt: session.expiresAt,
    },
  };
};

export const getPaymentSession = async (sessionId) => {
  const session = await PaymentSession.findOne({ sessionId })
    .populate("merchant", "businessName category logo")
    .populate("wallet", "network walletProvider walletAddress");

  if (!session) {
    const err = new Error("Payment session not found");
    err.statusCode = 404;
    throw err;
  }

  const now = new Date();
  if (session.status === "Pending" && now > session.expiresAt) {
    session.status = "Expired";
    await session.save();
  }

  return {
    merchant: session.merchant,
    wallet: session.wallet,
    session: {
      sessionId: session.sessionId,
      status: session.status,
      expiresAt: session.expiresAt,
    },
  };
};
