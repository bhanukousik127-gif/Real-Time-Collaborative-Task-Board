import mongoose from 'mongoose';

let isConnected = false;
let useMemoryStore = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/collaborative_task_board';
  
  try {
    // Attempt Mongoose connection with 3-second server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    useMemoryStore = false;
    console.log(`[Database] MongoDB connected successfully to ${uri}`);
  } catch (err) {
    console.warn(`[Database] MongoDB connection failed (${err.message}).`);
    console.log('[Database] Falling back seamlessly to persistent In-Memory Storage Adapter for instant zero-dependency execution.');
    isConnected = false;
    useMemoryStore = true;
  }
};

export const getDBStatus = () => ({
  isConnected,
  useMemoryStore,
});
