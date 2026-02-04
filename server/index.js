import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// ⚠️ DO NOT connect DB at top-level
let isConnected = false;
async function initDB() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

// Routes
app.get('/', async (req, res) => {
  await initDB();
  res.send('i am home');
});

app.use("/api/inngest", async (req, res, next) => {
  await initDB();
  next();
}, serve({ client: inngest, functions }));

// ❌ REMOVE app.listen()
// app.listen(port)

export default app;
