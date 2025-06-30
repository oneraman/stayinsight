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
    if (value === undefined || value === null) return "N/A";
    return `$${value.toFixed(2)}`;
  };

  const getRiskBadge = (riskScore: number | undefined, segment?: string) => {
    // Use segment if available, otherwise calculate from risk score
    let riskLevel = segment;
    
    if (!riskLevel && riskScore !== undefined) {
      if (riskScore >= 70) {
        riskLevel = 'high-risk';
      } else if (riskScore >= 30) {
        riskLevel = 'medium-risk';
      } else {
        riskLevel = 'low-risk';
      }
    }
    
    // Default to medium-risk if we can't determine
    if (!riskLevel) {
      riskLevel = 'medium-risk';
    }
    
    switch (riskLevel) {
      case 'high-risk':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            High
          </Badge>
        );
      case 'medium-risk':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Medium
          </Badge>
        );
      case 'low-risk':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Low
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        );
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
                {getRiskBadge(customer.riskScore, customer.segment)}
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