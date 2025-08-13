import { useState, useEffect } from "react";
import { supabase, testSupabaseConnection, validateSupabaseConfig } from "@/lib/supabase";
import { CustomerData } from "@/utils/dataProcessing";
import { Loader2, RefreshCw, Download, BarChart4, Wifi, WifiOff, Settings, Upload, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import EnhancedFileUploader from "@/components/EnhancedFileUploader";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardHero from "@/components/dashboard/DashboardHero";
import QuickActionsBar from "@/components/dashboard/QuickActionsBar";
import HighRiskCustomersTable from "@/components/dashboard/HighRiskCustomersTable";
import AnalyticsSection from "@/components/dashboard/AnalyticsSection";
import AdvancedInsightsPanel from "@/components/dashboard/AdvancedInsightsPanel";
import ExportDialog from "@/components/data-export/ExportDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState("30");
  const [highRiskCustomers, setHighRiskCustomers] = useState<CustomerData[]>([]);
  const [allCustomers, setAllCustomers] = useState<CustomerData[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const metrics = useDashboardMetrics(timePeriod);
  const { currentUser } = useAuth();

  // Validate configuration on component mount
  useEffect(() => {
    const config = validateSupabaseConfig();
    if (!config.isValid) {
      setConfigError(`Configuration issues: ${config.issues.join(', ')}`);
      console.error('❌ Supabase configuration validation failed:', config.issues);
    } else {
      setConfigError(null);
      console.log('✅ Supabase configuration validation passed');
    }
  }, []);

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

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setConnectionError(null);
    try {
      console.log("🔄 Retrying Supabase connection...");
      const config = validateSupabaseConfig();
      if (!config.isValid) {
        throw new Error(`Configuration error: ${config.issues.join(', ')}`);
      }
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

  const handleRefreshData = async () => {
    if (!currentUser) {
      toast.error("Please log in to refresh data");
      return;
    }

    setIsRefreshing(true);
    try {
      console.log("🗑️ Starting data refresh - clearing all customer data and upload sessions...");
      const { error: customersError } = await supabase
        .from('customers')
        .delete()
        .eq('user_id', currentUser.id);
      if (customersError) {
        throw new Error(`Failed to clear customer data: ${customersError.message}`);
      }

      const { error: sessionsError } = await supabase
        .from('upload_sessions')
        .delete()
        .eq('user_id', currentUser.id);
      if (sessionsError) {
        console.warn("Warning: Failed to clear upload sessions:", sessionsError.message);
      }

      console.log("✅ Data refresh completed successfully");
      setHighRiskCustomers([]);
      setAllCustomers([]);
      setRefreshTrigger(prev => prev + 1);
      toast.success("Dashboard refreshed! All data cleared. You can now upload new files.");
    } catch (error) {
      console.error("❌ Error refreshing data:", error);
      toast.error(error instanceof Error ? error.message : "Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      if (configError) {
        setLoadingCustomers(false);
        setConnectionError(configError);
        return;
      }
      try {
        setLoadingCustomers(true);
        setConnectionError(null);
        console.log("📊 Fetching customers from Supabase...");
        console.log("🔄 Testing Supabase connection before fetching data...");
        const isConnected = await testSupabaseConnection();
        if (!isConnected) {
          throw new Error("Unable to connect to Supabase. Please check your project status, internet connection, and configuration.");
        }
        const { data: customers, error } = await supabase
          .from('customers')
          .select('*')
          .order('risk_score', { ascending: false })
          .limit(100);
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
          usageFrequency: customer.usage_frequency,
          supportCalls: customer.support_calls,
          paymentDelay: customer.payment_delay,
          subscriptionType: customer.subscription_type,
          createdAt: customer.created_at ? new Date(customer.created_at) : undefined,
          updatedAt: customer.updated_at ? new Date(customer.updated_at) : undefined,
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
          if (err.message.includes("timeout")) {
            errorMessage = "Connection timeout. Please check your internet connection and try again.";
          } else if (err.message.includes("Failed to fetch")) {
            errorMessage = "Unable to connect to Supabase. Please verify your project is active and your network connection is stable.";
          } else if (err.message.includes("Configuration error")) {
            errorMessage = err.message + ". Please check your .env file.";
          }
        }
        setConnectionError(errorMessage);
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, [refreshTrigger, configError]);

  const handleUploadClick = () => setShowUploadDialog(true);
  const handleExportClick = () => setShowExportDialog(true);

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <BarChart4 className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Customer Data Available</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Upload your customer data to see insights, analytics, and AI-powered recommendations.
      </p>
      <Button onClick={handleUploadClick} className="gap-2">
        <Upload className="h-4 w-4" />
        Upload Customer Data
      </Button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4">
        {/* Top stats section */}
        <div className="mb-6 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold">Customer Retention Dashboard</h1>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleExportClick}
                disabled={allCustomers.length === 0}
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    disabled={isRefreshing || !currentUser}
                  >
                    {isRefreshing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Refresh Dashboard
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Refresh Dashboard</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your current customer data and upload history. 
                      You'll be able to upload new files and get fresh insights.
                      <br /><br />
                      <strong>This action cannot be undone.</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleRefreshData}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Clear All Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Configuration Error Alert */}
          {configError && (
            <Alert className="border-red-200 bg-red-50 mb-6">
              <Settings className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div>
                  <strong>Configuration Error:</strong> {configError}
                  <br />
                  <span className="text-sm">
                    Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correctly set.
                    <br />
                    You can find these values in your Supabase project settings under API.
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Connection Error Alert */}
          {connectionError && !configError && (
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

          {/* Main Content */}
          <div className="mt-6">
            {loadingCustomers ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-24" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3">
                    <Card>
                      <CardHeader>
                        <Skeleton className="h-5 w-40" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                      </CardContent>
                    </Card>
                  </div>
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <Skeleton className="h-5 w-40" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : allCustomers.length === 0 && !connectionError && !configError ? (
              renderEmptyState()
            ) : (
              <>
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

                {/* Analytics Charts Section */}
                <AnalyticsSection 
                  customers={allCustomers}
                  timePeriod={timePeriod}
                />

                {/* AI Insights Panel */}
                <AdvancedInsightsPanel 
                  customers={allCustomers}
                  timePeriod={timePeriod}
                />

                {/* High-Risk Customers Section */}
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top High-Risk Customers</CardTitle>
                      <CardDescription>Highest risk customers based on your data</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {highRiskCustomers.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No high-risk customers found.</div>
                      ) : (
                        <HighRiskCustomersTable customers={highRiskCustomers} />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Compact Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Upload Customer Data</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <EnhancedFileUploader />
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        customers={allCustomers}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
