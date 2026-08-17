import mongoose from "mongoose";
import crypto from "crypto";

const paymentSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: [true, "Merchant is required"],
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: [true, "Wallet is required"],
    },
    status: {
      type: String,
      enum: ["Pending", "Consumed", "Expired"],
      default: "Pending",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PaymentSession", paymentSessionSchema);
