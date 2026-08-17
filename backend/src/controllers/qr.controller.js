import {
  generateQR,
  getQR,
  regenerateQR,
  disableQR,
} from "../services/qr.service.js";

const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const generate = async (req, res, next) => {
  try {
    const result = await generateQR(req.user.userId);

    successResponse(res, 201, "QR code generated successfully", result);
  } catch (error) {
    next(error);
  }
};

export const get = async (req, res, next) => {
  try {
    const result = await getQR(req.params.merchantCode);

    successResponse(res, 200, "QR code retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const regenerate = async (req, res, next) => {
  try {
    const result = await regenerateQR(req.user.userId);

    successResponse(res, 200, "QR code regenerated successfully", result);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const qr = await disableQR(req.user.userId);

    successResponse(res, 200, "QR code disabled successfully", { qr });
  } catch (error) {
    next(error);
  }
};
