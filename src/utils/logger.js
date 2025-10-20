import winston from "winston";
import Log from "../models/Log.js";

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.colorize({ all: true }),
    }),
  ],
});

logger.mongo = async (level, message, meta = {}) => {
  logger.log({ level, message, meta });

  if (["staging", "production"].includes(process.env.NODE_ENV)) {
    try {
      await Log.create({ level, message, meta });
    } catch (err) {
      console.error(" Failed to write log to MongoDB:", err.message);
    }
  }
};

export default logger;
