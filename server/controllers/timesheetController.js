import Timesheet from '../models/Timesheet.js';
import CronJob from '../models/CronJob.js';
import { CRON_SCHEDULE } from '../config/cron.js';

// Create a new timesheet and associated cron job
export const createTimesheet = async (req, res) => {
  try {
    const { projectId, timesheetId, date, totalHours, apiKey, refKey, message } = req.body;

    // Validate inputs
    if (!projectId || !timesheetId || !date || !totalHours || !apiKey || !refKey || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
    }

    // Create timesheet record
    const timesheet = await Timesheet.create({
      projectId,
      timesheetId,
      date,
      totalHours,
      apiKey,
      refKey,
      message,
    });

    // Create a cron job for this timesheet
    const cronJob = await CronJob.create({
      projectId,
      timesheetId,
      schedule: CRON_SCHEDULE,
      timesheetData: {
        date,
        totalHours,
        apiKey,
        refKey,
        message,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...timesheet,
        cronJobId: cronJob.id,
      },
    });
  } catch (error) {
    console.error('Error in createTimesheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create timesheet automation',
    });
  }
};

// Get all timesheets
export const getAllTimesheets = async (req, res) => {
  try {
    const timesheets = await Timesheet.getAll();
    res.json({
      success: true,
      data: timesheets,
    });
  } catch (error) {
    console.error('Error in getAllTimesheets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve timesheets',
    });
  }
};

// Get a single timesheet by ID
export const getTimesheetById = async (req, res) => {
  try {
    const { id } = req.params;
    const timesheet = await Timesheet.getById(id);

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        error: 'Timesheet not found',
      });
    }

    res.json({
      success: true,
      data: timesheet,
    });
  } catch (error) {
    console.error('Error in getTimesheetById:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve timesheet',
    });
  }
};

// Update a timesheet
export const updateTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const timesheet = await Timesheet.getById(id);
    if (!timesheet) {
      return res.status(404).json({
        success: false,
        error: 'Timesheet not found',
      });
    }

    const updatedTimesheet = await Timesheet.update(id, updateData);

    res.json({
      success: true,
      data: updatedTimesheet,
    });
  } catch (error) {
    console.error('Error in updateTimesheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update timesheet',
    });
  }
};

// Delete a timesheet
export const deleteTimesheet = async (req, res) => {
  try {
    const { id } = req.params;

    const timesheet = await Timesheet.getById(id);
    if (!timesheet) {
      return res.status(404).json({
        success: false,
        error: 'Timesheet not found',
      });
    }

    await Timesheet.delete(id);

    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Error in deleteTimesheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete timesheet',
    });
  }
};