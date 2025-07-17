import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Verify environment variables are loaded
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY ? '***' + process.env.API_KEY.slice(-4) : 'MISSING',
  api_secret: process.env.API_SECRET ? '***' + process.env.API_SECRET.slice(-4) : 'MISSING'
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true
});

export default cloudinary;