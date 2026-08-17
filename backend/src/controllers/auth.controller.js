import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from "../services/auth.service.js";

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
    const { user, token } = await registerUser(req.body);

    successResponse(res, 201, "User registered successfully", {
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);

    successResponse(res, 200, "Login successful", {
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await getUserProfile(req.user.userId);
    successResponse(res, 200, "Profile retrieved successfully", {
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await updateUserProfile(req.user.userId, req.body);
    successResponse(res, 200, "Profile updated successfully", {
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};