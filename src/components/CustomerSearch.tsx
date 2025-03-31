
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CustomerData } from "@/utils/dataProcessing";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CustomerSearchProps {
  customers: CustomerData[];
  onSearch?: (results: CustomerData[]) => void;
  showButton?: boolean;
}

const CustomerSearch = ({ customers, onSearch, showButton = true }: CustomerSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerData[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    if (!value.trim()) {
      setSearchResults([]);
      if (onSearch) onSearch([]);
      return;
    }

    const results = customers.filter(customer => {
      const searchLower = value.toLowerCase();
      return (
        (customer.name && customer.name.toLowerCase().includes(searchLower)) ||
        (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
        (customer.customerId && customer.customerId.toString().includes(searchLower))
      );
    });

    setSearchResults(results);
    if (onSearch) onSearch(results);
  };

  const handleViewCustomer = (customer: CustomerData) => {
    navigate(`/customers/${customer.id || customer.customerId}`);
    setIsSearchVisible(false);
    setSearchResults([]);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            className="pl-8 h-9 text-sm bg-gray-50 border-gray-100"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsSearchVisible(true)}
          />
        </div>
        {showButton && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2"
            onClick={() => {
              if (searchResults.length === 1) {
                handleViewCustomer(searchResults[0]);
              }
            }}
          >
            Search
          </Button>
        )}
      </div>

      {isSearchVisible && searchResults.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {searchResults.map((customer) => (
              <li 
                key={customer.customerId} 
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                onClick={() => handleViewCustomer(customer)}
              >
                <div>
                  <p className="font-medium">{customer.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{customer.email || 'No email'}</p>
                </div>
                <span 
                  className={`px-2 py-1 rounded-full text-xs ${
                    customer.segment === 'high-risk' 
                      ? 'bg-red-100 text-red-800' 
                      : customer.segment === 'medium-risk' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                  }`}
                >
                  {customer.segment}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;
