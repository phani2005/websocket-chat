import express from 'express';
import cors from 'cors';
import uploadRouter from './routes/upload.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = 3000;

// Critical Middleware Updates
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', uploadRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});