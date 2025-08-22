import "dotenv/config";
import express, { Express, Request, Response } from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import mongoose from "mongoose";

const app: Express = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGODB_ATLAS_URI as string;
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err);
  });

// Sample route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, MongoDB with Express + TypeScript!");
});

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
