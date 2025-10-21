import InternalUser from "../../models/crm/InternalUser.js";
import { sendError, success } from "../../utils/apiResponse.js";
import logger from "../../utils/logger.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import  {generateInternalToken} from "../../utils/crm/authUtlis.js"

export const registerInternalUser = async (req, res) => {
  try {
    const { name, email, contact, password, role } = req.validatedData;

    logger.mongo("info", "Internal user registration attempt", {
      email,
    });

    // Check for existing user
    const existingUser = await InternalUser.findOne({ email });

    if (existingUser) {
      logger.mongo("warn", "Internal user registration duplicate found", {
        email,
      });
      return sendError(
        res,
        "Email already exists in the system",
        409,
        { email: "Already exists" }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create internal user
    const internalUser = new InternalUser({
      name,
      email,
      contact,
      password: hashedPassword,
      role: role || "admin",
      isActive: true,
    });

    await internalUser.save();

    logger.mongo("info", "Internal user created successfully", {
      userId: internalUser._id,
      email,
    });

    // Generate JWT token
    const token = generateInternalToken(internalUser)

    // Response (exclude password)
    return success(
      res,
      {
        user: {
          id: internalUser._id,
          name: internalUser.name,
          email: internalUser.email,
          contact: internalUser.contact,
          role: internalUser.role,
          isActive: internalUser.isActive,
          createdAt: internalUser.createdAt,
        },
        token,
      },
      "Internal user registered successfully",
      201
    );
  } catch (error) {
    logger.mongo("error", "Internal user registration error", {
      message: error.message,
      stack: error.stack,
    });
    return sendError(
      res,
      "Failed to register internal user",
      500,
      error.message
    );
  }
};

export const loginInternalUser = async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    logger.mongo("info", "Internal user login attempt", {
      email,
    });

    // Find user with password field
    const user = await InternalUser.findOne({ email }).select("+password");

    if (!user) {
      logger.mongo("warn", "Login failed - user not found", {
        email,
      });
      return sendError(res, "Invalid email or password", 401);
    }

    // Check if user is active
    if (!user.isActive) {
      logger.mongo("warn", "Login failed - user inactive", {
        email,
      });
      return sendError(res, "Your account has been deactivated", 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.mongo("warn", "Login failed - invalid password", {
        email,
      });
      return sendError(res, "Invalid email or password", 401);
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = generateInternalToken(  { 
        userId: user._id, 
        email: user.email,
        role: user.role 
      });


    logger.mongo("info", "Internal user logged in successfully", {
      userId: user._id,
      email,
    });

    // Response (exclude password)
    return success(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          contact: user.contact,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
        },
        token,
      },
      "Login successful",
      200
    );
  } catch (error) {
    logger.mongo("error", "Internal user login error", {
      message: error.message,
      stack: error.stack,
    });
    return sendError(
      res,
      "Failed to login",
      500,
      error.message
    );
  }
};