
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { segmentData } from "@/data/dashboardData";

const RetentionBySegmentChart = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">
        Retention by Segment
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={segmentData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              name="At Risk"
              dataKey="atRisk"
              stackId="a"
              fill="hsl(var(--risk-high))"
            />
            <Bar
              name="Stable"
              dataKey="stable"
              stackId="a"
              fill="hsl(var(--risk-low))"
            />
            <Bar
              name="Growing"
              dataKey="growing"
              stackId="a"
              fill="hsl(var(--chart-1))"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default RetentionBySegmentChart;
