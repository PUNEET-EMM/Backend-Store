import express from "express";
import {
  authenticateInternalUser,
  requireAdmin,
} from "../../middleware/crm/authMiddleware.js";
import {
  decideCreditRequest,
  listCreditRequests,
} from "../../controllers/crm/creditRequestController.js";
import { validateCreditDecision } from "../../validations/crm/creditRequestValidation.js";

const router = express.Router();

router.use(authenticateInternalUser, requireAdmin);

router.get("/credit-requests", listCreditRequests);
router.patch(
  "/credit-requests/:id/decision",
  validateCreditDecision,
  decideCreditRequest
);

export default router;
