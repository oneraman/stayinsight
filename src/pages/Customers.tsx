import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CustomerData } from "@/utils/dataProcessing";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import CustomerSearch from "@/components/CustomerSearch";
import { useNavigate } from "react-router-dom";

const Customers = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        console.log("📊 Fetching customers from Supabase...");
        
        const { data: supabaseCustomers, error } = await supabase
          .from('customers')
          .select('*')
          .order('risk_score', { ascending: false })
          .limit(50);
        
        if (error) {
          throw new Error(`Supabase query failed: ${error.message}`);
        }

        // Transform Supabase data to match our CustomerData interface
        const customerData: CustomerData[] = (supabaseCustomers || []).map(customer => ({
          id: customer.id,
          customerId: customer.customer_id,
          email: customer.email,
          name: customer.name,
          lastPurchaseDate: customer.last_purchase_date ? new Date(customer.last_purchase_date) : undefined,
          purchaseCount: customer.purchase_count,
          totalSpent: customer.total_spent,
          avgOrderValue: customer.avg_order_value,
          riskScore: customer.risk_score,
          segment: customer.segment as 'low-risk' | 'medium-risk' | 'high-risk',
          age: customer.age,
          gender: customer.gender,
          tenure: customer.tenure,
          createdAt: customer.created_at ? new Date(customer.created_at) : undefined,
          updatedAt: customer.updated_at ? new Date(customer.updated_at) : undefined
        }));
        
        console.log("✅ Supabase customers loaded:", customerData.length);
        setCustomers(customerData);
        setFilteredCustomers(customerData);
      } catch (err: any) {
        console.error("❌ Error fetching Supabase customers:", err);
        setError(err.message || "Failed to load customer data from Supabase");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return `$${value.toFixed(2)}`;
  };

  const handleSearchResults = (results: CustomerData[]) => {
    setFilteredCustomers(results.length > 0 ? results : customers);
  };

  const handleRowClick = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Customer Data (Supabase)</h1>
          <div className="w-full md:w-80">
            <CustomerSearch customers={customers} onSearch={handleSearchResults} />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Customer Records from Supabase Database</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-4">
                {error}
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center p-4">
                No customer data found in Supabase. Upload a file to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Last Purchase</TableHead>
                      <TableHead>Purchase Count</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Segment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow 
                        key={customer.id}
                        className={`
                          cursor-pointer
                          ${customer.segment === 'high-risk' 
                              ? 'bg-red-50' 
                              : customer.segment === 'medium-risk' 
                                ? 'bg-yellow-50' 
                                : ''}
                        `}
                        onClick={() => handleRowClick(customer.id || customer.customerId)}
                      >
                        <TableCell>{customer.customerId}</TableCell>
                        <TableCell>{customer.name || 'N/A'}</TableCell>
                        <TableCell>{customer.email || 'N/A'}</TableCell>
                        <TableCell>{formatDate(customer.lastPurchaseDate)}</TableCell>
                        <TableCell>{customer.purchaseCount || 'N/A'}</TableCell>
                        <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div 
                              className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mr-2"
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
                            <span>{customer.riskScore}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs ${
                              customer.segment === 'high-risk' 
                                ? 'bg-red-100 text-red-800' 
                                : customer.segment === 'medium-risk' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {customer.segment}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Customers;