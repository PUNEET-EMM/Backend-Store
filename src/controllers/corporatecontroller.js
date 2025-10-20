import CorporateProfile from "../models/CorporateProfile.js";
import { sendError, success } from "../utils/apiResponse.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

export const registerCorporate = async (req, res) => {
    console.log("debug")
  try {
    const {
      companyLegalName,
      employeeCount,
      adminName,
      adminEmail,
      adminContact,
      address,
      billingAddress,
      deliveryAddress,
    } = req.validatedData;

    logger.mongo("info", "Corporate registration attempt", {
      companyLegalName,
      adminEmail,
    });

    // Check for existing corporate
    const existingCorporate = await CorporateProfile.findOne({
      $or: [{ companyLegalName }, { adminEmail }],
    });

    if (existingCorporate) {
      const conflictField =
        existingCorporate.companyLegalName === companyLegalName
          ? "Company legal name"
          : "Admin email";

      logger.mongo("warn", "Corporate registration duplicate found", {
        field: conflictField,
        value:
          conflictField === "Company legal name"
            ? companyLegalName
            : adminEmail,
      });

      return sendError(
        res,
        `${conflictField} already exists in the system`,
        409,
        { [conflictField.toLowerCase().replace(" ", "")]: "Already exists" }
      );
    }

    // Create corporate profile
    const corporateProfile = new CorporateProfile({
      companyLegalName,
      employeeCount,
      adminName,
      adminEmail,
      adminContact,
      address,
      billingAddress,
      deliveryAddress,
      isVerified: false,
    });

    await corporateProfile.save();

    logger.mongo("info", "Corporate profile created successfully", {
      corporateId: corporateProfile._id,
      companyLegalName,
    });

    // Create admin user for the corporate
    const adminUser = new User({
      corporateId: corporateProfile._id,
      name: adminName,
      email: adminEmail,
      contact: adminContact,
      designation: "Corporate Admin",
      role: "corporate_admin",
      createdBy: null,
    });

    await adminUser.save();

    logger.mongo("info", "Corporate admin user created successfully", {
      userId: adminUser._id,
      corporateId: corporateProfile._id,
      email: adminEmail,
    });

    // Response
    return success(
      res,
      {
        corporate: {
          id: corporateProfile._id,
          companyLegalName: corporateProfile.companyLegalName,
          adminEmail: corporateProfile.adminEmail,
          createdAt: corporateProfile.createdAt,
          isVerified: corporateProfile.isVerified,
        },
        adminUser: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          permissions: adminUser.permissions,
        },
      },
      "Corporate profile and admin user registered successfully",
      201
    );
  } catch (error) {
    logger.mongo("error", "Corporate registration error", {
      message: error.message,
      stack: error.stack,
    });

    return sendError(
      res,
      "Failed to register corporate profile",
      500,
      error.message
    );
  }
};
