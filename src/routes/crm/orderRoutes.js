import express from "express";
import {
  authenticateInternalUser,
  requireAdmin,
} from "../../middleware/crm/authMiddleware.js";
import { updateOrderStatus } from "../../controllers/crm/orderController.js";
import { validateOrderStatus } from "../../validations/orderValidation.js";

const router = express.Router();

router.use(authenticateInternalUser, requireAdmin);

router.patch("/orders/:id/status", validateOrderStatus, updateOrderStatus);

export default router;
