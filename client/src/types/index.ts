export interface Timesheet {
  id: string;
  projectId: string;
  timesheetId: string;
  date: string;
  totalHours: number;
  apiKey: string;
  refKey: string;
  message: string;
  createdAt: string;
}

export interface CronJob {
  id: string;
  timesheetId: string;
  projectId: string;
  schedule: string;
  status: "active" | "paused" | "completed" | "failed";
  lastRun: string | null;
  nextRun: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
