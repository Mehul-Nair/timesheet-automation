import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/Card";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { toast } from "react-hot-toast";
import { createTimesheet } from "../services/api";

interface FormValues {
  projectId: string;
  timesheetId: string;
  date: string;
  totalHours: string;
  apiKey: string;
  refKey: string;
  message: string;
}

interface FormErrors {
  projectId?: string;
  timesheetId?: string;
  date?: string;
  totalHours?: string;
  apiKey?: string;
  refKey?: string;
  message?: string;
}

export const TimesheetForm: React.FC = () => {
  const [formValues, setFormValues] = useState<FormValues>({
    projectId: "",
    timesheetId: "",
    date: new Date().toISOString().split("T")[0],
    totalHours: "",
    apiKey: "",
    refKey: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formValues.projectId) {
      newErrors.projectId = "Project ID is required";
    }

    if (!formValues.timesheetId) {
      newErrors.timesheetId = "Timesheet ID is required";
    }

    if (!formValues.date) {
      newErrors.date = "Date is required";
    }

    if (!formValues.totalHours) {
      newErrors.totalHours = "Total hours is required";
    } else if (
      isNaN(parseFloat(formValues.totalHours)) ||
      parseFloat(formValues.totalHours) <= 0
    ) {
      newErrors.totalHours = "Total hours must be a positive number";
    }

    if (!formValues.apiKey) {
      newErrors.apiKey = "API Key is required";
    }

    if (!formValues.refKey) {
      newErrors.refKey = "Reference Key is required";
    }

    if (!formValues.message) {
      newErrors.message = "Task description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createTimesheet({
        projectId: formValues.projectId,
        timesheetId: formValues.timesheetId,
        date: formValues.date,
        totalHours: parseFloat(formValues.totalHours),
        apiKey: formValues.apiKey,
        refKey: formValues.refKey,
        message: formValues.message,
      });

      if (response.success) {
        toast.success("Timesheet automation created successfully!");

        // Reset form except for API keys which are likely to be reused
        setFormValues((prev) => ({
          ...prev,
          projectId: "",
          timesheetId: "",
          date: new Date().toISOString().split("T")[0],
          totalHours: "",
        }));
      } else {
        toast.error(response.error || "Failed to create timesheet automation");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader className="bg-lavender-light/30">
        <CardTitle>Create Timesheet Automation</CardTitle>
        <CardDescription>
          Set up automated timesheet submissions that will run daily at 7:30 PM.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Project ID"
              name="projectId"
              placeholder="Enter project ID"
              value={formValues.projectId}
              onChange={handleChange}
              error={errors.projectId}
              required
            />

            <Input
              label="Timesheet ID"
              name="timesheetId"
              placeholder="Enter timesheet ID"
              value={formValues.timesheetId}
              onChange={handleChange}
              error={errors.timesheetId}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date"
              name="date"
              type="date"
              value={formValues.date}
              onChange={handleChange}
              error={errors.date}
              required
            />

            <Input
              label="Total Hours"
              name="totalHours"
              type="number"
              step="0.5"
              min="0.5"
              placeholder="Enter total hours"
              value={formValues.totalHours}
              onChange={handleChange}
              error={errors.totalHours}
              required
            />
          </div>

          <div className="w-full">
            <Input
              label="Task Description"
              name="message"
              placeholder="Enter a short description of the task"
              value={formValues.message}
              onChange={handleChange}
              error={errors.message}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="API Key"
              name="apiKey"
              placeholder="Enter your API key"
              value={formValues.apiKey}
              onChange={handleChange}
              error={errors.apiKey}
              required
            />

            <Input
              label="Reference Key"
              name="refKey"
              placeholder="Enter reference key"
              value={formValues.refKey}
              onChange={handleChange}
              error={errors.refKey}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-gray-100 pt-4">
          <Button type="submit" isLoading={isSubmitting}>
            Create Automation
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
