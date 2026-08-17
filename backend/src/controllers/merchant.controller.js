import {
  registerMerchant,
  getMerchantProfile,
  updateMerchantProfile,
  deleteMerchantProfile,
  getAllMerchants,
  getMerchantById,
  verifyMerchant,
  rejectMerchant,
  suspendMerchant,
  getCustomerAnalytics,
} from "../services/merchant.service.js";

const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, statusCode, message, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export const register = async (req, res, next) => {
  try {
    const merchant = await registerMerchant(req.user.userId, req.body);

    successResponse(res, 201, "Merchant registered successfully", {
      merchant,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const merchant = await getMerchantProfile(req.user.userId);

    successResponse(res, 200, "Merchant profile retrieved successfully", {
      merchant,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const merchant = await updateMerchantProfile(req.user.userId, req.body);

    successResponse(res, 200, "Merchant profile updated successfully", {
      merchant,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    const merchant = await deleteMerchantProfile(req.user.userId);

    successResponse(res, 200, "Merchant profile deleted successfully", {
      merchant,
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetAllMerchants = async (req, res, next) => {
  try {
    const merchants = await getAllMerchants(req.query);

    successResponse(res, 200, "Merchants retrieved successfully", {
      merchants,
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetMerchantById = async (req, res, next) => {
  try {
    const merchant = await getMerchantById(req.params.id);

    successResponse(res, 200, "Merchant retrieved successfully", {
      merchant,
    });
  } catch (error) {
    next(error);
  }
};

export const adminVerifyMerchant = async (req, res, next) => {
  try {
    const merchant = await verifyMerchant(req.params.id);

    successResponse(res, 200, "Merchant verified successfully", {
      merchant,
    });
  } catch (error) {
    next(error);
  }
};

export const adminRejectMerchant = async (req, res, next) => {
  try {
    const merchant = await rejectMerchant(req.params.id);

    successResponse(res, 200, "Merchant rejected successfully", {
      merchant,
    });
  } catch (error) {
    next(error);
  }
};

export const adminSuspendMerchant = async (req, res, next) => {
  try {
    const merchant = await suspendMerchant(req.params.id);

    successResponse(res, 200, "Merchant suspended successfully", {
      merchant,
    });
  } catch (error) {
    next(error);
  }
};

export const analytics = async (req, res, next) => {
  try {
    const merchant = await getMerchantProfile(req.user.userId);
    const analyticsData = await getCustomerAnalytics(merchant._id);

    successResponse(res, 200, "Customer analytics retrieved successfully", analyticsData);
  } catch (error) {
    next(error);
  }
};
