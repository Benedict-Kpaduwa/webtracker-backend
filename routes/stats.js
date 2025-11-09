import express from "express";
import TrackingEvent from "../models/TrackingEvent.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const sinceHours = Number(req.query.sinceHours) || 24;
    const sinceDate = new Date(Date.now() - sinceHours * 3600 * 1000);

    const totalEvents = await TrackingEvent.countDocuments();
    const recentEvents = await TrackingEvent.countDocuments({ timestamp: { $gte: sinceDate } });

    const topPages = await TrackingEvent.aggregate([
      { $match: { timestamp: { $gte: sinceDate } } },
      { $group: { _id: "$page", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({ totalEvents, recentEvents, topPages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
