import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import  corporateroutes from './routes/corporate-user/index.js';
import  crmroutes from './routes/crm/index.js';


const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send(`Server running in ${process.env.NODE_ENV} mode`);
});




app.use('/api/v1/', corporateroutes);
app.use('/api/v1/crm',crmroutes );



app.use(errorHandler);

export default app;
