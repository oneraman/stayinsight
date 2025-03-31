
import React from 'react';
import { Bell, Menu, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

const DashboardHeader = ({ onToggleSidebar, isSidebarCollapsed }: DashboardHeaderProps) => {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6">
        {onToggleSidebar && (
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}
        
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
          
          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="border-b">
        <div className="flex h-14 items-center px-4 md:px-6">
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Link
              to="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Overview
            </Link>
            <Link
              to="/customers"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Customers
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Analytics
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Reports
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
