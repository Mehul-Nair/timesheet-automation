import { AxiosError } from "axios";
import { ApiResponse, CronJob, Timesheet } from "../types";
import api from "../lib/api";

interface TimesheetInput {
  projectId: string;
  timesheetId: string;
  date: string;
  totalHours: number;
  apiKey: string;
  refKey: string;
  message: string;
}

export const createTimesheet = async (
  data: TimesheetInput
): Promise<ApiResponse<Timesheet>> => {
  try {
    const response = await api.post<ApiResponse<Timesheet>>(
      "/timesheets",
      data
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data as ApiResponse<Timesheet>;
    }
    return { success: false, error: "Failed to connect to server" };
  }
};

export const fetchCronJobs = async (): Promise<ApiResponse<CronJob[]>> => {
  try {
    const response = await api.get<ApiResponse<CronJob[]>>("/cron-jobs");
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data as ApiResponse<CronJob[]>;
    }
    return { success: false, error: "Failed to connect to server" };
  }
};

export const deleteCronJob = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete<ApiResponse<void>>(`/cron-jobs/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data as ApiResponse<void>;
    }
    return { success: false, error: "Failed to connect to server" };
  }
};
