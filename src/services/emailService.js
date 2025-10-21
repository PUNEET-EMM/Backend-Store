// services/emailService.js
import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send OTP verification email
 * @param {string} email - Recipient email
 * @param {string} otp - 5-digit OTP code
 * @param {string} userName - User's name
 * @returns {Promise<boolean>} Success status
 */
export const sendOTPEmail = async (email, otp, userName) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Corporate Portal'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Login OTP Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .otp-box { background-color: #fff; border: 2px dashed #4F46E5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { color: #dc2626; font-weight: bold; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Login Verification</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>You requested to log in to your corporate account. Please use the following OTP code to complete your login:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <p><strong>This OTP is valid for 5 minutes only.</strong></p>
              
              <p>If you didn't request this code, please ignore this email and ensure your account is secure.</p>
              
              <div class="warning">
                ⚠️ Never share this OTP with anyone. Our team will never ask for your OTP.
              </div>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} Corporate Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${userName},\n\nYour login OTP code is: ${otp}\n\nThis code is valid for 5 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    logger.mongo("info", "OTP email sent successfully", { email });
    return true;
  } catch (error) {
    logger.mongo("error", "Failed to send OTP email", {
      email,
      error: error.message,
    });
    return false;
  }
};

/**
 * Verify email transporter configuration
 */
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    logger.mongo("info", "Email transporter verified successfully");
    return true;
  } catch (error) {
    logger.mongo("error", "Email transporter verification failed", {
      error: error.message,
    });
    return false;
  }
};