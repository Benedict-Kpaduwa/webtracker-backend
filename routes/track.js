import express from "express";
import TrackingEvent from "../models/TrackingEvent.js";
import Visitor from "../models/Visitor.js";
import geoip from "geoip-lite";
import rateLimit from "express-rate-limit";

const router = express.Router();

const limiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 1) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false
});

router.use(limiter);

router.post("/", async (req, res) => {
  try {
    const ipFromHeaders = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
      || req.socket?.remoteAddress || req.ip || null;
    const {
      visitorId,
      sessionId,
      page,
      type = "pageview",
      payload = null,
      userAgent = req.headers["user-agent"] || ""
    } = req.body;

    const ip = req.body.ip || ipFromHeaders || null;
    const geo = ip ? geoip.lookup(ip) : null;

    const event = await TrackingEvent.create({
      visitorId,
      sessionId,
      page,
      type,
      payload,
      ip,
      userAgent,
      geo
    });

    if (visitorId) {
      const update = {
        lastSeen: new Date(),
        lastIp: ip,
        userAgent,
        $inc: { eventsCount: 1 }
      };
      if (req.body.metadata) update.metadata = req.body.metadata;

      await Visitor.findOneAndUpdate(
        { visitorId },
        { $set: { lastSeen: update.lastSeen, lastIp: update.lastIp, userAgent: update.userAgent, metadata: req.body.metadata || {} }, $inc: { eventsCount: 1 } },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({ ok: true, id: event._id });
  } catch (err) {
    console.error("Track error:", err);
    res.status(500).json({ error: "could not save tracking event", details: err.message });
  }
});

export default router;
