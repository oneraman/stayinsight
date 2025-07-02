
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ComposedChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react";

interface ChartProps {
  data: any[];
  title: string;
  description?: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

export const TrendChart = ({ data, title, description }: ChartProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        {title}
      </CardTitle>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
          <Line type="monotone" dataKey="target" stroke="#82ca9d" strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const AreaTrendChart = ({ data, title, description }: ChartProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Activity className="h-5 w-5" />
        {title}
      </CardTitle>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="customers" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Area type="monotone" dataKey="revenue" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const ComparativeBarChart = ({ data, title, description }: ChartProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        {title}
      </CardTitle>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="current" fill="#8884d8" />
          <Bar dataKey="previous" fill="#82ca9d" />
          <Bar dataKey="target" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const SegmentationPieChart = ({ data, title, description }: ChartProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <PieChartIcon className="h-5 w-5" />
        {title}
      </CardTitle>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const ComposedTrendChart = ({ data, title, description }: ChartProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Activity className="h-5 w-5" />
        {title}
      </CardTitle>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="customers" fill="#8884d8" />
          <Line yAxisId="right" type="monotone" dataKey="churnRate" stroke="#ff7c7c" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="retentionRate" stroke="#82ca9d" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

interface AdvancedChartsProps {
  customers: any[];
  timeframe: string;
}

const AdvancedCharts = ({ customers, timeframe }: AdvancedChartsProps) => {
  // Generate sample trend data (in a real app, this would come from historical data)
  const trendData = Array.from({ length: 12 }, (_, i) => ({
    period: `Month ${i + 1}`,
    value: Math.floor(Math.random() * 100) + 50,
    target: 80,
    customers: Math.floor(Math.random() * 500) + 200,
    revenue: Math.floor(Math.random() * 10000) + 5000,
    churnRate: Math.floor(Math.random() * 20) + 10,
    retentionRate: Math.floor(Math.random() * 20) + 75
  }));

  const segmentData = [
    { name: 'Champions', value: customers.filter(c => (c.total_spent || 0) > 1000 && (c.purchase_count || 0) > 10).length },
    { name: 'Loyal', value: customers.filter(c => (c.purchase_count || 0) > 5 && (c.risk_score || 0) < 30).length },
    { name: 'At Risk', value: customers.filter(c => (c.risk_score || 0) >= 70).length },
    { name: 'New', value: customers.filter(c => (c.tenure || 0) < 6).length }
  ].filter(segment => segment.value > 0);

  const comparativeData = [
    { category: 'Q1', current: 65, previous: 59, target: 70 },
    { category: 'Q2', current: 72, previous: 65, target: 75 },
    { category: 'Q3', current: 68, previous: 72, target: 75 },
    { category: 'Q4', current: 78, previous: 68, target: 80 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart 
          data={trendData} 
          title="Customer Retention Trend" 
          description="Monthly retention rate vs targets"
        />
        <AreaTrendChart 
          data={trendData} 
          title="Customer & Revenue Growth" 
          description="Tracking customer acquisition and revenue"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SegmentationPieChart 
          data={segmentData} 
          title="Customer Segmentation" 
          description="Distribution of customers by segment"
        />
        <ComparativeBarChart 
          data={comparativeData} 
          title="Quarterly Performance" 
          description="Current vs previous performance"
        />
      </div>
      
      <ComposedTrendChart 
        data={trendData} 
        title="Customer Metrics Overview" 
        description="Combined view of customer count and retention metrics"
      />
    </div>
  );
};

export default AdvancedCharts;
