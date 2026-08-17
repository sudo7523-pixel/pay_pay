import mongoose from "mongoose";

const merchantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
      unique: true,
    },
    merchantCode: {
      type: String,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    businessEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    businessPhone: {
      type: String,
      trim: true,
    },
    businessAddress: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected", "Suspended"],
      default: "Pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Merchant", merchantSchema);
