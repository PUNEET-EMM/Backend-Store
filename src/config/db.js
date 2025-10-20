import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.mongo("info", `MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.mongo("error", "MongoDB connection failed", { error: err.message });
    process.exit(1);
  }
};

export default connectDB;
