import React from 'react';
import { Clock, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Clock className="h-6 w-6 text-primary-600 mr-2" />
          <h1 className="text-xl font-semibold text-gray-900">Timesheet Automation</h1>
        </div>
        
        <nav className="flex space-x-4">
          <NavLink 
            to="/"
            className={({ isActive }) => 
              `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-lavender-light text-primary-700' 
                  : 'text-gray-600 hover:text-primary-600 hover:bg-lavender-light/50'
              }`
            }
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  );
};