import { useMemo } from 'react';

export const useChartData = (customers: any[], timePeriod: string) => {
  const chartData = useMemo(() => {
    if (!customers.length) {
      return {
        trendData: [],
        segmentData: [],
        riskDistribution: [],
        revenueData: []
      };
    }

    // Calculate trend data based on customer purchase dates
    const monthlyData = new Map();
    const now = new Date();
    const monthsToShow = timePeriod === "7" ? 2 : timePeriod === "30" ? 6 : 12;

    // Initialize months
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyData.set(monthKey, {
        name: monthKey,
        churnRate: 0,
        retention: 0,
        revenue: 0,
        customers: 0,
        totalCustomers: 0
      });
    }

    // Process customer data (using snake_case from database)
    customers.forEach(customer => {
      const lastPurchase = customer.last_purchase_date ? new Date(customer.last_purchase_date) : null;
      if (lastPurchase && !isNaN(lastPurchase.getTime())) {
        const monthKey = lastPurchase.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        const monthData = monthlyData.get(monthKey);
        if (monthData) {
          monthData.customers++;
          monthData.revenue += customer.total_spent || 0;
          monthData.totalCustomers++;
          
          // Calculate churn based on risk score
          if (customer.risk_score && customer.risk_score >= 65) {
            monthData.churnRate += 1;
          }
        }
      }
    });

    // Finalize trend data calculations
    const trendData = Array.from(monthlyData.values()).map(month => ({
      ...month,
      churnRate: month.totalCustomers > 0 ? (month.churnRate / month.totalCustomers * 100) : 0,
      retention: month.totalCustomers > 0 ? ((month.totalCustomers - month.churnRate) / month.totalCustomers * 100) : 0
    }));

    // Calculate segment data based on customer value
    const segments = {
      'High Value': { atRisk: 0, stable: 0, growing: 0 },
      'Mid Value': { atRisk: 0, stable: 0, growing: 0 },
      'Low Value': { atRisk: 0, stable: 0, growing: 0 }
    };

    customers.forEach(customer => {
      const value = customer.total_spent || 0;
      let segment: 'High Value' | 'Mid Value' | 'Low Value';
      
      if (value >= 10000) segment = 'High Value';
      else if (value >= 5000) segment = 'Mid Value';
      else segment = 'Low Value';

      const riskScore = customer.risk_score || 50;
      if (riskScore >= 65) segments[segment].atRisk++;
      else if (riskScore >= 25) segments[segment].stable++;
      else segments[segment].growing++;
    });

    const segmentData = Object.entries(segments).map(([name, data]) => ({
      name,
      ...data
    }));

    // Risk distribution data
    const riskBuckets = { low: 0, medium: 0, high: 0 };
    customers.forEach(customer => {
      const risk = customer.risk_score || 50;
      if (risk >= 65) riskBuckets.high++;
      else if (risk >= 25) riskBuckets.medium++;
      else riskBuckets.low++;
    });

    const riskDistribution = [
      { name: 'Low Risk', value: riskBuckets.low, color: '#10B981' },
      { name: 'Medium Risk', value: riskBuckets.medium, color: '#F59E0B' },
      { name: 'High Risk', value: riskBuckets.high, color: '#EF4444' }
    ];

    // Revenue data over time
    const revenueData = trendData.map(month => ({
      name: month.name,
      totalRevenue: month.revenue,
      atRiskRevenue: month.revenue * (month.churnRate / 100)
    }));

    return {
      trendData,
      segmentData,
      riskDistribution,
      revenueData
    };
  }, [customers, timePeriod]);

  return chartData;
};