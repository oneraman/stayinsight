
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Filter } from "lucide-react";
import CustomerRiskTable from "@/components/CustomerRiskTable";
import { customerData } from "@/data/dashboardData";

const CustomerRiskSection = () => {
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
      <CustomerRiskTable customers={customerData} />
    </Card>
  );
};

export default CustomerRiskSection;
