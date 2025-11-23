import express from 'express';
import { sendError, success } from '../../utils/apiResponse.js';
import corporateRoutes from './corporateRoutes.js';
import authRoutes from './authRoutes.js';
import creditRoutes from "./creditRoutes.js";
import cartRoutes from "./cartRoutes.js";
import orderRoutes from "./orderRoutes.js";
import homepageRoutes from "./homepageRoutes.js";
import supportRoutes from "./supportRoutes.js";
import productRoutes from "./productRoutes.js";


const router = express.Router();

router.get('/health', (req, res) => {
  return success(res, {}, 'Server is running', req.HTTP_STATUS.OK);
});

router.use('/corporate', corporateRoutes);
router.use('/corporate/auth', authRoutes);
router.use("/corporate/credits", creditRoutes);
router.use("/corporate/cart", cartRoutes);
router.use("/corporate/orders", orderRoutes);
router.use("/", homepageRoutes);
router.use("/", supportRoutes);
router.use("/", productRoutes);





export default router;
