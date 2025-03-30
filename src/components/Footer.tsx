
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/features" className="text-base text-gray-500 hover:text-[#5E5AFF]">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-base text-gray-500 hover:text-[#5E5AFF]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="text-base text-gray-500 hover:text-[#5E5AFF]">
                  Integrations
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/blog" className="text-base text-gray-500 hover:text-[#5E5AFF]">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-base text-gray-500 hover:text-[#5E5AFF]">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-base text-gray-500 hover:text-[#5E5AFF]">
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" className="text-base text-gray-500 hover:text-[#5E5AFF]">
                  About
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-base text-gray-500 hover:text-[#5E5AFF]">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base text-gray-500 hover:text-[#5E5AFF]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/privacy" className="text-base text-gray-500 hover:text-[#5E5AFF]">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-gray-500 hover:text-[#5E5AFF]">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} StayInsights. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
