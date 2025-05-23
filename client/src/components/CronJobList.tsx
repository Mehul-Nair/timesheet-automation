import React, { useEffect, useState } from 'react';
import { Trash2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { CronJob } from '../types';
import { fetchCronJobs, deleteCronJob } from '../services/api';

export const CronJobList: React.FC = () => {
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    loadCronJobs();
  }, []);

  const loadCronJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetchCronJobs();
      if (response.success && response.data) {
        setCronJobs(response.data);
      } else {
        toast.error(response.error || 'Failed to load cron jobs');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(id);
    try {
      const response = await deleteCronJob(id);
      if (response.success) {
        setCronJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
        toast.success('Cron job deleted successfully');
      } else {
        toast.error(response.error || 'Failed to delete cron job');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="bg-lavender-light/30">
        <CardTitle>Active Cron Jobs</CardTitle>
        <CardDescription>
          Manage your automated timesheet submissions
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <div className="py-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : cronJobs.length === 0 ? (
          <div className="py-10 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No cron jobs</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't created any timesheet automations yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cronJobs.map((job) => (
              <div 
                key={job.id} 
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm transition-all hover:shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Project: {job.projectId}</h3>
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Timesheet ID: {job.timesheetId}</p>
                    
                    <div className="mt-3 flex flex-col sm:flex-row sm:gap-4 text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Created: {formatDate(job.createdAt)}</span>
                      </div>
                      
                      {job.lastRun && (
                        <div className="flex items-center text-gray-500 mt-1 sm:mt-0">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Last Run: {formatDate(job.lastRun)}</span>
                        </div>
                      )}
                    </div>
                    
                    {job.nextRun && (
                      <div className="mt-2 text-sm font-medium text-primary-600">
                        Next Run: {formatDate(job.nextRun)}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(job.id)}
                    isLoading={deleteLoading === job.id}
                  >
                    {deleteLoading !== job.id && <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};