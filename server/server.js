import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './configs/db.js';

dotenv.config(); // LOAD ONCE, HERE ONLY

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect DB
await connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('i am home');
});

app.listen(port, () => {
  console.log(`server is listening at port number ${port}`);
});
