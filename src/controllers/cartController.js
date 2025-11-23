import Cart from "../models/Cart.js";
import CorporateProfile from "../models/CorporateProfile.js";
import { Product } from "../models/Product.js";
import Order from "../models/Order.js";
import { sendError, success } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

const getOrCreateCart = async (corporateId, userId) => {
  let cart = await Cart.findOne({ corporateId });
  if (!cart) {
    cart = await Cart.create({
      corporateId,
      userId,
      items: [],
    });
  }
  return cart;
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ corporateId: req.user.corporateId })
      .populate("items.productId", "name sellingPrice moq");

    return success(res, cart || { items: [] }, "Cart fetched successfully");
  } catch (error) {
    logger.mongo("error", "Fetch cart failed", { message: error.message });
    return sendError(res, "Failed to fetch cart", 500);
  }
};

export const addOrUpdateItem = async (req, res) => {
  try {
    const { productId, quantity } = req.validatedData;
    const corporateId = req.user.corporateId;
    const userId = req.user.userId;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return sendError(
        res,
        "Product not found or inactive",
        req.HTTP_STATUS.NOT_FOUND
      );
    }

    const effectiveQty = Math.max(quantity, product.moq || 1);

    const cart = await getOrCreateCart(corporateId, userId);
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity = effectiveQty;
      existingItem.unitPrice = product.sellingPrice;
      existingItem.moq = product.moq || 1;
    } else {
      cart.items.push({
        productId,
        quantity: effectiveQty,
        unitPrice: product.sellingPrice,
        moq: product.moq || 1,
      });
    }

    await cart.save();

    logger.mongo("info", "Cart item added/updated", {
      corporateId,
      productId,
      quantity: effectiveQty,
    });

    return success(res, cart, "Cart updated successfully", 201);
  } catch (error) {
    logger.mongo("error", "Add to cart failed", { message: error.message });
    return sendError(res, "Failed to update cart", 500);
  }
};

export const increaseQuantity = async (req, res) => {
  try {
    const cart = await Cart.findOne({ corporateId: req.user.corporateId });
    if (!cart) {
      return sendError(res, "Cart not found", req.HTTP_STATUS.NOT_FOUND);
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return sendError(res, "Cart item not found", req.HTTP_STATUS.NOT_FOUND);
    }

    item.quantity += 1;
    await cart.save();

    return success(res, cart, "Quantity increased");
  } catch (error) {
    logger.mongo("error", "Increase quantity failed", { message: error.message });
    return sendError(res, "Failed to increase quantity", 500);
  }
};

export const decreaseQuantity = async (req, res) => {
  try {
    const cart = await Cart.findOne({ corporateId: req.user.corporateId });
    if (!cart) {
      return sendError(res, "Cart not found", 404);
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return sendError(res, "Cart item not found", 404);
    }

    if (item.quantity - 1 < (item.moq || 1)) {
      return sendError(
        res,
        `Quantity cannot go below MOQ (${item.moq || 1}). Remove the item instead.`,
        req.HTTP_STATUS.BAD_REQUEST
      );
    }

    item.quantity -= 1;
    await cart.save();

    return success(res, cart, "Quantity decreased");
  } catch (error) {
    logger.mongo("error", "Decrease quantity failed", { message: error.message });
    return sendError(res, "Failed to decrease quantity", 500);
  }
};

export const removeItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ corporateId: req.user.corporateId });
    if (!cart) {
      return sendError(res, "Cart not found", req.HTTP_STATUS.NOT_FOUND);
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return sendError(res, "Cart item not found", req.HTTP_STATUS.NOT_FOUND);
    }

    item.deleteOne();
    await cart.save();

    return success(res, cart, "Item removed from cart");
  } catch (error) {
    logger.mongo("error", "Remove cart item failed", { message: error.message });
    return sendError(res, "Failed to remove item", 500);
  }
};

export const checkoutCart = async (req, res) => {
  try {
    const corporateId = req.user.corporateId;
    const cart = await Cart.findOne({ corporateId }).populate(
      "items.productId",
      "name sellingPrice moq"
    );

    if (!cart || cart.items.length === 0) {
      return sendError(res, "Cart is empty", req.HTTP_STATUS.BAD_REQUEST);
    }

    // Enforce current MOQ and prices
    for (const item of cart.items) {
      const product = item.productId;
      const currentMoq = product.moq || 1;
      if (item.quantity < currentMoq) {
        return sendError(
          res,
          `Quantity for ${product.name} is below MOQ (${currentMoq}). Please update your cart.`,
          req.HTTP_STATUS.BAD_REQUEST
        );
      }
      item.unitPrice = product.sellingPrice;
      item.moq = currentMoq;
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const corporateProfile = await CorporateProfile.findById(corporateId);
    if (!corporateProfile) {
      return sendError(
        res,
        "Corporate profile not found",
        req.HTTP_STATUS.NOT_FOUND
      );
    }

    const availableCredit =
      corporateProfile.creditLimit - corporateProfile.creditUsed;
    if (totalAmount > availableCredit) {
      return sendError(
        res,
        "Insufficient wallet limit to place this order",
        req.HTTP_STATUS.BAD_REQUEST
      );
    }

    const orderItems = cart.items.map((item) => ({
      productId: item.productId._id,
      name: item.productId.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
    }));

    const order = await Order.create({
      corporateId,
      placedBy: req.user.userId,
      items: orderItems,
      totalAmount,
      status: "placed",
    });

    corporateProfile.creditUsed += totalAmount;
    await corporateProfile.save();

    cart.items = [];
    await cart.save();

    logger.mongo("info", "Order placed from cart", {
      orderId: order._id,
      corporateId,
      totalAmount,
    });

    return success(res, order, "Order placed successfully", 201);
  } catch (error) {
    logger.mongo("error", "Checkout failed", { message: error.message });
    return sendError(res, "Failed to place order", 500);
  }
};
