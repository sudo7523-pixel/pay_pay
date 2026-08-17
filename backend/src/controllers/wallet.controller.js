import {
  linkWallet,
  getWallet,
  updateWallet,
  removeWallet,
  verifyWallet,
} from "../services/wallet.service.js";

const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const link = async (req, res, next) => {
  try {
    const wallet = await linkWallet(req.user.userId, req.body);

    successResponse(res, 201, "Wallet linked successfully", { wallet });
  } catch (error) {
    next(error);
  }
};

export const get = async (req, res, next) => {
  try {
    const wallet = await getWallet(req.user.userId);

    successResponse(res, 200, "Wallet retrieved successfully", { wallet });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const wallet = await updateWallet(req.user.userId, req.body);

    successResponse(res, 200, "Wallet updated successfully", { wallet });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const wallet = await removeWallet(req.user.userId);

    successResponse(res, 200, "Wallet removed successfully", { wallet });
  } catch (error) {
    next(error);
  }
};

export const verify = async (req, res, next) => {
  try {
    const result = await verifyWallet(req.user.userId);

    successResponse(res, 200, "Wallet verification completed", result);
  } catch (error) {
    next(error);
  }
};
