import express from "express";
import {
  authenticateInternalUser,
  requireAdmin,
} from "../../middleware/crm/authMiddleware.js";
import {
  getHomepage,
  upsertHomepage,
} from "../../controllers/crm/homepageController.js";
import { validateHomepagePayload } from "../../validations/homepageValidation.js";

const router = express.Router();

router.get("/homepage", getHomepage);
router.use(authenticateInternalUser, requireAdmin);
router.put("/homepage", validateHomepagePayload, upsertHomepage);

export default router;
