import CronJob from '../models/CronJob.js';

// Get all cron jobs
export const getAllCronJobs = async (req, res) => {
  try {
    const cronJobs = await CronJob.getAll();
    res.json({
      success: true,
      data: cronJobs,
    });
  } catch (error) {
    console.error('Error in getAllCronJobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cron jobs',
    });
  }
};

// Get a single cron job by ID
export const getCronJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const cronJob = await CronJob.getById(id);
    
    if (!cronJob) {
      return res.status(404).json({
        success: false,
        error: 'Cron job not found',
      });
    }
    
    res.json({
      success: true,
      data: cronJob,
    });
  } catch (error) {
    console.error('Error in getCronJobById:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cron job',
    });
  }
};

// Update a cron job
export const updateCronJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const cronJob = await CronJob.getById(id);
    if (!cronJob) {
      return res.status(404).json({
        success: false,
        error: 'Cron job not found',
      });
    }
    
    const updatedCronJob = await CronJob.update(id, updateData);
    
    res.json({
      success: true,
      data: updatedCronJob,
    });
  } catch (error) {
    console.error('Error in updateCronJob:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cron job',
    });
  }
};

// Delete a cron job
export const deleteCronJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cronJob = await CronJob.getById(id);
    if (!cronJob) {
      return res.status(404).json({
        success: false,
        error: 'Cron job not found',
      });
    }
    
    await CronJob.delete(id);
    
    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Error in deleteCronJob:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete cron job',
    });
  }
};

// Pause a cron job
export const pauseCronJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cronJob = await CronJob.getById(id);
    if (!cronJob) {
      return res.status(404).json({
        success: false,
        error: 'Cron job not found',
      });
    }
    
    const updatedCronJob = await CronJob.update(id, { status: 'paused' });
    
    res.json({
      success: true,
      data: updatedCronJob,
    });
  } catch (error) {
    console.error('Error in pauseCronJob:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pause cron job',
    });
  }
};

// Resume a cron job
export const resumeCronJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cronJob = await CronJob.getById(id);
    if (!cronJob) {
      return res.status(404).json({
        success: false,
        error: 'Cron job not found',
      });
    }
    
    const updatedCronJob = await CronJob.update(id, { 
      status: 'active',
      nextRun: CronJob.calculateNextRun(cronJob.schedule),
    });
    
    res.json({
      success: true,
      data: updatedCronJob,
    });
  } catch (error) {
    console.error('Error in resumeCronJob:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resume cron job',
    });
  }
};