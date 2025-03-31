
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CustomerData } from '@/utils/dataProcessing';

// Sample data for the chart - in a real app, this would be derived from actual customer data
const data = [
  { name: 'Jan', rate: 4.0 },
  { name: 'Feb', rate: 4.2 },
  { name: 'Mar', rate: 3.8 },
  { name: 'Apr', rate: 4.5 },
  { name: 'May', rate: 4.2 },
  { name: 'Jun', rate: 3.9 },
  { name: 'Jul', rate: 4.2 },
  { name: 'Aug', rate: 4.6 },
  { name: 'Sep', rate: 4.2 },
  { name: 'Oct', rate: 3.8 },
  { name: 'Nov', rate: 3.5 },
  { name: 'Dec', rate: 4.2 },
];

interface ChurnRateChartProps {
  customers: CustomerData[];
}

const ChurnRateChart = ({ customers }: ChurnRateChartProps) => {
  // In a real app, we would process the customers data here
  // to generate month-by-month churn rates

  return (
    <div className="h-72">
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
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="rate" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChurnRateChart;
