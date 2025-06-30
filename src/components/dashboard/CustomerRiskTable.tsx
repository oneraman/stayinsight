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
    <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
            <TableHead className="w-[250px] font-semibold text-gray-700">Customer</TableHead>
            <TableHead className="font-semibold text-gray-700">Risk Level</TableHead>
            <TableHead className="font-semibold text-gray-700">Last Purchase</TableHead>
            <TableHead className="font-semibold text-gray-700">Total Spent</TableHead>
            <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer, index) => {
            const isHighRisk = customer.riskScore && customer.riskScore >= 70;
            const isMediumRisk = customer.riskScore && customer.riskScore >= 30 && customer.riskScore < 70;
            
            return (
              <TableRow 
                key={customer.customerId} 
                className={`
                  border-b border-gray-100 transition-colors duration-200
                  ${isHighRisk 
                    ? 'bg-red-50 hover:bg-red-100' 
                    : isMediumRisk 
                      ? 'bg-yellow-50 hover:bg-yellow-100'
                      : 'bg-white hover:bg-gray-50'
                  }
                  ${index % 2 === 0 ? '' : isHighRisk ? 'bg-red-25' : isMediumRisk ? 'bg-yellow-25' : 'bg-gray-25'}
                `}
              >
                <TableCell className="font-medium text-gray-900 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {customer.name || customer.email || customer.customerId}
                    </span>
                    {customer.email && customer.name && (
                      <span className="text-sm text-gray-500">{customer.email}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {getRiskBadge(customer.riskScore, customer.segment)}
                </TableCell>
                <TableCell className="text-gray-700 py-4">
                  {formatDate(customer.lastPurchaseDate)}
                </TableCell>
                <TableCell className="text-gray-700 py-4 font-medium">
                  {formatCurrency(customer.totalSpent)}
                </TableCell>
                <TableCell className="text-right py-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild 
                    className="h-8 w-8 p-0 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                  >
                    <Link to={`/customers/${customer.id}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerRiskTable;