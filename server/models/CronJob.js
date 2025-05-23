import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import { CRON_SCHEDULE, getTestSchedule } from '../config/cron.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'data', 'cronjobs.json');

// Store active cron jobs in memory
const activeJobs = new Map();

class CronJob {
  static async getAll() {
    try {
      const data = await fs.promises.readFile(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading cron jobs:', error);
      return [];
    }
  }

  static async getById(id) {
    try {
      const jobs = await this.getAll();
      return jobs.find(job => job.id === id) || null;
    } catch (error) {
      console.error('Error getting cron job by id:', error);
      return null;
    }
  }

  static async create(jobData) {
    try {
      const jobs = await this.getAll();

      const newJob = {
        id: uuidv4(),
        ...jobData,
        status: 'active',
        lastRun: null,
        nextRun: this.calculateNextRun(jobData.schedule),
        createdAt: new Date().toISOString(),
      };

      jobs.push(newJob);

      await fs.promises.writeFile(dataPath, JSON.stringify(jobs, null, 2));

      // Schedule the job
      this.scheduleJob(newJob);

      return newJob;
    } catch (error) {
      console.error('Error creating cron job:', error);
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const jobs = await this.getAll();
      const index = jobs.findIndex(job => job.id === id);

      if (index === -1) {
        throw new Error('Cron job not found');
      }

      const updatedJob = {
        ...jobs[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      // If schedule changed, update next run time
      if (updateData.schedule && updateData.schedule !== jobs[index].schedule) {
        updatedJob.nextRun = this.calculateNextRun(updateData.schedule);
      }

      jobs[index] = updatedJob;

      await fs.promises.writeFile(dataPath, JSON.stringify(jobs, null, 2));

      // If job is active and scheduled, reschedule it
      if (updatedJob.status === 'active') {
        this.stopJob(id);
        this.scheduleJob(updatedJob);
      } else {
        this.stopJob(id);
      }

      return updatedJob;
    } catch (error) {
      console.error('Error updating cron job:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const jobs = await this.getAll();
      const filteredJobs = jobs.filter(job => job.id !== id);

      if (filteredJobs.length === jobs.length) {
        throw new Error('Cron job not found');
      }

      await fs.promises.writeFile(dataPath, JSON.stringify(filteredJobs, null, 2));

      // Stop the job if it's running
      this.stopJob(id);

      return true;
    } catch (error) {
      console.error('Error deleting cron job:', error);
      throw error;
    }
  }

  // Calculate next run time based on cron schedule
  static calculateNextRun(schedule) {
    try {
      const validSchedule = schedule || CRON_SCHEDULE;

      if (!cron.validate(validSchedule)) {
        throw new Error('Invalid cron schedule');
      }

      // Calculate the next occurrence
      const now = new Date();
      let nextRun = new Date(now);

      // Parse the cron schedule
      const [minute, hour, dayOfMonth, month, dayOfWeek] = validSchedule.split(' ');

      // Set the time to the specified hour and minute
      nextRun.setHours(parseInt(hour, 10));
      nextRun.setMinutes(parseInt(minute, 10));
      nextRun.setSeconds(0);
      nextRun.setMilliseconds(0);

      // If the time has already passed today, add one day
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }

      return nextRun.toISOString();
    } catch (error) {
      console.error('Error calculating next run:', error);
      return null;
    }
  }

  // Schedule a cron job
  static scheduleJob(job) {
    try {
      // Stop any existing job with this ID
      this.stopJob(job.id);

      // Determine schedule based on test mode
      let schedule;
      if (process.env.CRON_TEST_MODE === 'true') {
        schedule = getTestSchedule();
      } else {
        schedule = CRON_SCHEDULE;
      }

      if (!cron.validate(schedule)) {
        console.error(`Invalid cron schedule for job ${job.id}: ${schedule}`);
        return;
      }

      // Create a new cron job
      const task = cron.schedule(schedule, async () => {
        console.log(`Running cron job ${job.id} for project ${job.projectId}`);

        try {
          await this.executeTimesheetSubmission(job);

          // Update job's last run time and next run time
          await this.update(job.id, {
            lastRun: new Date().toISOString(),
            nextRun: this.calculateNextRun(schedule),
            status: 'active',
          });
        } catch (error) {
          console.error(`Error executing cron job ${job.id}:`, error);
          await this.update(job.id, {
            lastRun: new Date().toISOString(),
            status: 'failed',
          });
        }
      });

      // Store the task
      activeJobs.set(job.id, task);
      console.log(`Scheduled cron job ${job.id} with schedule: ${schedule}`);
    } catch (error) {
      console.error(`Error scheduling job ${job.id}:`, error);
    }
  }

  // Stop a running cron job
  static stopJob(id) {
    if (activeJobs.has(id)) {
      const task = activeJobs.get(id);
      task.stop();
      activeJobs.delete(id);
      console.log(`Stopped cron job ${id}`);
    }
  }

  // This method would actually make the API call to submit the timesheet
  static async executeTimesheetSubmission(job) {
    try {
      console.log(`Executing timesheet submission for job ${job.id}`);

      const url = `https://teknopoint.proofhub.com/api/v3/projects/${job.projectId}/timesheets/${job.timesheetId}/time`;

      const headers = {
        'x-api-key': job.timesheetData.apiKey,
        'ref-key': job.timesheetData.refKey,
        'Content-Type': 'application/json'
      };

      const payload = {
        project: parseInt(job.projectId),
        timesheet_id: parseInt(job.timesheetId),
        timesheetTitle: "",
        estimated_hours: "",
        estimated_mins: "",
        timesheetAssigned: "",
        date: job.timesheetData.date,
        logged_hours: Math.floor(job.timesheetData.totalHours),
        logged_mins: Math.round((job.timesheetData.totalHours % 1) * 60),
        description: job.timesheetData.message,
        status: "billable",
        undefined: false
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API call failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Timesheet submission successful:', result);
      return result;
    } catch (error) {
      console.error('Error executing timesheet submission:', error);
      throw error;
    }
  }

  // Initialize all active jobs from the database
  static async initializeJobs() {
    try {
      const jobs = await this.getAll();
      const activeJobs = jobs.filter(job => job.status === 'active');

      console.log(`Initializing ${activeJobs.length} active cron jobs`);

      for (const job of activeJobs) {
        this.scheduleJob(job);
      }
    } catch (error) {
      console.error('Error initializing cron jobs:', error);
    }
  }
}

// Initialize jobs on module import
CronJob.initializeJobs();

export default CronJob;