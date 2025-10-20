import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    corporateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CorporateProfile",
      required: true,
      index: true,
    },
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
    },
    contact: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Please enter a valid contact number"],
    },
    designation: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["corporate_admin", "team_member"],
      required: true,
    },
    permissions: {
      canCreateUsers: { type: Boolean, default: false },
      canApproveOrders: { type: Boolean, default: false },
      canPlaceOrders: { type: Boolean, default: false },
      canViewOrders: { type: Boolean, default: true },
      canRequestCredits: { type: Boolean, default: false },
      canViewCredits: { type: Boolean, default: false },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // OTP-based auth fields
    otp: {
      code: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Role-based permissions middleware
userSchema.pre("save", function (next) {
  if (this.isModified("role") || this.isNew) {
    const rolePermissions = {
      corporate_admin: {
        canCreateUsers: true,
        canApproveOrders: true,
        canPlaceOrders: true,
        canViewOrders: true,
        canRequestCredits: true,
        canViewCredits: true,
      },
      team_member: {
        canCreateUsers: false,
        canApproveOrders: false,
        canPlaceOrders: true,
        canViewOrders: true,
        canRequestCredits: false,
        canViewCredits: true,
      },
    };
    this.permissions = rolePermissions[this.role];
  }
  next();
});

// Indexes
userSchema.index({ corporateId: 1, email: 1 }, { unique: true });
userSchema.index({ corporateId: 1, role: 1 });

export default mongoose.model("User", userSchema);