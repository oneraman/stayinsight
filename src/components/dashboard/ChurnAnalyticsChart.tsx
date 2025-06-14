
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface ChurnAnalyticsProps {
  data?: typeof trendData;
  loading?: boolean;
}

const ChurnAnalyticsChart = ({ data = trendData, loading = false }: ChurnAnalyticsProps) => {
  if (loading) {
    return (
      <Card className="w-full bg-white shadow-sm h-[400px]">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Churn Analytics</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] animate-pulse bg-gray-100 rounded-md"></CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <CardTitle className="text-lg font-medium">Churn Analytics</CardTitle>
        <div className="flex gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span>Churn Rate</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span>Retention</span>
          </div>
        </div>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#888888" />
            <YAxis stroke="#888888" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: 'none'
              }} 
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="churnRate"
              stroke="#5E5AFF"
              fill="#5E5AFF20"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              name="Churn Rate"
            />
            <Area
              type="monotone"
              dataKey="retention"
              stroke="#4ade80"
              fill="#4ade8020"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              name="Retention"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ChurnAnalyticsChart;
