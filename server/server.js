import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;



// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware);
// Connect DB
await connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('i am home');
});
// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));

app.listen(port, () => {
  console.log(`server is listening at port number ${port}`);
});
