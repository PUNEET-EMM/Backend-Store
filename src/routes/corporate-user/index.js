import express from 'express';
import { sendError, success } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import corporateRoutes from './corporateRoutes.js';
import authRoutes from './authRoutes.js';


const router = express.Router();

router.get('/health', (req, res) => {
  return success(res, {}, 'Server is running', HTTP_STATUS.OK);
});

router.use('/corporate', corporateRoutes);
router.use('/corporate/auth', authRoutes);





export default router;
