import express from 'express';
import { 
  createTimesheet,
  getAllTimesheets,
  getTimesheetById,
  updateTimesheet,
  deleteTimesheet,
} from '../controllers/timesheetController.js';

const router = express.Router();

// Create a new timesheet
router.post('/', createTimesheet);

// Get all timesheets
router.get('/', getAllTimesheets);

// Get a single timesheet by ID
router.get('/:id', getTimesheetById);

// Update a timesheet
router.put('/:id', updateTimesheet);

// Delete a timesheet
router.delete('/:id', deleteTimesheet);

export default router;