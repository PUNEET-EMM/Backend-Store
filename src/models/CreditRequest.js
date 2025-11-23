import mongoose from "mongoose";

const creditRequestSchema = new mongoose.Schema(
  {
    corporateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CorporateProfile",
      required: true,
      index: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    decisionNote: {
      type: String,
      trim: true,
    },
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternalUser",
      default: null,
    },
    decidedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

creditRequestSchema.index({ corporateId: 1, status: 1 });

export default mongoose.model("CreditRequest", creditRequestSchema);
