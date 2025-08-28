import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CustomerData } from "@/utils/dataProcessing";
import { formatCurrency, formatDate } from "@/utils/customerUtils";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Download } from "lucide-react";
import CustomerSearch from "@/components/CustomerSearch";
import ExportDialog from "@/components/data-export/ExportDialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Customers = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomersCount, setTotalCustomersCount] = useState(0);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const itemsPerPage = 20;
  const navigate = useNavigate();

  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!currentUser) {
        setLoading(false);
        setError("Please log in to view your customer data");
        return;
      }

      try {
        setLoading(true);
        console.log("📊 Fetching customers from Supabase for user:", currentUser.id);
        
        // Get total count for pagination
        const { count, error: countError } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUser.id);
        
        if (countError) {
          throw new Error(`Failed to get customer count: ${countError.message}`);
        }
        
        setTotalCustomersCount(count || 0);
        
        // Fetch customers for current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = currentPage * itemsPerPage - 1;
        
        const { data: supabaseCustomers, error } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('risk_score', { ascending: false })
          .range(startIndex, endIndex);
        
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
          usageFrequency: customer.usage_frequency,
          supportCalls: customer.support_calls,
          paymentDelay: customer.payment_delay,
          subscriptionType: customer.subscription_type,
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
  }, [currentPage, currentUser]);

  // Fetch all customers for export (not just current page)
  const fetchAllCustomers = async (): Promise<CustomerData[]> => {
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    try {
      console.log("📊 Fetching all customers for export for user:", currentUser.id);
      
      const { data: supabaseCustomers, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('risk_score', { ascending: false });
      
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
        usageFrequency: customer.usage_frequency,
        supportCalls: customer.support_calls,
        paymentDelay: customer.payment_delay,
        subscriptionType: customer.subscription_type,
        createdAt: customer.created_at ? new Date(customer.created_at) : undefined,
        updatedAt: customer.updated_at ? new Date(customer.updated_at) : undefined
      }));
      
      console.log("✅ All customers loaded for export:", customerData.length);
      return customerData;
    } catch (err: any) {
      console.error("❌ Error fetching all customers:", err);
      throw err;
    }
  };

  const handleSearchResults = (results: CustomerData[]) => {
    setFilteredCustomers(results.length > 0 ? results : customers);
  };

  const handleRowClick = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  const handleExportClick = async () => {
    setShowExportDialog(true);
  };

  const totalPages = Math.ceil(totalCustomersCount / itemsPerPage);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePreviousPage = () => {
    if (canGoPrevious) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (canGoNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Customer Data</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="w-full sm:w-80">
              <CustomerSearch customers={customers} onSearch={handleSearchResults} />
            </div>
            <Button 
              onClick={handleExportClick}
              className="gap-2 whitespace-nowrap"
              disabled={customers.length === 0}
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Customer Records from Supabase Database</span>
              <span className="text-sm font-normal text-gray-500">
                {totalCustomersCount.toLocaleString()} total customers
              </span>
            </CardTitle>
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
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">Customer ID</TableHead>
                        <TableHead className="font-semibold text-gray-700">Name</TableHead>
                        <TableHead className="font-semibold text-gray-700">Email</TableHead>
                        <TableHead className="font-semibold text-gray-700">Last Purchase</TableHead>
                        <TableHead className="font-semibold text-gray-700">Purchase Count</TableHead>
                        <TableHead className="font-semibold text-gray-700">Total Spent</TableHead>
                        <TableHead className="font-semibold text-gray-700">Risk Score</TableHead>
                        <TableHead className="font-semibold text-gray-700">Segment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer, index) => {
                        const isHighRisk = customer.segment === 'high-risk';
                        const isMediumRisk = customer.segment === 'medium-risk';
                        
                        return (
                          <TableRow 
                            key={customer.id}
                            className={`
                              cursor-pointer border-b border-gray-100 transition-colors duration-200
                              ${isHighRisk 
                                  ? 'bg-red-50 hover:bg-red-100 text-red-900' 
                                  : isMediumRisk 
                                    ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-900' 
                                    : 'bg-white hover:bg-gray-50 text-gray-900'}
                            `}
                            onClick={() => handleRowClick(customer.id || customer.customerId)}
                          >
                            <TableCell className="font-medium py-4">{customer.customerId}</TableCell>
                            <TableCell className="py-4">{customer.name || 'N/A'}</TableCell>
                            <TableCell className="py-4">{customer.email || 'N/A'}</TableCell>
                            <TableCell className="py-4">{formatDate(customer.lastPurchaseDate)}</TableCell>
                            <TableCell className="py-4">{customer.purchaseCount || 'N/A'}</TableCell>
                            <TableCell className="py-4 font-medium">{formatCurrency(customer.totalSpent)}</TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center">
                                <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden mr-2">
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
                                <span className="font-medium">{customer.riskScore}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <span 
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  customer.segment === 'high-risk' 
                                    ? 'bg-red-100 text-red-800 border border-red-200' 
                                    : customer.segment === 'medium-risk' 
                                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                                      : 'bg-green-100 text-green-800 border border-green-200'
                                }`}
                              >
                                {customer.segment}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Showing page {currentPage} of {totalPages} 
                      ({((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCustomersCount)} of {totalCustomersCount.toLocaleString()} customers)
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={!canGoPrevious}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600 px-3">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!canGoNext}
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Export Dialog */}
        <ExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          customers={customers.length > 0 ? customers : []}
        />
      </div>
    </DashboardLayout>
  );
};

export default Customers;