import express from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';  // Add this import

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getCurrentUser);

// Get users by organization
router.get('/organization/:orgId', protect, async (req, res) => {
  try {
    const users = await User.find({ orgId: req.params.orgId })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching organization users',
      error: error.message
    });
  }
});

export default router;