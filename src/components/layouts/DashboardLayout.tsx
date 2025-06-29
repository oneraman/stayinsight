import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Settings, ChevronLeft, ChevronRight, Upload, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({
  children
}: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logOut } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success("Successfully logged out!");
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <div className={`bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-20' : 'w-72'} flex flex-col fixed h-full z-10 shadow-2xl`}>
        <div className="flex items-center p-6 border-b border-slate-700">
          <Link to="/dashboard" className={`text-xl font-bold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
            {sidebarCollapsed ? "SIA" : "stayInsightAI"}
          </Link>
        </div>
        
        <nav className="flex-1 pt-8">
          <ul className="space-y-3 px-4">
            <li>
              <Link to="/dashboard" className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-indigo-600 text-white shadow-lg transition-all duration-300 hover:bg-indigo-700 hover:scale-105">
                <LayoutDashboard className="h-6 w-6" />
                {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link to="/customers" className="flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-300 hover:scale-105">
                <Users className="h-6 w-6" />
                {!sidebarCollapsed && <span className="font-medium">Customers</span>}
              </Link>
            </li>
            <li>
              <Link to="/settings" className="flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-300 hover:scale-105">
                <Settings className="h-6 w-6" />
                {!sidebarCollapsed && <span className="font-medium">Settings</span>}
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Import Data Button */}
        <div className={`p-6 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          <Link to="/customers">
            <Button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white gap-3 py-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 shadow-lg">
              <Upload className="h-5 w-5" />
              {!sidebarCollapsed && <span>Import Data</span>}
            </Button>
          </Link>
        </div>
        
        {/* Logout Button */}
        <div className="p-6 border-t border-slate-700">
          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-3 text-slate-300 hover:text-white hover:bg-slate-700 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            <LogOut className="h-5 w-5" />
            {!sidebarCollapsed && <span className="font-medium">Log Out</span>}
          </Button>
        </div>
        
        <div className="p-6 border-t border-slate-700">
          <Button variant="ghost" onClick={toggleSidebar} className="w-full flex items-center justify-center gap-3 text-slate-300 hover:text-white hover:bg-slate-700 py-4 rounded-2xl transition-all duration-300 hover:scale-105">
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            {!sidebarCollapsed && <span className="font-medium">Hide Sidebar</span>}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        <DashboardHeader />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;