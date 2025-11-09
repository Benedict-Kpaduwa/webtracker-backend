import mongoose from "mongoose";

const VisitorSchema = new mongoose.Schema({
  visitorId: { type: String, required: true, index: true, unique: true },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  lastIp: String,
  userAgent: String,
  metadata: mongoose.Schema.Types.Mixed,
  eventsCount: { type: Number, default: 0 },
  confidenceScore: Number
}, { timestamps: true });

export default mongoose.model("Visitor", VisitorSchema);
