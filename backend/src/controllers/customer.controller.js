import {
  registerCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerTransactions,
  getCustomerReceipt,
} from "../services/customer.service.js";

const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, walletAddress } = req.body;

    if (!name || !email || !password) {
      const err = new Error("Name, email, and password are required");
      err.statusCode = 400;
      throw err;
    }

    const result = await registerCustomer({ name, email, password, walletAddress });

    successResponse(res, 201, "Customer registered successfully", {
      customer: result.customer,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const customer = await getCustomerProfile(req.user.userId);

    successResponse(res, 200, "Customer profile retrieved successfully", {
      customer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const customer = await updateCustomerProfile(req.user.userId, req.body);

    successResponse(res, 200, "Customer profile updated successfully", {
      customer,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const result = await getCustomerTransactions(req.user.userId, req.query);

    successResponse(res, 200, "Customer transactions retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getReceipt = async (req, res, next) => {
  try {
    const result = await getCustomerReceipt(req.user.userId, req.params.transactionId);

    successResponse(res, 200, "Receipt retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};
