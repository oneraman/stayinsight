
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerData } from "@/utils/dataProcessing";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface HighRiskCustomersTableProps {
  customers: CustomerData[];
}

const HighRiskCustomersTable = ({ customers }: HighRiskCustomersTableProps) => {
  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Risk Score</TableHead>
            <TableHead>Last Purchase</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.customerId} className="bg-red-50">
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  <span>{customer.name || customer.email || customer.customerId}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div 
                    className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden mr-2"
                  >
                    <div 
                      className={`h-full ${
                        customer.riskScore && customer.riskScore > 70 
                          ? 'bg-red-500' 
                          : customer.riskScore && customer.riskScore > 30 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${customer.riskScore || 0}%` }}
                    ></div>
                  </div>
                  <span>{customer.riskScore}%</span>
                </div>
              </TableCell>
              <TableCell>{formatDate(customer.lastPurchaseDate)}</TableCell>
              <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/customers">View Details</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HighRiskCustomersTable;
