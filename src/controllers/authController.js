// controllers/authController.js
import User from "../models/User.js";
import CorporateProfile from "../models/CorporateProfile.js";
import { sendError, success } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";
import {
  generateOTP,
  generateToken,
  getOTPExpiry,
  isOTPExpired,
} from "../utils/authUtils.js";
import { sendOTPEmail } from "../services/emailService.js";

/**
 * Request OTP for login
 * POST /api/v1/corporate/auth/request-otp
 */
export const requestOTP = async (req, res) => {
  try {
    const { email } = req.validatedData;

    logger.mongo("info", "OTP request initiated", { email });

    // Find user by email
    const user = await User.findOne({ email }).populate("corporateId");

    if (!user) {
      logger.mongo("warn", "Login attempt with non-existent email", { email });
      return sendError(res, "User not found with this email address", 404);
    }

    // Check if corporate profile exists and is verified
    if (!user.corporateId) {
      logger.mongo("error", "User has no associated corporate profile", {
        userId: user._id,
        email,
      });
      return sendError(
        res,
        "Corporate profile not found. Please contact support.",
        500
      );
    }

    // if (!user.corporateId.isVerified) {
    //   logger.mongo("warn", "Login attempt for unverified corporate", {
    //     corporateId: user.corporateId._id,
    //     companyName: user.corporateId.companyLegalName,
    //     email,
    //   });
    //   return sendError(
    //     res,
    //     "Your corporate account is not yet verified. Please wait for admin approval.",
    //     403,
    //     { isVerified: false }
    //   );
    // }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Save OTP to user document
    user.otp = {
      code: otp,
      expiresAt: otpExpiry,
    };
    await user.save();

    logger.mongo("info", "OTP generated and saved", {
      userId: user._id,
      email,
      expiresAt: otpExpiry,
    });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp, user.name);

    if (!emailSent) {
      logger.mongo("error", "Failed to send OTP email", { email });
      return sendError(
        res,
        "Failed to send OTP email. Please try again later.",
        500
      );
    }

    return success(
      res,
      {
        email: user.email,
        message: "OTP sent successfully",
        expiresIn: 300, // 5 minutes in seconds
      },
      "OTP has been sent to your email address",
      200
    );
  } catch (error) {
    logger.mongo("error", "OTP request error", {
      message: error.message,
      stack: error.stack,
    });

    return sendError(res, "Failed to process OTP request", 500, error.message);
  }
};

/**
 * Verify OTP and login
 * POST /api/v1/corporate/auth/verify-otp
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.validatedData;

    logger.mongo("info", "OTP verification initiated", { email });

    // Find user by email
    const user = await User.findOne({ email }).populate("corporateId");

    if (!user) {
      logger.mongo("warn", "OTP verification with non-existent email", {
        email,
      });
      return sendError(res, "User not found", 404);
    }

    // Check if OTP exists
    if (!user.otp || !user.otp.code) {
      logger.mongo("warn", "OTP verification without requested OTP", {
        userId: user._id,
        email,
      });
      return sendError(res, "No OTP found. Please request a new OTP.", 400);
    }

    // Check if OTP has expired
    if (isOTPExpired(user.otp.expiresAt)) {
      logger.mongo("warn", "Expired OTP verification attempt", {
        userId: user._id,
        email,
        expiredAt: user.otp.expiresAt,
      });

      // Clear expired OTP
      user.otp = { code: null, expiresAt: null };
      await user.save();

      return sendError(res, "OTP has expired. Please request a new OTP.", 400);
    }

    // Verify OTP
    if (user.otp.code !== otp) {
      logger.mongo("warn", "Invalid OTP verification attempt", {
        userId: user._id,
        email,
      });
      return sendError(res, "Invalid OTP. Please try again.", 401);
    }

    // OTP verified successfully - clear OTP
    user.otp = { code: null, expiresAt: null };
    await user.save();

    logger.mongo("info", "OTP verified successfully", {
      userId: user._id,
      email,
    });

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
      corporateId: user.corporateId._id,
    });

    logger.mongo("info", "User logged in successfully", {
      userId: user._id,
      email,
      role: user.role,
    });

    return success(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          contact: user.contact,
          designation: user.designation,
          role: user.role,
          permissions: user.permissions,
          corporateId: user.corporateId._id,
          companyName: user.corporateId.companyLegalName,
        },
      },
      "Login successful",
      200
    );
  } catch (error) {
    logger.mongo("error", "OTP verification error", {
      message: error.message,
      stack: error.stack,
    });

    return sendError(
      res,
      "Failed to verify OTP",
      500,
      error.message
    );
  }
};

/**
 * Get current user profile
 * GET /api/v1/corporate/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("corporateId")
      .select("-otp");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return success(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          contact: user.contact,
          designation: user.designation,
          role: user.role,
          permissions: user.permissions,
          corporateId: user.corporateId._id,
          companyName: user.corporateId.companyLegalName,
          isVerified: user.corporateId.isVerified,
          creditLimit: user.corporateId.creditLimit,
          creditUsed: user.corporateId.creditUsed,
          creditAvailable:
            user.corporateId.creditLimit - user.corporateId.creditUsed,
        },
      },
      "User profile retrieved successfully",
      200
    );
  } catch (error) {
    logger.mongo("error", "Get current user error", {
      message: error.message,
    });

    return sendError(res, "Failed to get user profile", 500, error.message);
  }
};