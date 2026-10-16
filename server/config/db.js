import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('[MongoDB Warning] MONGODB_URI is not defined. Server running without DB persistence.');
    return null;
  }
  try {
    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10, // Optimize memory for 512MB RAM free tier (default 100 wastes RAM)
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}. Retrying in 5 seconds...`);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
