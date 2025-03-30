
import { RefreshCw, FileUp, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const DashboardHeader = () => {
  const { currentUser } = useAuth();
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.email) return "U";
    const email = currentUser.email;
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#5E5AFF]">StayInsights</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">
              <RefreshCw size={16} className="mr-2" />
              Refresh Data
            </Button>
            <Link to="/customer-data">
              <Button>
                <Upload size={16} className="mr-2" />
                Import Data
              </Button>
            </Link>
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
              {getUserInitials()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
