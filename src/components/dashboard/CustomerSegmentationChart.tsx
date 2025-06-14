
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface CustomerSegmentationProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  loading?: boolean;
}

const CustomerSegmentationChart = ({ data, loading = false }: CustomerSegmentationProps) => {
  if (loading) {
    return (
      <Card className="w-full bg-white shadow-sm h-[400px]">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Customer Segmentation</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] animate-pulse bg-gray-100 rounded-md"></CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <CardTitle className="text-lg font-medium">Customer Segmentation</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} customers`, 'Count']} 
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CustomerSegmentationChart;
