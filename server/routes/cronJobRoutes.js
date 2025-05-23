import express from 'express';
import { 
  getAllCronJobs,
  getCronJobById,
  updateCronJob,
  deleteCronJob,
  pauseCronJob,
  resumeCronJob,
} from '../controllers/cronJobController.js';

const router = express.Router();

// Get all cron jobs
router.get('/', getAllCronJobs);

// Get a single cron job by ID
router.get('/:id', getCronJobById);

// Update a cron job
router.put('/:id', updateCronJob);

// Delete a cron job
router.delete('/:id', deleteCronJob);

// Pause a cron job
router.post('/:id/pause', pauseCronJob);

// Resume a cron job
router.post('/:id/resume', resumeCronJob);

export default router;