import express from "express";
import {
  requestOTP,
  verifyOTP,
  getCurrentUser,
} from "../../controllers/authController.js";
import { validateLogin, validateOTP } from "../../validations/authValidator.js";
import { authenticate } from "../../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/auth/request-otp
 * @desc    Request OTP for login
 * @access  Public
 * @body    { email: string }
 */
router.post("/request-otp", validateLogin, requestOTP);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and get JWT token
 * @access  Public
 * @body    { email: string, otp: string }
 */
router.post("/verify-otp", validateOTP, verifyOTP);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private
 * @header  Authorization: Bearer <token>
 */
router.get("/me", authenticate, getCurrentUser);

export default router;