import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "./jwt.service.js";

export const registerUser = async (userData) => {
  const { name, email, password, walletAddress } = userData;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    walletAddress: walletAddress || null,
  });

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return { user, token };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return { user, token };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

export const updateUserProfile = async (userId, updateData) => {
  const allowedUpdates = ["name", "profileImage", "walletAddress"];
  const updates = {};

  for (const key of allowedUpdates) {
    if (updateData[key] !== undefined) {
      updates[key] = updateData[key];
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  return user;
};