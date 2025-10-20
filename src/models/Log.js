// models/Log.js
import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  level: String,
  message: String,
  meta: Object,
  timestamp: {
    type: Date,
    default: Date.now,
    index: { expires: "3d" }, 
  },
});

export default mongoose.model("Log", logSchema);
