
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
                  <Link to="/dashboard" className="text-primary">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Customers" asChild>
                  <Link to="/dashboard" className="text-gray-600 hover:text-primary transition-colors">
                    <Users className="h-5 w-5" />
                    <span>Customers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Analytics" asChild>
                  <Link to="/dashboard" className="text-gray-600 hover:text-primary transition-colors">
                    <BarChart2 className="h-5 w-5" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" asChild>
                  <Link to="/dashboard" className="text-gray-600 hover:text-primary transition-colors">
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
                <TabsList className="bg-white border border-gray-100">
                  <TabsTrigger value="30" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Last 30 days</TabsTrigger>
                  <TabsTrigger value="60" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Last 60 days</TabsTrigger>
                  <TabsTrigger value="90" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Last 90 days</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Tabs defaultValue="all" className="w-auto">
                <TabsList className="bg-white border border-gray-100">
                  <TabsTrigger value="all" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Segments</TabsTrigger>
                  <TabsTrigger value="active" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Active</TabsTrigger>
                  <TabsTrigger value="at-risk" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">At Risk</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Import Data</h2>
                <FileUploader />
              </div>
              
              <MetricsOverview />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Customer Health Score</h2>
                  </div>
                  <p className="text-gray-500">Customer health score data will appear here.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
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
