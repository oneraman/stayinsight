
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Filter } from "lucide-react";
import CustomerRiskTable from "@/components/dashboard/CustomerRiskTable";
import { customerData } from "@/data/dashboardData";
import { CustomerData } from "@/utils/dataProcessing";

const CustomerRiskSection = () => {
  // Transform the customer data to match the expected structure
  const formattedCustomers: CustomerData[] = customerData;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          Customers at Risk of Churning
        </h3>
        <Button variant="outline" size="sm">
          <Filter size={16} className="mr-2" />
          Filter
        </Button>
      </div>
      <CustomerRiskTable customers={formattedCustomers} />
    </Card>
  );
};

export default CustomerRiskSection;
