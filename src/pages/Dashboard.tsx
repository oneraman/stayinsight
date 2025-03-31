
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
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

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState("30");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
        const customersQuery = query(
          collection(firestore, "customers"),
          where("segment", "==", "high-risk"),
          orderBy("riskScore", "desc"),
          limit(5)
        );
        
        const snapshot = await getDocs(customersQuery);
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
        
        setHighRiskCustomers(customerData);
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHighRiskCustomers();
  }, []);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`bg-[#1A1F2C] text-white transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center p-4 border-b border-gray-800">
            <div className="h-8 w-8 mr-2">
              
            </div>
            <span className="text-lg font-bold">stayInsights</span>
          </div>
          
          <nav className="flex-1 pt-5">
            <ul className="space-y-2 px-2">
              <li>
                <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-md bg-[#262c3a] text-white">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/customers" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-[#262c3a] text-gray-300 hover:text-white transition-colors">
                  <Users className="h-5 w-5" />
                  <span>Customers</span>
                </Link>
              </li>
              <li>
                <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-[#262c3a] text-gray-300 hover:text-white transition-colors">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="p-4 border-t border-gray-800 mt-auto">
            <Button variant="ghost" onClick={toggleSidebar} className="w-full flex items-center justify-center gap-2 text-gray-300 hover:text-white hover:bg-[#262c3a]">
              <ChevronLeft className="h-4 w-4" />
              <span>Hide Sidebar</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          onToggleSidebar={toggleSidebar} 
          isSidebarCollapsed={sidebarCollapsed} 
        />

        <div className="flex-1 max-w-full px-4 sm:px-6 py-6 overflow-auto">
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
