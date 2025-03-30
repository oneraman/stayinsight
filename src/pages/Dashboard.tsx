import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsOverview from "@/components/dashboard/MetricsOverview";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import RecommendedActions from "@/components/dashboard/RecommendedActions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/FileUploader";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, BarChart2, Settings, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState("30");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  return <SidebarProvider defaultOpen={!sidebarCollapsed}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarContent className="text-white rounded bg-slate-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center">
                <div className="h-6 w-6 mr-2">
                  <img src="/lovable-uploads/77a399d7-0bd8-439e-a7b4-e2fdc134ee7f.png" alt="Churnify Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-lg font-bold text-white">churnify-insights</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-transparent" onClick={toggleSidebar}>
                {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
            </div>
            <SidebarMenu className="mt-4">
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Dashboard" asChild className="text-white hover:bg-gray-800 transition-colors duration-200">
                  <Link to="/dashboard" className="text-white hover:text-primary-foreground group">
                    <LayoutDashboard className="h-5 w-5 text-primary group-hover:text-primary" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Customers" asChild className="text-white hover:bg-gray-800 transition-colors duration-200">
                  <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors group">
                    <Users className="h-5 w-5 group-hover:text-primary" />
                    <span>Customers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Analytics" asChild className="text-white hover:bg-gray-800 transition-colors duration-200">
                  <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors group">
                    <BarChart2 className="h-5 w-5 group-hover:text-primary" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" asChild className="text-white hover:bg-gray-800 transition-colors duration-200">
                  <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors group">
                    <Settings className="h-5 w-5 group-hover:text-primary" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col">
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
        </SidebarInset>
      </div>
    </SidebarProvider>;
};
export default Dashboard;