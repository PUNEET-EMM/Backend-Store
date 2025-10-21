import express from 'express';
import { success } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const router = express.Router();

router.get('/', (req, res) => {
  return success(res, [{ id: 1, name: 'Electronics' }], 'Categories fetched', HTTP_STATUS.OK);
});

export default router;
