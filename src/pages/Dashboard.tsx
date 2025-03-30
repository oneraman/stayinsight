
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsOverview from "@/components/dashboard/MetricsOverview";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import RecommendedActions from "@/components/dashboard/RecommendedActions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/FileUploader";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarInset
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, BarChart2, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState("30");

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Dashboard" asChild>
                  <Link to="/dashboard" className="text-[#5E5AFF]">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Customers" asChild>
                  <Link to="/dashboard" className="text-gray-600">
                    <Users className="h-5 w-5" />
                    <span>Customers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Analytics" asChild>
                  <Link to="/dashboard" className="text-gray-600">
                    <BarChart2 className="h-5 w-5" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" asChild>
                  <Link to="/dashboard" className="text-gray-600">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col">
          <DashboardHeader />

          <div className="flex-1 max-w-full px-4 sm:px-6 py-6 overflow-auto">
            <div className="flex justify-between mb-6">
              <Tabs value={timePeriod} onValueChange={setTimePeriod} className="w-auto">
                <TabsList>
                  <TabsTrigger value="30" className="text-xs">Last 30 days</TabsTrigger>
                  <TabsTrigger value="60" className="text-xs">Last 60 days</TabsTrigger>
                  <TabsTrigger value="90" className="text-xs">Last 90 days</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Tabs defaultValue="all" className="w-auto">
                <TabsList>
                  <TabsTrigger value="all" className="text-xs">All Segments</TabsTrigger>
                  <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
                  <TabsTrigger value="at-risk" className="text-xs">At Risk</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Import Data</h2>
                <FileUploader />
              </div>
              
              <MetricsOverview />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Customer Health Score</h2>
                  </div>
                  <p className="text-gray-500">Customer health score data will appear here.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Customer Segments</h2>
                  </div>
                  <p className="text-gray-500">Customer segments data will appear here.</p>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
