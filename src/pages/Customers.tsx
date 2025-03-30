
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { CustomerData } from "@/utils/dataProcessing";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

const Customers = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const customersQuery = query(
          collection(firestore, "customers"),
          orderBy("riskScore", "desc"),
          limit(50)
        );
        
        const snapshot = await getDocs(customersQuery);
        const customerData = snapshot.docs.map(doc => {
          const data = doc.data() as CustomerData;
          // Convert timestamps to dates
          if (data.lastPurchaseDate && typeof data.lastPurchaseDate === 'object' && 'toDate' in data.lastPurchaseDate) {
            data.lastPurchaseDate = data.lastPurchaseDate.toDate();
          }
          return {
            ...data,
            id: doc.id
          };
        });
        
        setCustomers(customerData);
      } catch (err: any) {
        console.error("Error fetching customers:", err);
        setError(err.message || "Failed to load customer data");
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

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Customer Data</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Processed Customer Data</CardTitle>
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
            ) : customers.length === 0 ? (
              <div className="text-center p-4">
                No customer data found. Upload a file to get started.
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
                    {customers.map((customer) => (
                      <TableRow 
                        key={customer.customerId}
                        className={
                          customer.segment === 'high-risk' 
                            ? 'bg-red-50' 
                            : customer.segment === 'medium-risk' 
                              ? 'bg-yellow-50' 
                              : ''
                        }
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
