import { useState, useEffect, useRef } from "react";
import { supabase, testSupabaseConnection } from "@/lib/supabase";
import { CustomerData } from "@/utils/dataProcessing";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EnhancedFileUploader from "@/components/EnhancedFileUploader";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import DashboardHero from "@/components/dashboard/DashboardHero";
import QuickActionsBar from "@/components/dashboard/QuickActionsBar";
import ChurnAnalyticsChart from "@/components/dashboard/ChurnAnalyticsChart";
import CustomerSegmentationChart from "@/components/dashboard/CustomerSegmentationChart";
import CustomerRiskTable from "@/components/dashboard/CustomerRiskTable";
import ActionInsightsSection from "@/components/dashboard/ActionInsightsSection";
import ChurnInsightsPanel from "@/components/dashboard/ChurnInsightsPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState("30");
  const [highRiskCustomers, setHighRiskCustomers] = useState<CustomerData[]>([]);
  const [allCustomers, setAllCustomers] = useState<CustomerData[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const metrics = useDashboardMetrics(timePeriod);
  const customerRiskTableRef = useRef<HTMLDivElement>(null);

  // Listen for upload completion and refresh data
  useEffect(() => {
    const handleDataUploaded = () => {
      console.log("📊 Data uploaded event received, refreshing Supabase dashboard...");
      setRefreshTrigger(prev => prev + 1);
      setShowUploadDialog(false);
    };

    window.addEventListener('dataUploaded', handleDataUploaded);
    return () => window.removeEventListener('dataUploaded', handleDataUploaded);
  }, []);

  // Refresh dashboard periodically
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🔄 Periodic Supabase dashboard refresh...");
      setRefreshTrigger(prev => prev + 1);
    }, 30000); // Check for updates every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setConnectionError(null);
    
    try {
      console.log("🔄 Retrying Supabase connection...");
      const isConnected = await testSupabaseConnection();
      if (isConnected) {
        console.log("✅ Connection retry successful, refreshing data...");
        setRefreshTrigger(prev => prev + 1);
      } else {
        setConnectionError("Unable to establish connection to Supabase. Please check your project status and configuration.");
      }
    } catch (error) {
      console.error("❌ Retry connection failed:", error);
      setConnectionError(error instanceof Error ? error.message : "Connection test failed");
    } finally {
      setIsRetrying(false);
    }
  };
  
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);
        setConnectionError(null);
        console.log("📊 Fetching customers from Supabase...");
        
        // Test connection first with timeout
        const connectionPromise = testSupabaseConnection();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Connection timeout after 10 seconds")), 10000)
        );
        
        const isConnected = await Promise.race([connectionPromise, timeoutPromise]) as boolean;
        
        if (!isConnected) {
          throw new Error("Unable to connect to Supabase. Please check your project status, internet connection, and configuration.");
        }
        
        // Fetch customers from Supabase with timeout
        const queryPromise = supabase
          .from('customers')
          .select('*')
          .order('risk_score', { ascending: false })
          .limit(100);
          
        const queryTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Query timeout after 15 seconds")), 15000)
        );
        
        const { data: customers, error } = await Promise.race([queryPromise, queryTimeoutPromise]) as any;

        if (error) {
          console.error('❌ Supabase query error:', error);
          throw new Error(`Supabase query failed: ${error.message}`);
        }
        
        console.log("✅ Supabase customers fetched:", customers?.length || 0);
        
        if (!customers || customers.length === 0) {
          console.log("ℹ️ No customers found in Supabase database");
          setHighRiskCustomers([]);
          setAllCustomers([]);
          setLoadingCustomers(false);
          return;
        }
        
        // Transform Supabase data to match our CustomerData interface
        const customerData: CustomerData[] = customers.map((customer: any) => ({
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
        
        setAllCustomers(customerData);
        
        const highRisk = customerData
          .filter(customer => customer.riskScore && customer.riskScore >= 70)
          .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
          .slice(0, 10);
        
        console.log("🚨 High risk customers found:", highRisk.length);
        setHighRiskCustomers(highRisk);
      } catch (err) {
        console.error("❌ Error fetching Supabase customers:", err);
        let errorMessage = "Unknown error occurred";
        
        if (err instanceof Error) {
          errorMessage = err.message;
          
          // Provide more helpful error messages
          if (err.message.includes("timeout")) {
            errorMessage = "Connection timeout. Please check your internet connection and try again.";
          } else if (err.message.includes("Failed to fetch")) {
            errorMessage = "Unable to connect to Supabase. Please verify your project is active and your network connection is stable.";
          }
        }
        
        setConnectionError(errorMessage);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, [refreshTrigger]);

  // Prepare segmentation data for the chart
  const segmentationData = [
    {
      name: "Low Risk",
      value: metrics.lowRiskCustomers,
      color: "#4ade80" // green
    },
    {
      name: "Medium Risk",
      value: metrics.mediumRiskCustomers,
      color: "#facc15" // yellow
    },
    {
      name: "High Risk",
      value: metrics.highRiskCustomers,
      color: "#f87171" // red
    }
  ];

  const handleUploadClick = () => {
    setShowUploadDialog(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4">
        {/* Top stats section */}
        <div className="mb-6 mt-4">
          <h1 className="text-2xl font-bold mb-6">Customer Retention Dashboard</h1>
          
          {/* Connection Error Alert */}
          {connectionError && (
            <Alert className="border-red-200 bg-red-50 mb-6">
              <WifiOff className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 flex items-center justify-between">
                <div>
                  <strong>Connection Error:</strong> {connectionError}
                  <br />
                  <span className="text-sm">
                    Please verify your Supabase project is active and check your internet connection.
                    <br />
                    If the issue persists, check your environment variables in the .env file.
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetryConnection}
                  disabled={isRetrying}
                  className="ml-4 border-red-300 text-red-700 hover:bg-red-100"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <Wifi className="h-3 w-3 mr-1" />
                      Retry
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {metrics.error && (
            <Alert className="border-amber-200 bg-amber-50 mb-6">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                {metrics.error}
              </AlertDescription>
            </Alert>
          )}
          
          <QuickActionsBar 
            onUploadClick={handleUploadClick} 
            onTimeRangeChange={setTimePeriod}
            timeRange={timePeriod}
          />
          
          <DashboardHero 
            metrics={metrics}
            timePeriod={timePeriod}
            loading={metrics.loading}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Charts section - 3 columns wide */}
          <div className="lg:col-span-3 space-y-6">
            <ChurnAnalyticsChart loading={metrics.loading} />
            <ActionInsightsSection />
          </div>
          
          {/* Side panel - 2 columns wide */}
          <div className="lg:col-span-2 space-y-6" ref={customerRiskTableRef}>
            <CustomerSegmentationChart 
              data={segmentationData} 
              loading={metrics.loading}
            />
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">High Risk Customers</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCustomers ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                ) : connectionError ? (
                  <div className="text-center py-8">
                    <WifiOff className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-600 text-lg font-medium">Connection Error</p>
                    <p className="text-sm text-gray-500 mt-1">Unable to load customer data</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRetryConnection}
                      disabled={isRetrying}
                      className="mt-3"
                    >
                      {isRetrying ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        <>
                          <Wifi className="h-3 w-3 mr-1" />
                          Retry Connection
                        </>
                      )}
                    </Button>
                  </div>
                ) : highRiskCustomers.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No high-risk customers found.</p>
                    <p className="text-sm text-gray-400 mt-1">Upload customer data to identify at-risk customers.</p>
                  </div>
                ) : (
                  <CustomerRiskTable customers={highRiskCustomers} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="mb-6">
          <ChurnInsightsPanel customers={allCustomers} timeframe={timePeriod} />
        </div>
      </div>
      
      {/* Compact Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Upload Customer Data to Supabase</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <EnhancedFileUploader />
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard;