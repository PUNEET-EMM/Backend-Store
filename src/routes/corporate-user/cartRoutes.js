import express from "express";
import {
  addOrUpdateItem,
  checkoutCart,
  decreaseQuantity,
  getCart,
  increaseQuantity,
  removeItem,
} from "../../controllers/cartController.js";
import {
  authenticate,
  checkPermission,
} from "../../middleware/authMiddleware.js";
import { validateAddToCart } from "../../validations/cartValidation.js";

const router = express.Router();

router.use(authenticate, checkPermission("canPlaceOrders"));

router.get("/", getCart);
router.post("/items", validateAddToCart, addOrUpdateItem);
router.patch("/items/:itemId/increase", increaseQuantity);
router.patch("/items/:itemId/decrease", decreaseQuantity);
router.delete("/items/:itemId", removeItem);
router.post("/checkout", checkoutCart);

export default router;
