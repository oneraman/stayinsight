import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import ModernDashboardHeader from "@/components/dashboard/ModernDashboardHeader";
import ModernKPICards from "@/components/dashboard/ModernKPICards";
import ModernChartsGrid from "@/components/dashboard/ModernChartsGrid";
import ModernAIInsights from "@/components/dashboard/ModernAIInsights";
import ModernCustomerTable from "@/components/dashboard/ModernCustomerTable";
import { EnhancedFileUploader } from "@/components/EnhancedFileUploader";
import ExportDialog from "@/components/data-export/ExportDialog";
import { Upload, BarChart4, Loader2, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CustomerData } from "@/utils/dataProcessing";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [timePeriod, setTimePeriod] = useState("30");
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check Supabase configuration on mount
  useEffect(() => {
    const checkSupabaseConfig = async () => {
      try {
        const { data, error } = await supabase.from('customers').select('count').limit(1);
        
        if (error) {
          if (error.message.includes('relation "customer_data" does not exist')) {
            setConfigError("Database tables not found. Please ensure the database is properly set up.");
          } else if (error.message.includes('Invalid API key')) {
            setConfigError("Invalid Supabase credentials. Please check your configuration.");
          } else {
            setConfigError(`Database error: ${error.message}`);
          }
          setConnectionStatus('error');
        } else {
          setConfigError(null);
          setConnectionStatus('connected');
        }
      } catch (error) {
        console.error('Supabase config check failed:', error);
        setConfigError("Failed to connect to database. Please check your configuration.");
        setConnectionStatus('error');
      }
    };

    checkSupabaseConfig();
  }, []);

  // Listen for upload events to refresh data
  useEffect(() => {
    const handleDataUploaded = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('dataUploaded', handleDataUploaded);
    return () => window.removeEventListener('dataUploaded', handleDataUploaded);
  }, []);

  // Function to retry connection
  const handleRetryConnection = async () => {
    setConnectionStatus('checking');
    setConnectionError(null);
    
    try {
      const { data, error } = await supabase.from('customers').select('count').limit(1);
      
      if (error) {
        setConnectionError(`Database connection failed: ${error.message}`);
        setConnectionStatus('error');
      } else {
        setConnectionError(null);
        setConnectionStatus('connected');
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Connection retry failed:', error);
      setConnectionError("Network error. Please check your internet connection.");
      setConnectionStatus('error');
    }
  };

  const handleRefreshData = async () => {
    if (!currentUser) return;
    
    setIsRefreshing(true);
    try {
      await supabase
        .from('customers')
        .delete()
        .eq('user_id', currentUser.id);
      
      setAllCustomers([]);
      toast.success("Dashboard data cleared successfully");
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error("Failed to clear data");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch customer data
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!currentUser || connectionStatus !== 'connected') return;
      
      setLoadingCustomers(true);
      setConnectionError(null);
      
      try {
        const { data } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', currentUser.id);
        
        if (data && data.length > 0) {
          // Transform database data to match ModernCustomerTable interface
          const transformedData = data.map(customer => ({
            company: customer.name || 'Unknown Company',
            risk: (customer.risk_score || 0) > 0.7 ? 'High' : (customer.risk_score || 0) > 0.4 ? 'Medium' : 'Low' as const,
            lastPurchase: customer.last_purchase_date || new Date().toISOString().split('T')[0],
            spent: `$${(customer.total_spent || 0).toLocaleString()}`,
            segment: (customer.total_spent || 0) > 10000 ? 'High Value' : (customer.total_spent || 0) > 5000 ? 'Mid Value' : 'Low Value' as const
          }));
          setAllCustomers(transformedData);
        } else {
          setAllCustomers([]);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
        if (error instanceof Error) {
          if (error.message.includes('network') || error.message.includes('fetch')) {
            setConnectionError("Network error. Please check your internet connection.");
          } else {
            setConnectionError(`Failed to load customer data: ${error.message}`);
          }
        } else {
          setConnectionError("An unexpected error occurred while loading data.");
        }
        setAllCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomerData();
  }, [currentUser, refreshTrigger, connectionStatus]);

  // Calculate basic metrics
  const totalCustomers = allCustomers.length;
  const highRiskCount = allCustomers.filter(c => c.riskScore > 0.7).length;
  const churnRate = totalCustomers > 0 ? (highRiskCount / totalCustomers) * 100 : 0;

  // Filter high-risk customers
  const highRiskCustomers = allCustomers
    .filter(customer => customer.riskScore > 0.7)
    .slice(0, 10);

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
    <>
      <ModernDashboardHeader 
        onUpload={handleUploadClick}
        onRefresh={() => {
          // Show alert dialog instead of direct refresh
          const confirmRefresh = () => {
            handleRefreshData();
          };
          // For now, just refresh directly - you can add the alert dialog later
          handleRefreshData();
        }}
        onExport={handleExportClick}
        isRefreshing={isRefreshing}
        hasData={allCustomers.length > 0}
      />

      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Configuration Error Alert */}
          {configError && (
            <Alert className="border-red-200 bg-red-50 mb-6">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Configuration Error:</strong> {configError}
                <br />
                <small>Please check your Supabase configuration and ensure all required tables exist.</small>
              </AlertDescription>
            </Alert>
          )}

          {/* Connection Error Alert */}
          {connectionError && (
            <Alert className="border-orange-200 bg-orange-50 mb-6">
              <WifiOff className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 flex items-center justify-between">
                <span>{connectionError}</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRetryConnection}
                  disabled={connectionStatus === 'checking'}
                  className="ml-2"
                >
                  {connectionStatus === 'checking' ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Checking...
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

          {/* Main Content */}
          <div className="space-y-8">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-5 w-40" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                  </Card>
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
            ) : allCustomers.length === 0 && !connectionError && !configError ? (
              renderEmptyState()
            ) : (
              <>
                {/* KPI Cards */}
                <ModernKPICards />

                {/* Charts Grid */}
                <ModernChartsGrid />

                {/* AI Insights */}
                <ModernAIInsights />

                {/* Customer Table */}
                <ModernCustomerTable customers={allCustomers} />
              </>
            )}
          </div>
        </div>
      </DashboardLayout>

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
    </>
  );
};

export default Dashboard;