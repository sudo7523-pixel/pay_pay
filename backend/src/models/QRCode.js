import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema(
  {
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: [true, "Merchant is required"],
      unique: true,
    },
    merchantCode: {
      type: String,
      required: [true, "Merchant code is required"],
      trim: true,
    },
    qrType: {
      type: String,
      enum: ["STATIC"],
      default: "STATIC",
    },
    version: {
      type: Number,
      default: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("QRCode", qrCodeSchema);
