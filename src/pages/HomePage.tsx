import React from 'react';
import { TimesheetForm } from '../components/TimesheetForm';
import { CronJobList } from '../components/CronJobList';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <TimesheetForm />
      <CronJobList />
    </div>
  );
};