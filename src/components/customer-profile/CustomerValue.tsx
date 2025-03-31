
import { DollarSign } from "lucide-react";
import { CustomerData } from "@/utils/dataProcessing";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CustomerValueProps {
  customer: CustomerData;
  formatCurrency: (value: number | undefined) => string;
}

const CustomerValue = ({ customer, formatCurrency }: CustomerValueProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Customer Value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Total Spent</div>
            <div className="text-2xl font-bold">{formatCurrency(customer.totalSpent)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Purchase Count</div>
            <div className="text-2xl font-bold">{customer.purchaseCount || 0}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Avg Order Value</div>
            <div className="text-2xl font-bold">{formatCurrency(customer.avgOrderValue)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Customer Since</div>
            <div className="text-lg font-medium">Unknown</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerValue;
