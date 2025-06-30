import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
        
        console.log('📊 Fetching customer data from Supabase...');
        
        // Get all customers from Supabase
        const { data: customers, error } = await supabase
          .from('customers')
          .select('*')
          .order('risk_score', { ascending: false });

        if (error) {
          throw new Error(`Supabase query failed: ${error.message}`);
        }

        if (!customers || customers.length === 0) {
          setMetrics(prev => ({ 
            ...prev, 
            loading: false,
            error: "No customer data available. Please upload customer data to see metrics."
          }));
          return;
        }

        console.log("📈 Calculating metrics for", customers.length, "customers from Supabase");

        // Calculate date boundaries
        const now = new Date();
        const daysBack = parseInt(timePeriod);
        const periodStart = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

        // Filter customers by time period if they have purchase dates
        const periodCustomers = customers.filter(customer => {
          if (!customer.last_purchase_date) return true;
          const lastPurchaseDate = new Date(customer.last_purchase_date);
          return lastPurchaseDate >= periodStart;
        });

        // Risk segmentation
        const highRisk = customers.filter(c => (c.risk_score || 0) >= 70);
        const mediumRisk = customers.filter(c => (c.risk_score || 0) >= 30 && (c.risk_score || 0) < 70);
        const lowRisk = customers.filter(c => (c.risk_score || 0) < 30);

        // Calculate churn rate (customers with high risk score)
        const churnRate = customers.length > 0 ? (highRisk.length / customers.length) * 100 : 0;

        // Calculate retention rate
        const retentionRate = 100 - churnRate;

        // Calculate average customer lifetime value
        const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
        const avgCustomerLifetimeValue = customers.length > 0 ? totalRevenue / customers.length : 0;

        // Calculate at-risk revenue (revenue from high-risk customers)
        const atRiskRevenue = highRisk.reduce((sum, c) => sum + (c.total_spent || 0), 0);

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

        console.log("✅ Supabase metrics calculated:", calculatedMetrics);
        setMetrics(calculatedMetrics);

      } catch (error) {
        console.error("❌ Error calculating Supabase metrics:", error);
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