// Default cron schedule (8:00 PM on weekdays)
export const DEFAULT_CRON_SCHEDULE = '0 20 * * 1-5';

// Get cron schedule from environment variable with fallback
export const CRON_SCHEDULE = process.env.CRON_SCHEDULE || DEFAULT_CRON_SCHEDULE;

// Test mode schedule (runs after 2 minutes)
export const getTestSchedule = () => {
    const now = new Date();
    const twoMinutesFromNow = new Date(now.getTime() + 2 * 60000);
    const minutes = twoMinutesFromNow.getMinutes();
    const hours = twoMinutesFromNow.getHours();
    return `${minutes} ${hours} * * *`;
}; 