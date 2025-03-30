
import { Search, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

const DashboardHeader = ({ onToggleSidebar, isSidebarCollapsed }: DashboardHeaderProps) => {
  const { currentUser } = useAuth();
  
  // Get user name for display
  const getUserName = () => {
    if (!currentUser || !currentUser.email) return "User";
    // Extract name from email or use first part of email
    const email = currentUser.email;
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-full px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {isSidebarCollapsed && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onToggleSidebar} 
                className="mr-2 text-gray-500 hover:text-primary hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">stayInsights</span>
            </Link>
            <div className="hidden md:flex ml-10">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search customers..." 
                  className="pl-8 h-9 text-sm bg-gray-50 border-gray-100"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="flex flex-col items-end mr-2 hidden md:block">
                <span className="text-sm font-medium">{getUserName()}</span>
                <span className="text-xs text-gray-500">Product Manager</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <User size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
