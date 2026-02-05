import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

dotenv.config();
const port=3000;
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());


await connectDB();

// Routes
app.get('/', async (req, res) => {
  res.send('i am home');
});


app.listen(port,(req,res)=>{
  console.log(`App is listening to the port number ${port}`);
});

export default app;
