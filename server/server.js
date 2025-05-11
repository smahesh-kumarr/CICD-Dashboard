import 'dotenv/config'; // This should be the first import
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes.js';
import credentialRoutes from './routes/credentialRoutes.js';
import pipelineRoutes from './routes/pipelineRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure morgan logging
app.use(morgan('dev'));
// if (process.env.NODE_ENV === 'development') {
// } else {
//   app.use(morgan('combined'));
// }

// Routes
app.use('/api/users', userRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/pipelines', pipelineRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }); 