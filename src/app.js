import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import corporateroutes from './routes/corporate-user/index.js';
import crmroutes from './routes/crm/index.js';
import { sendError } from "./utils/apiResponse.js";
import { attachHttpStatus } from "./middleware/httpStatus.js";


const app = express();

app.use(express.json());
app.use(attachHttpStatus);

app.get("/", (req, res) => {
  res.send(`Server running in ${process.env.NODE_ENV} mode`);
});




app.use('/api/v1/', corporateroutes);
app.use('/api/v1/crm/',crmroutes );


app.use((req, res) => {
  return sendError(
    res,
    'Route not found',
    req.HTTP_STATUS?.NOT_FOUND || 404,
    { path: req.originalUrl }
  );
});



app.use(errorHandler);

export default app;
