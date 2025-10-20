import mongoose from "mongoose";
import addressSchema from "./Address.js";

const corporateProfileSchema = new mongoose.Schema(
  {
    companyLegalName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    employeeCount: {
      type: String,
      required: true,
      trim: true,
    },
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    adminEmail: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    adminContact: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Please enter a valid contact number"],
    },
    // Addresses
    address: {
      type: addressSchema,
      required: true,
    },
    billingAddress: {
      type: [addressSchema],
      required: true,
      validate: [
        {
          validator: function(arr) {
            return arr.length > 0;
          },
          message: "At least one billing address is required"
        }
      ]
    },
    deliveryAddress: {
      type: [addressSchema],
      required: true,
      validate: [
        {
          validator: function(arr) {
            return arr.length > 0;
          },
          message: "At least one delivery address is required"
        }
      ]
    },
    creditLimit: {
      type: Number,
      default: 0,
    },
    creditUsed: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("CorporateProfile", corporateProfileSchema);