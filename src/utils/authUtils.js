import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * Generate a 5-digit OTP
 * @returns {string} 5-digit OTP code
 */
export const generateOTP = () => {
  return crypto.randomInt(10000, 99999).toString();
};

/**
 * Generate JWT token for authenticated user
 * @param {Object} payload - User data to encode in token
 * @param {string} payload.userId - User's MongoDB ID
 * @param {string} payload.email - User's email
 * @param {string} payload.role - User's role (corporate_admin/team_member)
 * @param {string} payload.corporateId - Associated corporate profile ID
 * @returns {string} JWT token
 */
export const generateToken = (payload) => {
  const { userId, email, role, corporateId } = payload;

  return jwt.sign(
    {
      userId,
      email,
      role,
      corporateId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Calculate OTP expiry time (5 minutes from now)
 * @returns {Date} Expiry timestamp
 */
export const getOTPExpiry = () => {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
};

/**
 * Check if OTP has expired
 * @param {Date} expiryTime - OTP expiry timestamp
 * @returns {boolean} True if expired
 */
export const isOTPExpired = (expiryTime) => {
  return new Date() > new Date(expiryTime);
};