
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  risk: "low" | "medium" | "high";
  score: number;
  subscriptionValue: number;
}

interface CustomerRiskTableProps {
  customers?: Customer[];
}

const CustomerRiskTable = ({ customers = [] }: CustomerRiskTableProps) => {
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "high":
        return <Badge className="bg-churnify-red hover:bg-red-600">High</Badge>;
      case "medium":
        return <Badge className="bg-churnify-amber hover:bg-amber-600">Medium</Badge>;
      case "low":
        return <Badge className="bg-churnify-green hover:bg-green-600">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Risk Score</TableHead>
            <TableHead className="text-right">Subscription Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.company}</TableCell>
                <TableCell>{getRiskBadge(customer.risk)}</TableCell>
                <TableCell>{customer.score}%</TableCell>
                <TableCell className="text-right">${customer.subscriptionValue.toLocaleString()}</TableCell>
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
