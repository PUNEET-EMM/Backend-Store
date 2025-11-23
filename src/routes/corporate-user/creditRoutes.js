import express from "express";
import {
  createCreditRequest,
  getCorporateCreditRequests,
} from "../../controllers/creditRequestController.js";
import {
  authenticate,
  checkPermission,
} from "../../middleware/authMiddleware.js";
import { validateCreditRequest } from "../../validations/creditRequestValidation.js";

const router = express.Router();

router.use(authenticate, checkPermission("canRequestCredits"));

router.post("/requests", validateCreditRequest, createCreditRequest);
router.get("/requests", getCorporateCreditRequests);

export default router;
