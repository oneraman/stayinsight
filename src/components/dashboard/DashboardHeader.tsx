
import { RefreshCw, FileUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DashboardHeader = () => {
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
            <Link to="/upload">
              <Button>
                <FileUp size={16} className="mr-2" />
                Upload Data
              </Button>
            </Link>
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
              U
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
