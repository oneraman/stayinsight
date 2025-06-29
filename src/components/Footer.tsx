import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-wider uppercase mb-6">Product</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/features" className="text-base text-slate-600 hover:text-indigo-600 transition-colors duration-300">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-base text-slate-600 hover:text-indigo-600 transition-colors duration-300">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="text-base text-slate-600 hover:text-indigo-600 transition-colors duration-300">
                  Integrations
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-wider uppercase mb-6">Resources</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/blog" className="text-base text-slate-600 hover:text-indigo-600 transition-colors duration-300">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-base text-slate-600 hover:text-indigo-600 transition-colors duration-300">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-base text-slate-600 hover:text-indigo-600 transition-colors duration-300">
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-wider uppercase mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-base text-slate-600 hover:text-indigo-600 transition-colors duration-300">
                  About
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-base text-slate-600 hover:text-indigo-600 transition-colors duration-300">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base text-slate-600 hover:text-indigo-600 transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-wider uppercase mb-6">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/privacy" className="text-base text-slate-600 hover:text-indigo-600 transition-colors duration-300">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-slate-600 hover:text-indigo-600 transition-colors duration-300">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-base text-slate-500">
              &copy; {new Date().getFullYear()} StayInsightAI. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                stayInsightAI
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;