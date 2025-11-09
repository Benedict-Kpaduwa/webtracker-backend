import express from "express";
import Visitor from "../models/Visitor.js";
import TrackingEvent from "../models/TrackingEvent.js";

const router = express.Router();

router.get("/:visitorId", async (req, res) => {
  try {
    const { visitorId } = req.params;
    const visitor = await Visitor.findOne({ visitorId });
    if (!visitor) return res.status(404).json({ error: "not found" });

    const events = await TrackingEvent.find({ visitorId })
      .sort({ timestamp: -1 })
      .limit(500);

    res.json({ visitor, events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
