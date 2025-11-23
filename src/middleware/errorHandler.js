import { sendError } from '../utils/apiResponse.js';


export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status =
    err.status ||
    res.locals.HTTP_STATUS?.INTERNAL_SERVER_ERROR ||
    500;
  sendError(res, err.message || 'Internal Server Error', status);
};
