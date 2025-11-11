import express from "express";
import mongoose from "mongoose";
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

const ensureConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000, // 8 second timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
      minPoolSize: 1,
      bufferCommands: false,
      bufferMaxEntries: 0
    });

    console.log('MongoDB reconnected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    return false;
  }
};

router.post("/", async (req, res) => {
  let connectionEstablished = false;

  try {
    connectionEstablished = await ensureConnection();

    if (!connectionEstablished) {
      return res.status(503).json({
        error: "Service temporarily unavailable",
        details: "Database connection failed"
      });
    }

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

    const event = await Promise.race([
      TrackingEvent.create({
        visitorId,
        sessionId,
        page,
        type,
        payload,
        ip,
        userAgent,
        geo
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database operation timeout')), 8000)
      )
    ]);

    if (visitorId) {
      try {
        await Promise.race([
          Visitor.findOneAndUpdate(
            { visitorId },
            {
              $set: {
                lastSeen: new Date(),
                lastIp: ip,
                userAgent,
                metadata: req.body.metadata || {}
              },
              $inc: { eventsCount: 1 }
            },
            { upsert: true, new: true }
          ),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Visitor update timeout')), 5000)
          )
        ]);
      } catch (visitorError) {
        console.warn('Visitor update failed:', visitorError.message);
      }
    }

    res.status(201).json({ ok: true, id: event._id });

  } catch (err) {
    console.error("Track error:", err);

    if (err.name === 'MongoServerSelectionError' ||
      err.name === 'MongoNetworkError' ||
      err.message === 'Database operation timeout' ||
      !connectionEstablished) {
      return res.status(503).json({
        error: "Service temporarily unavailable",
        details: "Database connection issue"
      });
    }

    res.status(500).json({
      error: "could not save tracking event",
      details: err.message
    });
  }
});

router.get("/health", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
      status: 'ok',
      database: dbStatus,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

export default router;