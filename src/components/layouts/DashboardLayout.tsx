import { ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  LogOut, 
  History, 
  MessageSquare,
  Search,
  RefreshCw,
  Download,
  Bell,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  onUpload?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  isRefreshing?: boolean;
  hasData?: boolean;
}

const DashboardLayout = ({
  children,
  onUpload,
  onRefresh,
  onExport,
  isRefreshing = false,
  hasData = true
}: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState("30 Days");
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser, logOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const getLinkClasses = (path: string) => {
    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-md transition-colors";
    const activeClasses = "bg-[#262c3a] text-white";
    const inactiveClasses = "hover:bg-[#262c3a] text-gray-300 hover:text-white";
    
    return `${baseClasses} ${isActiveRoute(path) ? activeClasses : inactiveClasses}`;
  };

  const timeFilters = ["7 Days", "30 Days", "90 Days"];

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const displayName = currentUser?.user_metadata?.display_name || 
                     currentUser?.email?.split('@')[0] || 
                     'User';

  const avatarUrl = currentUser?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-gray-50 flex dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <div className={`bg-[#1A1F2C] text-white transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-20' : 'w-64'} flex flex-col fixed h-full z-10`}>
        <div className="flex items-center p-4 border-b border-gray-800">
          <Link to="/dashboard" className={`text-xl font-bold text-[#5E5AFF] flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
            {sidebarCollapsed ? "SIA" : "stayInsightAI"}
          </Link>
        </div>
        
        <nav className="flex-1 pt-5">
          <ul className="space-y-2 px-2">
            <li>
              <Link to="/dashboard" className={cn(
                getLinkClasses("/dashboard"),
                isActiveRoute("/dashboard") && "relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-[#5E5AFF] before:rounded-r"
              )}>
                <LayoutDashboard className={cn(
                  "h-5 w-5",
                  isActiveRoute("/dashboard") ? "text-[#5E5AFF]" : "text-gray-400"
                )} />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link to="/customers" className={cn(
                getLinkClasses("/customers"),
                isActiveRoute("/customers") && "relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-[#5E5AFF] before:rounded-r"
              )}>
                <Users className={cn(
                  "h-5 w-5",
                  isActiveRoute("/customers") ? "text-[#5E5AFF]" : "text-gray-400"
                )} />
                {!sidebarCollapsed && <span>Customers</span>}
              </Link>
            </li>
            <li>
              <Link to="/datachat" className={cn(
                getLinkClasses("/datachat"),
                isActiveRoute("/datachat") && "relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-[#5E5AFF] before:rounded-r"
              )}>
                <MessageSquare className={cn(
                  "h-5 w-5",
                  isActiveRoute("/datachat") ? "text-[#5E5AFF]" : "text-gray-400"
                )} />
                {!sidebarCollapsed && <span>Data Chat</span>}
              </Link>
            </li>
            <li>
              <Link to="/history" className={cn(
                getLinkClasses("/history"),
                isActiveRoute("/history") && "relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-[#5E5AFF] before:rounded-r"
              )}>
                <History className={cn(
                  "h-5 w-5",
                  isActiveRoute("/history") ? "text-[#5E5AFF]" : "text-gray-400"
                )} />
                {!sidebarCollapsed && <span>Upload History</span>}
              </Link>
            </li>
            <li>
              <Link to="/settings" className={cn(
                getLinkClasses("/settings"),
                isActiveRoute("/settings") && "relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-[#5E5AFF] before:rounded-r"
              )}>
                <Settings className={cn(
                  "h-5 w-5",
                  isActiveRoute("/settings") ? "text-[#5E5AFF]" : "text-gray-400"
                )} />
                {!sidebarCollapsed && <span>Settings</span>}
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Import Data Button */}
        <div className={`p-4 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          <Link to="/customers">
            <Button className="w-full bg-[#5E5AFF] hover:bg-[#4840FF] text-white gap-2">
              <Upload className="h-4 w-4" />
              {!sidebarCollapsed && <span>Import Data</span>}
            </Button>
          </Link>
        </div>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 text-gray-300 hover:text-white hover:bg-[#262c3a]"
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span>Log Out</span>}
          </Button>
        </div>
        
        <div className="p-4 border-t border-gray-800">
          <Button 
            variant="ghost" 
            onClick={toggleSidebar} 
            className="w-full flex items-center justify-center gap-2 text-gray-300 hover:text-white hover:bg-[#262c3a]"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!sidebarCollapsed && <span>Hide Sidebar</span>}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-xl font-bold text-primary">
              StayInsightAI
            </Link>
            
            <nav className="hidden lg:flex gap-6 text-sm">
              <Link 
                to="/dashboard" 
                className={`${isActiveRoute('/dashboard') 
                  ? 'text-gray-900 font-medium border-b-2 border-primary pb-1' 
                  : 'text-gray-500 hover:text-gray-900'}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/customers" 
                className={`${isActiveRoute('/customers') 
                  ? 'text-gray-900 font-medium border-b-2 border-primary pb-1' 
                  : 'text-gray-500 hover:text-gray-900'}`}
              >
                Customers
              </Link>
              <Link 
                to="/history" 
                className={`${isActiveRoute('/history') 
                  ? 'text-gray-900 font-medium border-b-2 border-primary pb-1' 
                  : 'text-gray-500 hover:text-gray-900'}`}
              >
                Upload History
              </Link>
            </nav>
          </div>
          
          <div className="hidden md:flex items-center relative max-w-md w-full mx-8">
            <Search className="h-4 w-4 absolute left-3 text-gray-400" />
            <Input 
              placeholder="Search customers, reports..." 
              className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-primary"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-500" />
              <Badge className="absolute top-1 right-1 w-2 h-2 p-0 bg-red-500" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 border border-gray-200">
                    <AvatarImage 
                      src={avatarUrl || ""} 
                      alt={displayName} 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentUser?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer flex w-full items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/history" className="cursor-pointer flex w-full items-center">
                    <History className="mr-2 h-4 w-4" />
                    <span>Upload History</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => logOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Header Panel */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Title and filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Customer Retention Dashboard</h1>
                <div className="flex gap-2">
                  {timeFilters.map((filter) => (
                    <Badge
                      key={filter}
                      variant={activeFilter === filter ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1"
                      onClick={() => setActiveFilter(filter)}
                    >
                      {filter}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button onClick={onUpload} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Data
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="gap-2"
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={onExport}
                  disabled={!hasData}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;