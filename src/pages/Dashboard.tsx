
import { useState, useEffect } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { CustomerData } from "@/utils/dataProcessing";
import { Loader2 } from "lucide-react";
import MetricsOverview from "@/components/dashboard/MetricsOverview";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/FileUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HighRiskCustomersTable from "@/components/dashboard/HighRiskCustomersTable";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState("30");
  const [highRiskCustomers, setHighRiskCustomers] = useState<CustomerData[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const metrics = useDashboardMetrics(timePeriod);

  // Refresh dashboard when file upload completes
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 5000); // Check for updates every 5 seconds

    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const fetchHighRiskCustomers = async () => {
      try {
        setLoadingCustomers(true);
        console.log("Fetching high-risk customers...");
        
        const customersQuery = query(
          collection(firestore, "customers"),
          limit(100)
        );
        
        const snapshot = await getDocs(customersQuery);
        console.log("Customers fetched:", snapshot.docs.length);
        
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
        
        const highRisk = customerData
          .filter(customer => customer.riskScore && customer.riskScore >= 70)
          .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
          .slice(0, 10);
        
        console.log("High risk customers:", highRisk);
        setHighRiskCustomers(highRisk);
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchHighRiskCustomers();
  }, [refreshTrigger]);

  return (
    <DashboardLayout>
      <div className="flex justify-between mb-6">
        <Tabs value={timePeriod} onValueChange={setTimePeriod} className="w-auto">
          <TabsList className="bg-white border border-gray-100 shadow-sm">
            <TabsTrigger value="30" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Last 30 days</TabsTrigger>
            <TabsTrigger value="60" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Last 60 days</TabsTrigger>
            <TabsTrigger value="90" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Last 90 days</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Tabs defaultValue="all" className="w-auto">
          <TabsList className="bg-white border border-gray-100 shadow-sm">
            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Segments</TabsTrigger>
            <TabsTrigger value="active" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Active</TabsTrigger>
            <TabsTrigger value="at-risk" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">At Risk</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-6 animate-fade-in">
        {metrics.error && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              {metrics.error}
            </AlertDescription>
          </Alert>
        )}

        <MetricsOverview 
          metrics={{
            churnRate: metrics.churnRate,
            retentionRate: metrics.retentionRate,
            customerLifetimeValue: metrics.customerLifetimeValue,
            atRiskRevenue: metrics.atRiskRevenue
          }}
          loading={metrics.loading}
        />
        
        <DashboardTabs />
        
        <Card>
          <CardHeader>
            <CardTitle>High Risk Customers ({highRiskCustomers.length})</CardTitle>
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
                <p className="text-sm text-gray-400 mt-1">Upload customer data below to identify at-risk customers.</p>
              </div>
            ) : (
              <HighRiskCustomersTable customers={highRiskCustomers} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Customer Data</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploader />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
