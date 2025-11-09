import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";

import trackRoutes from "../routes/track.js";
import visitorRoutes from "../routes/visitor.js";
import statsRoutes from "../routes/stats.js";
import adminRoutes from "../routes/admin.js";

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "200kb" }));
app.use(morgan("dev"));

app.use("/track", trackRoutes);
app.use("/visitors", visitorRoutes);
app.use("/stats", statsRoutes);
app.use("/admin", adminRoutes);

app.get("/health", (_, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/", (_, res) => res.json({ message: "WebTracker API is running" }));

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 1,
        });

        isConnected = mongoose.connection.readyState === 1;
        console.log('MongoDB connected successfully');

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            isConnected = false;
        });

    } catch (error) {
        console.error('MongoDB connection failed:', error);
        isConnected = false;
    }
};

connectDB();

app.get('/db-health', async (_, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        res.json({
            database: dbStatus,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({ error: 'Database health check failed' });
    }
});

export default app;