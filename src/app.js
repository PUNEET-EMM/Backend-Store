import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());


app.get("/", (req, res) => {
  res.send(`Server running in ${process.env.NODE_ENV} mode`);
});

app.use(errorHandler);

export default app;
