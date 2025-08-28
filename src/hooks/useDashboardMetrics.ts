import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { enhancedMetricsCalculator } from "@/utils/enhancedMetricsCalculator";
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

        // Enhanced customer lifetime value with predictive adjustment
        const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
        const avgPurchaseCount = customers.reduce((sum, c) => sum + (c.purchase_count || 0), 0) / customers.length;
        const avgCustomerLifetimeValue = customers.length > 0 ? 
          (totalRevenue / customers.length) * Math.max(1, avgPurchaseCount / 12) : 0; // Adjusted for purchase frequency

        // Enhanced at-risk revenue calculation with weighted scoring
        const atRiskRevenue = customers.reduce((sum, c) => {
          const riskScore = c.risk_score || 0;
          const revenue = c.total_spent || 0;
          if (riskScore > 65) return sum + revenue;           // High risk - full amount
          if (riskScore > 45) return sum + (revenue * 0.6);   // Medium-high risk - 60%
          if (riskScore > 25) return sum + (revenue * 0.3);   // Medium risk - 30%
          return sum;                                         // Low risk - 0%
        }, 0);

        // Use enhanced metrics calculator for maximum accuracy
        const preciseMetrics = enhancedMetricsCalculator.calculatePreciseMetrics(customers, timePeriod);
        
        const calculatedMetrics = {
          churnRate: preciseMetrics.churnRate,
          retentionRate: preciseMetrics.retentionRate,
          customerLifetimeValue: preciseMetrics.customerLifetimeValue,
          atRiskRevenue: preciseMetrics.atRiskRevenue,
          totalCustomers: preciseMetrics.totalCustomers,
          highRiskCustomers: preciseMetrics.highRiskCustomers,
          mediumRiskCustomers: preciseMetrics.mediumRiskCustomers,
          lowRiskCustomers: preciseMetrics.lowRiskCustomers,
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