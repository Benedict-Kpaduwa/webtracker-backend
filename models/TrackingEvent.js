import mongoose from "mongoose";

const TrackingEventSchema = new mongoose.Schema({
  visitorId: { type: String, index: true },
  sessionId: String,
  page: String,
  type: { type: String, default: "pageview" },
  payload: mongoose.Schema.Types.Mixed,
  ip: String,
  userAgent: String,
  geo: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("TrackingEvent", TrackingEventSchema);
