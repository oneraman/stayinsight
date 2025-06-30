import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { trendData } from "@/data/dashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoIcon } from "lucide-react";

interface ChurnAnalyticsProps {
  data?: typeof trendData;
  loading?: boolean;
}

const ChurnAnalyticsChart = ({ data = trendData, loading = false }: ChurnAnalyticsProps) => {
  if (loading) {
    return (
      <Card className="w-full bg-white shadow-sm h-[400px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-full max-w-[250px]" />
        </CardHeader>
        <CardContent className="h-[300px]">
          <Skeleton className="h-full w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Churn Analytics</CardTitle>
          <div className="flex items-center text-xs text-muted-foreground">
            <InfoIcon className="h-3.5 w-3.5 mr-1" />
            Last 6 months
          </div>
        </div>
        <CardDescription>
          Track churn rate and retention trends over time
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5E5AFF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#5E5AFF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#888888"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              stroke="#888888"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: 'none'
              }}
              formatter={(value) => [`${value}%`, '']}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Legend 
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: '10px' }}
            />
            <Area
              type="monotone"
              dataKey="churnRate"
              stroke="#5E5AFF"
              fill="url(#colorChurn)"
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Churn Rate"
            />
            <Area
              type="monotone"
              dataKey="retention"
              stroke="#4ade80"
              fill="url(#colorRetention)"
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Retention"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ChurnAnalyticsChart;