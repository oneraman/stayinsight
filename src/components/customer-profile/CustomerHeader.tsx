
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, User } from "lucide-react";
import { CustomerData } from "@/utils/dataProcessing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CustomerHeaderProps {
  customer: CustomerData;
  formatDate: (date: Date | undefined) => string;
}

const CustomerHeader = ({ customer, formatDate }: CustomerHeaderProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{customer.name || 'Unnamed Customer'}</h2>
              <div className="flex items-center gap-2 mt-1">
                {customer.email && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="h-4 w-4 mr-1" />
                    {customer.email}
                  </div>
                )}
              </div>
              <div className="mt-2">
                <Badge 
                  className={`${
                    customer.segment === 'high-risk' 
                      ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                      : customer.segment === 'medium-risk' 
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {customer.segment} customer
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
            <div className="text-sm text-gray-500">Customer ID</div>
            <div className="font-mono">{customer.customerId}</div>
            {customer.lastPurchaseDate && (
              <div className="mt-2 text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" /> Last purchase: {formatDate(customer.lastPurchaseDate)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerHeader;
