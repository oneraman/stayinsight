import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, ArrowUpDown, Eye, ChevronLeft, ChevronRight } from "lucide-react";

interface CustomerData {
  company: string;
  risk: "High" | "Medium" | "Low";
  lastPurchase: string;
  spent: string;
  segment?: "High Value" | "Mid Value" | "Low Value";
}

interface ModernCustomerTableProps {
  customers?: CustomerData[];
}

const defaultCustomers: CustomerData[] = [
  { company: "Acme Corp", risk: "High", lastPurchase: "2025-08-01", spent: "$12,300", segment: "High Value" },
  { company: "Beta LLC", risk: "Medium", lastPurchase: "2025-07-22", spent: "$3,200", segment: "Mid Value" },
  { company: "Gamma Inc", risk: "Low", lastPurchase: "2025-09-02", spent: "$980", segment: "Low Value" },
  { company: "Delta Solutions", risk: "High", lastPurchase: "2025-07-15", spent: "$8,750", segment: "High Value" },
  { company: "Echo Systems", risk: "Medium", lastPurchase: "2025-08-30", spent: "$2,100", segment: "Mid Value" },
  { company: "Foxtrot Industries", risk: "High", lastPurchase: "2025-06-20", spent: "$15,400", segment: "High Value" },
  { company: "Golf Enterprises", risk: "Low", lastPurchase: "2025-09-01", spent: "$1,450", segment: "Mid Value" },
  { company: "Hotel Group", risk: "Medium", lastPurchase: "2025-08-12", spent: "$5,300", segment: "High Value" },
];

const getRiskBadge = (risk: string) => {
  switch (risk) {
    case "High":
      return <Badge className="kpi-badge high-risk">High Risk</Badge>;
    case "Medium":
      return <Badge className="kpi-badge medium-risk">Medium Risk</Badge>;
    case "Low":
      return <Badge className="kpi-badge low-risk">Low Risk</Badge>;
    default:
      return <Badge variant="outline">{risk}</Badge>;
  }
};

const getRowHighlight = (risk: string) => {
  return risk === "High" ? "bg-red-50 dark:bg-red-950/20" : "";
};

const ModernCustomerTable = ({ customers = defaultCustomers }: ModernCustomerTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("company");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter and sort customers
  const filteredCustomers = customers
    .filter((customer) => {
      const matchesSearch = customer.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === "all" || customer.risk === riskFilter;
      const matchesSegment = segmentFilter === "all" || customer.segment === segmentFilter;
      return matchesSearch && matchesRisk && matchesSegment;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof CustomerData];
      let bValue: any = b[sortBy as keyof CustomerData];
      
      if (sortBy === "spent") {
        aValue = parseFloat(aValue.replace(/[\$,]/g, ""));
        bValue = parseFloat(bValue.replace(/[\$,]/g, ""));
      }
      
      if (sortBy === "lastPurchase") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <Card className="table-container">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-xl font-semibold">Customer Risk Analysis</CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-48"
              />
            </div>
            
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Value Segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="High Value">High Value</SelectItem>
                <SelectItem value="Mid Value">Mid Value</SelectItem>
                <SelectItem value="Low Value">Low Value</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("company")}
                    className="h-8 p-0 hover:bg-transparent"
                  >
                    Company
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("risk")}
                    className="h-8 p-0 hover:bg-transparent"
                  >
                    Risk Score
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("lastPurchase")}
                    className="h-8 p-0 hover:bg-transparent"
                  >
                    Last Purchase
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("spent")}
                    className="h-8 p-0 hover:bg-transparent"
                  >
                    Total Spent
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.map((customer, index) => (
                <TableRow key={index} className={getRowHighlight(customer.risk)}>
                  <TableCell className="font-medium">{customer.company}</TableCell>
                  <TableCell>{getRiskBadge(customer.risk)}</TableCell>
                  <TableCell>{new Date(customer.lastPurchase).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{customer.spent}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernCustomerTable;