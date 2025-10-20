// import express from 'express';
// import dotenv from 'dotenv';
// import fs from 'fs';


// const nodeEnv = process.env.NODE_ENV || 'development';

// if (nodeEnv === 'development') {
//   if (fs.existsSync('.env.local')) {
//     dotenv.config({ path: '.env.local' });
//     console.log(' Loaded .env.local');
//   }
// } else if (nodeEnv === 'staging') {
//   if (fs.existsSync('.env.stag')) {
//     dotenv.config({ path: '.env.stag' });
//     console.log(' Loaded .env.stag (staging)');
//   }
// } else if (nodeEnv === 'production') {
//   console.log(' Running in production mode, all variables from system environment');
// }


// const app = express();
// app.use(express.json());

// app.get('/', (req, res) => {
//   res.send(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`);
// });

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));


import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import connectDB from "./config/db.js";
import app from "./app.js";
import logger from "./utils/logger.js";

const nodeEnv = process.env.NODE_ENV || "development";

if (nodeEnv === "development" && fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
  console.log("Loaded .env.local");
} else if (nodeEnv === "staging" && fs.existsSync(".env.stag")) {
  dotenv.config({ path: ".env.stag" });
  console.log(" Loaded .env.stag (staging)");
} else if (nodeEnv === "production") {
  console.log(" Running in production mode");
} else {
  console.warn("No environment file found for this mode");
}

connectDB();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => logger.mongo("info", `Server started on port ${PORT} (${nodeEnv})`));

