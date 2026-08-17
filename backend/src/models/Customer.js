import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
    walletAddress: {
      type: String,
      trim: true,
      default: null,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    paymentCount: {
      type: Number,
      default: 0,
    },
    lastPaymentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.index({ walletAddress: 1 }, { sparse: true });

export default mongoose.model("Customer", customerSchema);
