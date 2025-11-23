import express from "express";
import {
  authenticate,
  checkPermission,
} from "../../middleware/authMiddleware.js";
import {
  getCorporateOrderById,
  listCorporateOrders,
} from "../../controllers/orderController.js";

const router = express.Router();

router.use(authenticate, checkPermission("canViewOrders"));

router.get("/", listCorporateOrders);
router.get("/:id", getCorporateOrderById);

export default router;
