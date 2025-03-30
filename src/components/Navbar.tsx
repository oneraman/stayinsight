
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-churnify-blue">Churnify</span>
              <span className="ml-1 text-sm bg-churnify-blue text-white px-2 py-0.5 rounded">BETA</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                to="/features"
                className="text-gray-600 hover:text-churnify-blue px-3 py-2 text-sm font-medium"
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="text-gray-600 hover:text-churnify-blue px-3 py-2 text-sm font-medium"
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="text-gray-600 hover:text-churnify-blue px-3 py-2 text-sm font-medium"
              >
                About
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-churnify-blue hover:bg-churnify-dark-blue">Sign Up</Button>
            </Link>
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
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-churnify-blue hover:bg-gray-50"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-churnify-blue hover:bg-gray-50"
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-churnify-blue hover:bg-gray-50"
            >
              About
            </Link>
            <div className="pt-4 flex flex-col space-y-3">
              <Link to="/login">
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="w-full bg-churnify-blue hover:bg-churnify-dark-blue">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
