import express from 'express';
import {
  createCredential,
  getCredentials,
  getCredentialsByType,
  updateCredential,
  deleteCredential
} from '../controllers/credentialController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Credential routes
router.post('/', createCredential);
router.get('/', getCredentials);
router.get('/type/:type', getCredentialsByType);
router.put('/:id', updateCredential);
router.delete('/:id', deleteCredential);

export default router; 