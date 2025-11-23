import express from "express";
import {
  createSupportRequest,
  listCorporateSupportRequests,
} from "../../controllers/supportController.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { validateSupportMessage } from "../../validations/supportValidation.js";

const router = express.Router();

router.use(authenticate);

router.post("/support", validateSupportMessage, createSupportRequest);
router.get("/support", listCorporateSupportRequests);

export default router;
