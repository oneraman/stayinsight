import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
  Settings, 
  LogOut, 
  User, 
  Search,
  Menu,
  Bell,
  History,
  MessagesSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";

const DashboardHeader = () => {
  const { currentUser, logOut } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
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
    <header className="sticky top-0 z-30 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden" 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <Link to="/dashboard" className="text-xl font-bold text-primary">
            StayInsightAI
          </Link>
          
          <nav className="hidden lg:flex gap-6 text-sm">
            <Link to="/dashboard" className="text-gray-900 font-medium">
              Dashboard
            </Link>
            <Link to="/customers" className="text-gray-500 hover:text-gray-900">
              Customers
            </Link>
            <Link to="/data-chat" className="text-gray-500 hover:text-gray-900">
              Data Chat
            </Link>
            <Link to="/history" className="text-gray-500 hover:text-gray-900">
              Upload History
            </Link>
          </nav>
        </div>
        
        <div className="hidden md:flex items-center relative max-w-md w-full mx-8">
          <Search className="h-4 w-4 absolute left-3 text-gray-400" />
          <Input 
            placeholder="Search customers, reports..." 
            className="pl-9 bg-gray-50 border-gray-200"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
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
                <Link to="/data-chat" className="cursor-pointer flex w-full items-center">
                  <MessagesSquare className="mr-2 h-4 w-4" />
                  <span>Data Chat</span>
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
      </div>
      
      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div className="lg:hidden border-t bg-white">
          <nav className="flex flex-col px-4 py-2">
            <Link to="/dashboard" className="py-2 text-gray-900 font-medium">
              Dashboard
            </Link>
            <Link to="/customers" className="py-2 text-gray-500 hover:text-gray-900">
              Customers
            </Link>
            <Link to="/data-chat" className="py-2 text-gray-500 hover:text-gray-900">
              Data Chat
            </Link>
            <Link to="/history" className="py-2 text-gray-500 hover:text-gray-900">
              Upload History
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;