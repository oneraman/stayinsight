
import { User, Mail, Calendar } from "lucide-react";
import { CustomerData } from "@/utils/dataProcessing";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/customerUtils";

interface CustomerHeaderProps {
  customer: CustomerData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const CustomerHeader = ({ customer, activeTab, setActiveTab }: CustomerHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{customer.name || 'Customer'}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mt-1 space-y-1 sm:space-y-0 sm:space-x-4">
            {customer.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.customerId && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>ID: {customer.customerId}</span>
              </div>
            )}
            {customer.lastPurchaseDate && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Last Purchase: {formatDate(customer.lastPurchaseDate)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>Contact Customer</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default CustomerHeader;
