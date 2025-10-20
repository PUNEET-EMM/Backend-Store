import { sendError } from '../utils/apiResponse.js';


export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  sendError(res, err.message || 'Internal Server Error', err.status || 500);
};
