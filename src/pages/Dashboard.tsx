
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsOverview from "@/components/dashboard/MetricsOverview";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import RecommendedActions from "@/components/dashboard/RecommendedActions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/FileUploader";
import { LayoutDashboard, Users, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState("30");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-[#1A1F2C] text-white transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          {/* Logo & Brand */}
          <div className="flex items-center p-4 border-b border-gray-800">
            <div className="h-8 w-8 mr-2">
              <img src="/lovable-uploads/77a399d7-0bd8-439e-a7b4-e2fdc134ee7f.png" alt="Churnify Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold">Churnify</span>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 pt-5">
            <ul className="space-y-2 px-2">
              <li>
                <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-md bg-[#262c3a] text-white">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/customers" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-[#262c3a] text-gray-300 hover:text-white transition-colors">
                  <Users className="h-5 w-5" />
                  <span>Customers</span>
                </Link>
              </li>
              <li>
                <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-[#262c3a] text-gray-300 hover:text-white transition-colors">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Hide Sidebar Button */}
          <div className="p-4 border-t border-gray-800 mt-auto">
            <Button 
              variant="ghost" 
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center gap-2 text-gray-300 hover:text-white hover:bg-[#262c3a]"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Hide Sidebar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onToggleSidebar={toggleSidebar} isSidebarCollapsed={sidebarCollapsed} />

        <div className="flex-1 max-w-full px-4 sm:px-6 py-6 overflow-auto">
          <div className="flex justify-between mb-6">
            <Tabs value={timePeriod} onValueChange={setTimePeriod} className="w-auto">
              <TabsList className="bg-white border border-gray-100 shadow-sm">
                <TabsTrigger value="30" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Last 30 days</TabsTrigger>
                <TabsTrigger value="60" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Last 60 days</TabsTrigger>
                <TabsTrigger value="90" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Last 90 days</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Tabs defaultValue="all" className="w-auto">
              <TabsList className="bg-white border border-gray-100 shadow-sm">
                <TabsTrigger value="all" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Segments</TabsTrigger>
                <TabsTrigger value="active" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Active</TabsTrigger>
                <TabsTrigger value="at-risk" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">At Risk</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 gap-6 animate-fade-in">
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold mb-4">Import Data</h2>
              <FileUploader />
            </div>
            
            <MetricsOverview />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Customer Health Score</h2>
                </div>
                <p className="text-gray-500">Customer health score data will appear here.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Customer Segments</h2>
                </div>
                <p className="text-gray-500">Customer segments data will appear here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
