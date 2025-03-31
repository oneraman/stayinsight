
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { CustomerData } from "@/utils/dataProcessing";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsOverview from "@/components/dashboard/MetricsOverview";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

const Dashboard = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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
        setError(err.message || "Failed to load customer data");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <DashboardLayout>
      <DashboardHeader onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
      <div className="container mx-auto px-4 py-6">
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
