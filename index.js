import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";

import trackRoutes from "./routes/track.js";
import visitorRoutes from "./routes/visitor.js";
import statsRoutes from "./routes/stats.js";
import adminRoutes from "./routes/admin.js";

// const allowedOrigins = [
//     "http://localhost:4000",
//     "https://isec-603-web-tracker.vercel.app"
// ];

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({ origin: "*" }));

app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => { console.error("MongoDB connection error:", err); process.exit(1); });

app.use("/track", trackRoutes);
app.use("/visitors", visitorRoutes);
app.use("/stats", statsRoutes);
app.use("/admin", adminRoutes);

app.get("/health", (_, res) => res.json({ ok: true, ts: Date.now() }));

export default app;
