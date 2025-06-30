import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector
} from "recharts";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerSegmentationProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  loading?: boolean;
}

const CustomerSegmentationChart = ({ data, loading = false }: CustomerSegmentationProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

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

  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="w-full bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Customer Segmentation</CardTitle>
        <CardDescription>
          Distribution of customers by risk level
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        {total === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No customer data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} customers (${Math.round((value as number / total) * 100)}%)`, 'Count']} 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: 'none'
                }}
              />
              <Legend 
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color, fontWeight: activeIndex === entry.payload.index ? 'bold' : 'normal' }}>
                    {value} ({Math.round((entry.payload.value / total) * 100)}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerSegmentationChart;