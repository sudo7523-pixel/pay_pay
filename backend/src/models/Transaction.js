import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    paymentSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentSession",
      required: [true, "Payment session is required"],
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
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    payerAddress: {
      type: String,
      trim: true,
      default: null,
    },
    receiverAddress: {
      type: String,
      trim: true,
      required: [true, "Receiver address is required"],
    },
    asset: {
      type: String,
      required: [true, "Asset is required"],
      default: "XLM",
    },
    amount: {
      type: String,
      required: [true, "Amount is required"],
    },
    memo: {
      type: String,
      trim: true,
      default: null,
    },
    network: {
      type: String,
      enum: ["testnet", "mainnet"],
      default: "testnet",
    },
    transactionHash: {
      type: String,
      trim: true,
      default: null,
    },
    ledger: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["Pending", "Submitted", "Confirmed", "Failed", "Expired"],
      default: "Pending",
    },
    signedXDR: {
      type: String,
      default: null,
    },
    unsignedXDR: {
      type: String,
      default: null,
    },
    blockchainType: {
      type: String,
      enum: ["classic", "soroban"],
      default: "classic",
    },
    contractId: {
      type: String,
      trim: true,
      default: null,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    confirmationTimestamp: {
      type: Date,
      default: null,
    },
    blockchainMeta: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ blockchainType: 1, status: 1 });
transactionSchema.index({ transactionHash: 1 });
transactionSchema.index({ "blockchainMeta.paymentId": 1 });

export default mongoose.model("Transaction", transactionSchema);
