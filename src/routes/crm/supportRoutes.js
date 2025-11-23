import express from "express";
import {
  authenticateInternalUser,
  requireAdmin,
} from "../../middleware/crm/authMiddleware.js";
import { listAllSupportRequests } from "../../controllers/crm/supportController.js";

const router = express.Router();

router.use(authenticateInternalUser, requireAdmin);

router.get("/support-requests", listAllSupportRequests);

export default router;
