import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logOut } = useAuth();

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                stayInsightAI
              </span>
            </Link>
            <div className="hidden md:ml-12 md:flex md:space-x-8">
              <Link
                to="/features"
                className="text-slate-600 hover:text-indigo-600 px-4 py-2 text-base font-medium transition-all duration-300 hover:scale-105"
              >
                Features
              </Link>
              <Link
                to="/solutions"
                className="text-slate-600 hover:text-indigo-600 px-4 py-2 text-base font-medium transition-all duration-300 hover:scale-105"
              >
                Solutions
              </Link>
              <Link
                to="/pricing"
                className="text-slate-600 hover:text-indigo-600 px-4 py-2 text-base font-medium transition-all duration-300 hover:scale-105"
              >
                Pricing
              </Link>
              <Link
                to="/testimonials"
                className="text-slate-600 hover:text-indigo-600 px-4 py-2 text-base font-medium transition-all duration-300 hover:scale-105"
              >
                Testimonials
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            {currentUser ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-slate-700 hover:text-indigo-600 font-medium transition-all duration-300 hover:scale-105">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="text-slate-700 border-gray-200 hover:border-indigo-200 hover:text-indigo-600 flex items-center gap-2 font-medium px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105" 
                  onClick={logOut}
                >
                  <LogOut size={16} />
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-slate-700 hover:text-indigo-600 font-medium transition-all duration-300 hover:scale-105">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-200">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-gray-50 focus:outline-none transition-all duration-300"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-6 pt-4 pb-6 space-y-4">
            <Link
              to="/features"
              className="block px-4 py-3 rounded-xl text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-gray-50 transition-all duration-300"
            >
              Features
            </Link>
            <Link
              to="/solutions"
              className="block px-4 py-3 rounded-xl text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-gray-50 transition-all duration-300"
            >
              Solutions
            </Link>
            <Link
              to="/pricing"
              className="block px-4 py-3 rounded-xl text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-gray-50 transition-all duration-300"
            >
              Pricing
            </Link>
            <Link
              to="/testimonials"
              className="block px-4 py-3 rounded-xl text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-gray-50 transition-all duration-300"
            >
              Testimonials
            </Link>
            <div className="pt-4 flex flex-col space-y-4">
              {currentUser ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full rounded-xl font-medium py-3">Dashboard</Button>
                  </Link>
                  <Button 
                    className="w-full flex items-center justify-center gap-2 rounded-xl font-medium py-3" 
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
                    <Button variant="outline" className="w-full rounded-xl font-medium py-3">Log in</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium py-3">Get Started</Button>
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