
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerData } from "@/utils/dataProcessing";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CustomerRiskTableProps {
  customers: CustomerData[];
  loading?: boolean;
}

const CustomerRiskTable = ({ customers, loading = false }: CustomerRiskTableProps) => {
  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return `$${value.toFixed(2)}`;
  };

  const getRiskBadge = (riskScore: number | undefined) => {
    if (!riskScore) return null;
    
    if (riskScore >= 70) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" /> High
      </Badge>;
    } else if (riskScore >= 30) {
      return <Badge variant="outline" className="flex items-center gap-1 border-amber-500 text-amber-700 bg-amber-50">
        <AlertCircle className="h-3 w-3" /> Medium
      </Badge>;
    } else {
      return <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-700 bg-green-50">
        <CheckCircle className="h-3 w-3" /> Low
      </Badge>;
    }
  };

  if (loading) {
    return (
      <div className="w-full border rounded-md">
        <div className="p-4 animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[250px]">Customer</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Last Purchase</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow 
              key={customer.customerId} 
              className={customer.riskScore && customer.riskScore >= 70 ? "bg-red-50" : ""}
            >
              <TableCell className="font-medium">
                {customer.name || customer.email || customer.customerId}
              </TableCell>
              <TableCell>
                {getRiskBadge(customer.riskScore)}
              </TableCell>
              <TableCell>{formatDate(customer.lastPurchaseDate)}</TableCell>
              <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0">
                  <Link to={`/customers/${customer.id}`}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerRiskTable;
