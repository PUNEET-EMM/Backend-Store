import mongoose from "mongoose";

const supportRequestSchema = new mongoose.Schema(
  {
    corporateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CorporateProfile",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

supportRequestSchema.index({ corporateId: 1, status: 1 });

export default mongoose.model("SupportRequest", supportRequestSchema);
