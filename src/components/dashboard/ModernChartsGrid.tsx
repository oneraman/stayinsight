import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useChartData } from "@/hooks/useChartData";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Sample data
const trendData = [
  { month: "Jan", churn: 8.2, retention: 91.8 },
  { month: "Feb", churn: 9.1, retention: 90.9 },
  { month: "Mar", churn: 10.5, retention: 89.5 },
  { month: "Apr", churn: 11.8, retention: 88.2 },
  { month: "May", churn: 12.5, retention: 87.5 },
];

const riskData = [
  { name: "Low Risk", value: 5, color: "hsl(142, 71%, 45%)" },
  { name: "Medium Risk", value: 25, color: "hsl(38, 92%, 50%)" },
  { name: "High Risk", value: 70, color: "hsl(0, 84%, 60%)" },
];

const revenueData = [
  { month: "Jan", total: 125000, atRisk: 15000 },
  { month: "Feb", total: 132000, atRisk: 18000 },
  { month: "Mar", total: 128000, atRisk: 22000 },
  { month: "Apr", total: 145000, atRisk: 35000 },
  { month: "May", total: 150000, atRisk: 48000 },
];

const segmentData = [
  { segment: "High Value", lowRisk: 30, mediumRisk: 45, highRisk: 25 },
  { segment: "Mid Value", lowRisk: 20, mediumRisk: 35, highRisk: 45 },
  { segment: "Low Value", lowRisk: 10, mediumRisk: 25, highRisk: 65 },
];

interface ChartCardProps {
  title: string;
  tooltip: string;
  children: React.ReactNode;
}

const ChartCard = ({ title, tooltip, children }: ChartCardProps) => (
  <Card className="chart-container">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-80">
        {children}
      </div>
    </CardContent>
  </Card>
);

interface ModernChartsGridProps {
  customers?: any[];
  timePeriod?: string;
}

const ModernChartsGrid = ({ customers = [], timePeriod = "30" }: ModernChartsGridProps) => {
  // Generate real chart data from customer data
  const chartData = useChartData(customers, timePeriod);
  
  // Use real data if available, otherwise fall back to sample data
  const trendData = chartData.trendData.length > 0 ? chartData.trendData : [
    { month: "Jan", churn: 8.2, retention: 91.8 },
    { month: "Feb", churn: 9.1, retention: 90.9 },
    { month: "Mar", churn: 10.5, retention: 89.5 },
    { month: "Apr", churn: 11.8, retention: 88.2 },
    { month: "May", churn: 12.5, retention: 87.5 },
  ];
  
  const riskData = chartData.riskDistribution.length > 0 ? chartData.riskDistribution.map(item => ({
    name: item.name,
    value: item.value,
    color: item.name === "Low Risk" ? "hsl(142, 71%, 45%)" : 
           item.name === "Medium Risk" ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)"
  })) : [
    { name: "Low Risk", value: 5, color: "hsl(142, 71%, 45%)" },
    { name: "Medium Risk", value: 25, color: "hsl(38, 92%, 50%)" },
    { name: "High Risk", value: 70, color: "hsl(0, 84%, 60%)" },
  ];
  
  const revenueData = chartData.revenueData.length > 0 ? chartData.revenueData : [
    { month: "Jan", total: 125000, atRisk: 15000 },
    { month: "Feb", total: 132000, atRisk: 18000 },
    { month: "Mar", total: 128000, atRisk: 22000 },
    { month: "Apr", total: 145000, atRisk: 35000 },
    { month: "May", total: 150000, atRisk: 48000 },
  ];
  
  const segmentData = chartData.segmentData.length > 0 ? chartData.segmentData.map(item => ({
    segment: item.name,
    lowRisk: item.stable || 0,
    mediumRisk: item.growing || 0,
    highRisk: item.atRisk || 0
  })) : [
    { segment: "High Value", lowRisk: 30, mediumRisk: 45, highRisk: 25 },
    { segment: "Mid Value", lowRisk: 20, mediumRisk: 35, highRisk: 45 },
    { segment: "Low Value", lowRisk: 10, mediumRisk: 25, highRisk: 65 },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard
        title="Churn & Retention Trends"
        tooltip="Shows customer churn and retention over time"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="churn"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={2}
              dot={{ fill: "hsl(0, 84%, 60%)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "hsl(0, 84%, 60%)" }}
              name="Churn Rate (%)"
            />
            <Line
              type="monotone"
              dataKey="retention"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              dot={{ fill: "hsl(142, 71%, 45%)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "hsl(142, 71%, 45%)" }}
              name="Retention Rate (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Customer Risk Distribution"
        tooltip="Breakdown of customers by churn risk"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={riskData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {riskData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Revenue Trends"
        tooltip="Revenue vs. At-risk revenue over time"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`$${(value / 1000).toFixed(0)}k`, ""]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="total"
              stackId="1"
              stroke="hsl(217, 91%, 60%)"
              fill="hsl(217, 91%, 60%)"
              fillOpacity={0.6}
              name="Total Revenue"
            />
            <Area
              type="monotone"
              dataKey="atRisk"
              stackId="2"
              stroke="hsl(38, 92%, 50%)"
              fill="hsl(38, 92%, 50%)"
              fillOpacity={0.8}
              name="At-Risk Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Customer Segments Analysis"
        tooltip="High-value vs mid-value vs low-value customers"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={segmentData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="segment" />
            <YAxis />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar
              dataKey="lowRisk"
              stackId="a"
              fill="hsl(142, 71%, 45%)"
              name="Low Risk"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="mediumRisk"
              stackId="a"
              fill="hsl(38, 92%, 50%)"
              name="Medium Risk"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="highRisk"
              stackId="a"
              fill="hsl(0, 84%, 60%)"
              name="High Risk"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default ModernChartsGrid;