import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { CustomerData } from "@/utils/dataProcessing";
import { Link } from "react-router-dom";
import { LayoutDashboard, Users, Settings, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsOverview from "@/components/dashboard/MetricsOverview";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HighRiskCustomersTable from "@/components/dashboard/HighRiskCustomersTable";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState("30");
  const [highRiskCustomers, setHighRiskCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    churnRate: 4.2,
    retentionRate: 95.8,
    customerLifetimeValue: 842,
    atRiskRevenue: 24500
  });
  
  useEffect(() => {
    const fetchHighRiskCustomers = async () => {
      try {
        setLoading(true);
        console.log("Fetching customers...");
        
        // Use a simple query without complex filtering
        const customersQuery = query(
          collection(firestore, "customers"),
          limit(20) // Get more customers and filter in JavaScript
        );
        
        const snapshot = await getDocs(customersQuery);
        console.log("Customers fetched:", snapshot.docs.length);
        
        const customerData = snapshot.docs.map(doc => {
          const data = doc.data() as CustomerData;
          console.log("Processing customer:", data);
          
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
        
        // Filter and sort high-risk customers in JavaScript
        const highRisk = customerData
          .filter(customer => customer.riskScore && customer.riskScore > 70)
          .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
          .slice(0, 5);
        
        console.log("High risk customers:", highRisk);
        setHighRiskCustomers(highRisk);
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHighRiskCustomers();
  }, []);

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
        <MetricsOverview metrics={metrics} />
        
        <DashboardTabs />
        
        <Card>
          <CardHeader>
            <CardTitle>High Risk Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : highRiskCustomers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No high-risk customers found.</p>
                <p className="text-sm text-gray-400 mt-1">Upload customer data to identify at-risk customers.</p>
              </div>
            ) : (
              <HighRiskCustomersTable customers={highRiskCustomers} />
            )}
          </CardContent>
        </Card>

        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold mb-4">Import Data</h2>
          <FileUploader />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
