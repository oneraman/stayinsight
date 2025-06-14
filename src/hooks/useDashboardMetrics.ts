
import { useState, useEffect } from "react";
import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { CustomerData } from "@/utils/dataProcessing";

interface DashboardMetrics {
  churnRate: number;
  retentionRate: number;
  customerLifetimeValue: number;
  atRiskRevenue: number;
  totalCustomers: number;
  highRiskCustomers: number;
  mediumRiskCustomers: number;
  lowRiskCustomers: number;
  loading: boolean;
  error: string | null;
}

export const useDashboardMetrics = (timePeriod: string = "30") => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    churnRate: 0,
    retentionRate: 0,
    customerLifetimeValue: 0,
    atRiskRevenue: 0,
    totalCustomers: 0,
    highRiskCustomers: 0,
    mediumRiskCustomers: 0,
    lowRiskCustomers: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const calculateMetrics = async () => {
      try {
        setMetrics(prev => ({ ...prev, loading: true, error: null }));
        
        // Get all customers
        const customersQuery = query(collection(firestore, "customers"));
        const snapshot = await getDocs(customersQuery);
        
        const customers: CustomerData[] = snapshot.docs.map(doc => {
          const data = doc.data() as CustomerData;
          
          // Convert Firestore timestamps to dates properly
          if (data.lastPurchaseDate) {
            if (data.lastPurchaseDate instanceof Timestamp) {
              data.lastPurchaseDate = data.lastPurchaseDate.toDate();
            } else if (typeof data.lastPurchaseDate === 'object' && 
                      data.lastPurchaseDate !== null &&
                      'toDate' in data.lastPurchaseDate &&
                      typeof data.lastPurchaseDate.toDate === 'function') {
              data.lastPurchaseDate = data.lastPurchaseDate.toDate();
            }
          }
          
          return {
            ...data,
            id: doc.id
          };
        });

        if (customers.length === 0) {
          setMetrics(prev => ({ 
            ...prev, 
            loading: false,
            error: "No customer data available. Please upload customer data to see metrics."
          }));
          return;
        }

        console.log("Calculating metrics for", customers.length, "customers");

        // Calculate date boundaries
        const now = new Date();
        const daysBack = parseInt(timePeriod);
        const periodStart = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

        // Filter customers by time period if they have purchase dates
        const periodCustomers = customers.filter(customer => {
          if (!customer.lastPurchaseDate) return true; // Include customers without dates
          return customer.lastPurchaseDate >= periodStart;
        });

        // Risk segmentation
        const highRisk = customers.filter(c => (c.riskScore || 0) >= 70);
        const mediumRisk = customers.filter(c => (c.riskScore || 0) >= 30 && (c.riskScore || 0) < 70);
        const lowRisk = customers.filter(c => (c.riskScore || 0) < 30);

        // Calculate churn rate (customers with high risk score)
        const churnRate = customers.length > 0 ? (highRisk.length / customers.length) * 100 : 0;

        // Calculate retention rate
        const retentionRate = 100 - churnRate;

        // Calculate average customer lifetime value
        const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
        const avgCustomerLifetimeValue = customers.length > 0 ? totalRevenue / customers.length : 0;

        // Calculate at-risk revenue (revenue from high-risk customers)
        const atRiskRevenue = highRisk.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

        const calculatedMetrics = {
          churnRate: Math.round(churnRate * 10) / 10,
          retentionRate: Math.round(retentionRate * 10) / 10,
          customerLifetimeValue: Math.round(avgCustomerLifetimeValue),
          atRiskRevenue: Math.round(atRiskRevenue),
          totalCustomers: customers.length,
          highRiskCustomers: highRisk.length,
          mediumRiskCustomers: mediumRisk.length,
          lowRiskCustomers: lowRisk.length,
          loading: false,
          error: null
        };

        console.log("Calculated metrics:", calculatedMetrics);
        setMetrics(calculatedMetrics);

      } catch (error) {
        console.error("Error calculating metrics:", error);
        setMetrics(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : "Failed to calculate metrics"
        }));
      }
    };

    calculateMetrics();
  }, [timePeriod]);

  return metrics;
};
