
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { CustomerData } from "@/utils/dataProcessing";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsOverview from "@/components/dashboard/MetricsOverview";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

const Dashboard = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Mock data for when we have a permission error
  const generateMockCustomers = (): CustomerData[] => {
    return Array(10).fill(0).map((_, index) => ({
      id: `sample-${index}`,
      customerId: `CUST-${1000 + index}`,
      name: `Sample Customer ${index + 1}`,
      email: `sample${index + 1}@example.com`,
      riskScore: Math.floor(Math.random() * 100),
      segment: Math.random() > 0.7 ? 'high-risk' : (Math.random() > 0.4 ? 'medium-risk' : 'low-risk'),
      totalSpent: Math.floor(Math.random() * 10000),
      purchaseCount: Math.floor(Math.random() * 50),
      lastPurchaseDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000)
    }));
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const customersCollection = collection(firestore, "customers");
        
        // Example queries: sorted by risk score, limited to 50
        const customersQuery = query(
          customersCollection,
          orderBy("riskScore", "desc"),
          limit(50)
        );
        
        const querySnapshot = await getDocs(customersQuery);
        const customerList: CustomerData[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          customerList.push({
            id: doc.id,
            ...data,
          } as CustomerData);
        });
        
        // Process the customer data (calculate segments if needed)
        const processedCustomers = customerList.map(customer => {
          // Make sure we have a proper risk score
          if (customer.riskScore === undefined) {
            customer.riskScore = 50; // Default medium risk
          }
          
          // Determine segment if not already set
          if (!customer.segment) {
            if (customer.riskScore < 30) customer.segment = 'low-risk';
            else if (customer.riskScore < 70) customer.segment = 'medium-risk';
            else customer.segment = 'high-risk';
          }
          
          return customer;
        });
        
        setCustomers(processedCustomers);
      } catch (err: any) {
        console.error("Error fetching customers:", err);
        
        // Handle permission denied error
        if (err.code === 'permission-denied') {
          const mockData = generateMockCustomers();
          setCustomers(mockData);
          setError("Firebase permission denied: Using sample data instead. Please configure your Firestore security rules.");
          toast.error("Firebase permission denied. Using sample data.");
        } else {
          setError(err.message || "Failed to load customer data");
          toast.error("Failed to load customer data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardHeader onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
      <div className="container mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <MetricsOverview customers={customers} />
        </div>
        
        <div className="mt-6">
          <DashboardTabs customers={customers} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
