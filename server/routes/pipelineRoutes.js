import express from 'express';
import {
  getPipelines,
  getPipeline,
  createPipeline,
  updatePipeline,
  deletePipeline,
  getPipelineStats,
  startPipeline,
  completePipeline,
  getRecentActivities
} from '../controllers/pipelineController.js';
import { checkPipelineAccess, canViewPipelines } from '../middleware/pipelineAccess.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all pipelines (with team-based access control)
router.get('/', canViewPipelines, getPipelines);

// Get pipeline statistics
router.get('/stats', getPipelineStats);

// Get a single pipeline (with team-based access control)
router.get('/:id', canViewPipelines, getPipeline);

// Create a new pipeline
router.post('/', createPipeline);

// Update a pipeline (with team-based access control)
router.put('/:id', checkPipelineAccess('run'), updatePipeline);

// Delete a pipeline (with team-based access control)
router.delete('/:id', checkPipelineAccess('delete'), deletePipeline);

// Start a pipeline (with team-based access control)
router.post('/:id/start', checkPipelineAccess('run'), startPipeline);

// Complete a pipeline (with team-based access control)
router.post('/:id/complete', checkPipelineAccess('run'), completePipeline);

// Get recent pipeline activities
router.get('/activities/recent', protect, getRecentActivities);

export default router;