import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { adminAuth } from "../utils/authMiddleware.js";
import TrackingEvent from "../models/TrackingEvent.js";
import Visitor from "../models/Visitor.js";

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});

router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const totalEvents = await TrackingEvent.countDocuments();
    const uniqueVisitors = await Visitor.countDocuments();

    const recentVisitors = await Visitor.find({})
      .sort({ lastSeen: -1 })
      .limit(10)
      .select("visitorId lastSeen eventsCount -_id");

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const eventsPerHour = await TrackingEvent.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%dT%H:00:00Z", date: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topPages = await TrackingEvent.aggregate([
      { $group: { _id: "$page", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      totalEvents,
      uniqueVisitors,
      recentVisitors,
      eventsPerHour: eventsPerHour.map((e) => ({
        ts: e._id,
        count: e.count,
      })),
      topPages,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

router.post("/login", limiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("Admin login attempt:", { username, password });

    const ADMIN_USERNAME = "admin";
    const ADMIN_PLAIN_PASS = "password";
    const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH?.trim();

    if (username === ADMIN_USERNAME && password === ADMIN_PLAIN_PASS) {
      console.log("Login SUCCESS: plain-text match");
      const token = jwt.sign({ sub: ADMIN_USERNAME }, process.env.JWT_SECRET, { expiresIn: "4h" });
      return res.json({ token });
    }

    // if (username === ADMIN_USERNAME && ADMIN_PASS_HASH) {
    //   const isValid = await bcrypt.compare(password, ADMIN_PASS_HASH);
    //   if (isValid) {
    //     console.log("Login SUCCESS: bcrypt match");
    //     const token = jwt.sign({ sub: ADMIN_USERNAME }, JWT_SECRET, { expiresIn: "4h" });
    //     return res.json({ token });
    //   }
    // }

    return res.status(401).json({ error: "Invalid credentials" });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});


router.get("/me", adminAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
