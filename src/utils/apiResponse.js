/**
 * Sends success response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send
 * @param {String} message - Success message
 * @param {Number} status - HTTP status code
 */
export const success = (res, data = {}, message = 'Success', status) => {
  const resolvedStatus =
    status ?? res.locals.HTTP_STATUS?.OK ?? 200;
  return res.status(resolvedStatus).json({
    success: true,
    status: resolvedStatus,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Sends error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} status - HTTP status code
 * @param {Object|null} errors - Optional detailed errors
 */
export const sendError = (res, message = 'Something went wrong', status, errors = null) => {
  const resolvedStatus =
    status ?? res.locals.HTTP_STATUS?.INTERNAL_SERVER_ERROR ?? 500;
  return res.status(resolvedStatus).json({
    success: false,
    status: resolvedStatus,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};
