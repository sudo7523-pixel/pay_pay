import    User  from "../models/User.js";
import { verifyToken } from "../services/jwt.service.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const err = new Error("Not authorized. Please provide a valid token.");
      err.statusCode = 401;
      return next(err);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId);
    if (!user) {
      const err = new Error("User not found. Token is invalid.");
      err.statusCode = 401;
      return next(err);
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    req.userDoc = user;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      const err = new Error("Invalid token. Please log in again.");
      err.statusCode = 401;
      return next(err);
    }
    if (error.name === "TokenExpiredError") {
      const err = new Error("Token expired. Please log in again.");
      err.statusCode = 401;
      return next(err);
    }
    next(error);
  }
};

export const authenticate = protect;

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId);
    if (user) {
      req.user = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };
      req.userDoc = user;
    }

    next();
  } catch {
    next();
  }
};