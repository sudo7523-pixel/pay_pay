import { createPaymentSession } from "../services/payment.service.js";

const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const pay = async (req, res, next) => {
  try {
    const result = await createPaymentSession(req.params.merchantCode);

    successResponse(res, 200, "Payment session created successfully", result);
  } catch (error) {
    next(error);
  }
};
