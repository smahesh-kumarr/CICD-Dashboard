import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getPipelines,
  getPipeline,
  createPipeline,
  updatePipeline,
  deletePipeline,
  startPipeline,
  completePipeline,
  getPipelineStats
} from '../controllers/pipelineController.js';

const router = express.Router();

// Get pipeline statistics
router.get('/stats', auth, getPipelineStats);

// Get all pipelines with optional status filter
router.get('/', auth, getPipelines);

// Get pipeline by ID
router.get('/:id', auth, getPipeline);

// Create new pipeline
router.post('/', auth, createPipeline);

// Update pipeline
router.put('/:id', auth, updatePipeline);

// Delete pipeline
router.delete('/:id', auth, deletePipeline);

// Start pipeline
router.post('/:id/start', auth, startPipeline);

// Complete pipeline
router.post('/:id/complete', auth, completePipeline);

export default router; 