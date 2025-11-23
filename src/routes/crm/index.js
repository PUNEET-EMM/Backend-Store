import express from 'express';
import { sendError, success } from '../../utils/apiResponse.js';
import  categoryRoute from './categoryRoute.js'
import  authRoutes from './authRoutes.js'
import productRoute from './productRoutes.js'
import creditRoutes from "./creditRoutes.js";
import orderRoutes from "./orderRoutes.js";
import homepageRoutes from "./homepageRoutes.js";
import supportRoutes from "./supportRoutes.js";


const router = express.Router();

router.get('/health', (req, res) => {
  return success(res, {}, 'Server is running', req.HTTP_STATUS.OK);
});

router.use('/auth', authRoutes);
router.use('/',categoryRoute );
router.use('/',productRoute );
router.use("/", creditRoutes);
router.use("/", orderRoutes);
router.use("/", homepageRoutes);
router.use("/", supportRoutes);







export default router;
