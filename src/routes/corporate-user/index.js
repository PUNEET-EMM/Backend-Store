import express from 'express';
import { sendError, success } from '../../utils/apiResponse';
import { HTTP_STATUS } from '../../utils/constants';


const router = express.Router();

router.get('/health', (req, res) => {
  return success(res, {}, 'Server is running', HTTP_STATUS.OK);
});

router.use((req, res) => {
  return sendError(res, 'Route not found', HTTP_STATUS.NOT_FOUND, { path: req.originalUrl });
});

export default router;
