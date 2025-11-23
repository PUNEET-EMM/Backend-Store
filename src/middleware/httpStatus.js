import { HTTP_STATUS } from "../utils/constants.js";

export const attachHttpStatus = (req, res, next) => {
  res.locals.HTTP_STATUS = HTTP_STATUS;
  req.HTTP_STATUS = HTTP_STATUS;
  next();
};
