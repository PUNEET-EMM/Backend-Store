import express from 'express';
import { sendError, success } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import  categoryRoute from './categoryRoute.js'
import  authRoutes from './authRoutes.js'
import productRoute from './productRoutes.js'


const router = express.Router();

router.get('/health', (req, res) => {
  return success(res, {}, 'Server is running', HTTP_STATUS.OK);
});

router.use('/auth', authRoutes);
router.use('/',categoryRoute );
router.use('/',productRoute );







export default router;
