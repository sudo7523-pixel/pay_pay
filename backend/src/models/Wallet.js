import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: [true, "Merchant is required"],
      unique: true,
    },
    walletAddress: {
      type: String,
      trim: true,
    },
    walletProvider: {
      type: String,
      enum: ["Freighter"],
      default: "Freighter",
    },
    network: {
      type: String,
      enum: ["testnet", "mainnet"],
      default: "testnet",
    },
    isPrimary: {
      type: Boolean,
      default: true,
    },
    walletStatus: {
      type: String,
      enum: ["Pending", "Verified", "Invalid", "Disconnected"],
      default: "Pending",
    },
    lastVerified: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

walletSchema.index({ walletAddress: 1 }, { unique: true, sparse: true });

export default mongoose.model("Wallet", walletSchema);
