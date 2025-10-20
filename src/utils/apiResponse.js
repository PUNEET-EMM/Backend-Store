/**
 * Sends success response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send
 * @param {String} message - Success message
 * @param {Number} status - HTTP status code
 */
export const success = (res, data = {}, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    status,
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
export const sendError = (res, message = 'Something went wrong', status = 500, errors = null) => {
  return res.status(status).json({
    success: false,
    status,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};

