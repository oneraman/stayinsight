import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Settings, ChevronLeft, ChevronRight, Upload, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
interface DashboardLayoutProps {
  children: ReactNode;
}
const DashboardLayout = ({
  children
}: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    logOut
  } = useAuth();
  const navigate = useNavigate();
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  return <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-[#1A1F2C] text-white transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-20' : 'w-64'} flex flex-col fixed h-full z-10`}>
        <div className="flex items-center p-4 border-b border-gray-800">
          <Link to="/dashboard" className={`text-xl font-bold text-[#5E5AFF] flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
            {sidebarCollapsed ? "SI" : "stayInsights"}
          </Link>
        </div>
        
        <nav className="flex-1 pt-5">
          <ul className="space-y-2 px-2">
            <li>
              <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-md bg-[#262c3a] text-white">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link to="/customers" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-[#262c3a] text-gray-300 hover:text-white transition-colors">
                <Users className="h-5 w-5" />
                {!sidebarCollapsed && <span>Customers</span>}
              </Link>
            </li>
            <li>
              <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-[#262c3a] text-gray-300 hover:text-white transition-colors">
                <Settings className="h-5 w-5" />
                {!sidebarCollapsed && <span>Settings</span>}
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* CTA Button */}
        <div className={`p-4 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          
        </div>
        
        <div className="p-4 border-t border-gray-800 mt-auto">
          <Button variant="ghost" onClick={toggleSidebar} className="w-full flex items-center justify-center gap-2 text-gray-300 hover:text-white hover:bg-[#262c3a]">
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!sidebarCollapsed && <span>Hide Sidebar</span>}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <DashboardHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>;
};
export default DashboardLayout;