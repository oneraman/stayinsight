import { useState, useEffect, useRef } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { CustomerData } from "@/utils/dataProcessing";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EnhancedFileUploader from "@/components/EnhancedFileUploader";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import DashboardHero from "@/components/dashboard/DashboardHero";
import QuickActionsBar from "@/components/dashboard/QuickActionsBar";
import ChurnAnalyticsChart from "@/components/dashboard/ChurnAnalyticsChart";
import CustomerSegmentationChart from "@/components/dashboard/CustomerSegmentationChart";
import CustomerRiskTable from "@/components/dashboard/CustomerRiskTable";
import ActionInsightsSection from "@/components/dashboard/ActionInsightsSection";
import ChurnInsightsPanel from "@/components/dashboard/ChurnInsightsPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState("30");
  const [highRiskCustomers, setHighRiskCustomers] = useState<CustomerData[]>([]);
  const [allCustomers, setAllCustomers] = useState<CustomerData[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  const metrics = useDashboardMetrics(timePeriod);
  const customerRiskTableRef = useRef<HTMLDivElement>(null);

  // Listen for upload completion and refresh data
  useEffect(() => {
    const handleDataUploaded = () => {
      console.log("Data uploaded event received, refreshing dashboard...");
      setRefreshTrigger(prev => prev + 1);
      setShowUploadDialog(false);
    };

    window.addEventListener('dataUploaded', handleDataUploaded);
    return () => window.removeEventListener('dataUploaded', handleDataUploaded);
  }, []);

  // Refresh dashboard periodically
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Periodic dashboard refresh...");
      setRefreshTrigger(prev => prev + 1);
    }, 30000); // Check for updates every 30 seconds

    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);
        console.log("Fetching customers with enhanced logging...");
        
        const customersQuery = query(
          collection(firestore, "customers"),
          limit(100)
        );
        
        const snapshot = await getDocs(customersQuery);
        console.log("Enhanced customers fetched:", snapshot.docs.length);
        
        if (snapshot.docs.length === 0) {
          console.log("No customers found in database");
          setHighRiskCustomers([]);
          setAllCustomers([]);
          setLoadingCustomers(false);
          return;
        }
        
        const customerData = snapshot.docs.map(doc => {
          const data = doc.data() as CustomerData;
          
          if (data.lastPurchaseDate && 
              typeof data.lastPurchaseDate === 'object' && 
              'toDate' in data.lastPurchaseDate && 
              typeof data.lastPurchaseDate.toDate === 'function') {
            data.lastPurchaseDate = data.lastPurchaseDate.toDate();
          }
          return {
            ...data,
            id: doc.id
          };
        });
        
        setAllCustomers(customerData);
        
        const highRisk = customerData
          .filter(customer => customer.riskScore && customer.riskScore >= 70)
          .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
          .slice(0, 10);
        
        console.log("Enhanced high risk customers found:", highRisk.length);
        setHighRiskCustomers(highRisk);
      } catch (err) {
        console.error("Enhanced error fetching customers:", err);
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
            <DialogTitle>Upload Customer Data</DialogTitle>
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