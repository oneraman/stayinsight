import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

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
  const { currentUser } = useAuth();
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
      if (!currentUser) {
        setMetrics(prev => ({ 
          ...prev, 
          loading: false, 
          error: "Please log in to view metrics" 
        }));
        return;
      }

      try {
        setMetrics(prev => ({ ...prev, loading: true, error: null }));
        
        console.log('📊 Fetching customer data from Supabase for user:', currentUser.id);
        
        // Get all customers from Supabase for the authenticated user
        const { data: customers, error } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', currentUser.id)
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

        // Enhanced risk segmentation with improved thresholds
        const highRisk = customers.filter(c => (c.risk_score || 0) > 65);      // Changed from >= 70
        const mediumRisk = customers.filter(c => (c.risk_score || 0) > 25 && (c.risk_score || 0) <= 65);  // Changed from >= 30 && < 70
        const lowRisk = customers.filter(c => (c.risk_score || 0) <= 25);      // Changed from < 30

        // Enhanced churn rate calculation with time-based weighting
        const recentCustomers = customers.filter(customer => {
          if (!customer.last_purchase_date) return false;
          const lastPurchaseDate = new Date(customer.last_purchase_date);
          const daysSinceLastPurchase = Math.floor((now.getTime() - lastPurchaseDate.getTime()) / (24 * 60 * 60 * 1000));
          return daysSinceLastPurchase <= parseInt(timePeriod);
        });
        
        const activeHighRisk = recentCustomers.filter(c => (c.risk_score || 0) > 65);
        const churnRate = recentCustomers.length > 0 ? (activeHighRisk.length / recentCustomers.length) * 100 : 
                         customers.length > 0 ? (highRisk.length / customers.length) * 100 : 0;

        // More accurate retention rate calculation
        const retentionRate = Math.max(0, 100 - churnRate);

        // Simple customer lifetime value
        const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
        const customerLifetimeValue = customers.length > 0 ? totalRevenue / customers.length : 0;

        // Simple at-risk revenue
        const atRiskRevenue = highRisk.reduce((sum, customer) => 
          sum + (customer.total_spent || 0), 0
        );
        
        const calculatedMetrics = {
          churnRate,
          retentionRate,
          customerLifetimeValue,
          atRiskRevenue,
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
  }, [timePeriod, currentUser]);

  return metrics;
};