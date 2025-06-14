
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CustomerData } from "@/utils/dataProcessing";

interface CustomerRiskTableProps {
  customers?: CustomerData[];
}

const CustomerRiskTable = ({ customers = [] }: CustomerRiskTableProps) => {
  const getRiskBadge = (riskScore: number | undefined) => {
    if (!riskScore) return null;
    
    if (riskScore >= 70) {
      return <Badge className="bg-red-500 hover:bg-red-600">High</Badge>;
    } else if (riskScore >= 30) {
      return <Badge className="bg-amber-500 hover:bg-amber-600">Medium</Badge>;
    } else {
      return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>;
    }
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Risk Score</TableHead>
            <TableHead className="text-right">Spent Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{getRiskBadge(customer.riskScore)}</TableCell>
                <TableCell>{customer.riskScore}%</TableCell>
                <TableCell className="text-right">${customer.totalSpent?.toLocaleString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">No customers found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerRiskTable;
