
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#5E5AFF]">stayInsights</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                to="/features"
                className="text-gray-600 hover:text-[#5E5AFF] px-3 py-2 text-sm font-medium"
              >
                Features
              </Link>
              <Link
                to="/solutions"
                className="text-gray-600 hover:text-[#5E5AFF] px-3 py-2 text-sm font-medium"
              >
                Solutions
              </Link>
              <Link
                to="/pricing"
                className="text-gray-600 hover:text-[#5E5AFF] px-3 py-2 text-sm font-medium"
              >
                Pricing
              </Link>
              <Link
                to="/testimonials"
                className="text-gray-600 hover:text-[#5E5AFF] px-3 py-2 text-sm font-medium"
              >
                Testimonials
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-gray-700">Dashboard</Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="text-gray-700 flex items-center gap-2" 
                  onClick={logOut}
                >
                  <LogOut size={16} />
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-700">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-[#5E5AFF] hover:bg-[#4B48CC]">Get Started</Button>
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/features"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-[#5E5AFF] hover:bg-gray-50"
            >
              Features
            </Link>
            <Link
              to="/solutions"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-[#5E5AFF] hover:bg-gray-50"
            >
              Solutions
            </Link>
            <Link
              to="/pricing"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-[#5E5AFF] hover:bg-gray-50"
            >
              Pricing
            </Link>
            <Link
              to="/testimonials"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-[#5E5AFF] hover:bg-gray-50"
            >
              Testimonials
            </Link>
            <div className="pt-4 flex flex-col space-y-3">
              {currentUser ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full">Dashboard</Button>
                  </Link>
                  <Button 
                    className="w-full flex items-center justify-center gap-2" 
                    variant="outline"
                    onClick={logOut}
                  >
                    <LogOut size={16} />
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="w-full bg-[#5E5AFF] hover:bg-[#4B48CC]">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
