import mongoose from "mongoose";

const internalUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    contact: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Please enter a valid contact number"],
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // Password-based authentication for internal users
    password: {
      type: String,
      required: true,
      select: false, // Don't return password in queries by default
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternalUser",
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes
internalUserSchema.index({ email: 1 });
internalUserSchema.index({ isActive: 1 });

// Method to update last login
internalUserSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

export default mongoose.model("InternalUser", internalUserSchema);