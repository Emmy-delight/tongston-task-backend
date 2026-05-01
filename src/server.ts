import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app';

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  console.error('MONGO_URI is required');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });