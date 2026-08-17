import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    name: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
      maxlength: [200, "Event name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    venue: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Venue cannot exceed 300 characters"],
    },
    location: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Location cannot exceed 300 characters"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    registrationDeadline: {
      type: Date,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    visibility: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public",
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Cancelled", "Completed"],
      default: "Draft",
    },
    allowMultipleScans: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eventSchema.index({ owner: 1, status: 1 });
eventSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model("Event", eventSchema);
