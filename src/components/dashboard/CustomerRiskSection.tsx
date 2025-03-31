
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerData } from '@/utils/dataProcessing';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CustomerRiskSectionProps {
  customers: CustomerData[];
}

const CustomerRiskSection = ({ customers }: CustomerRiskSectionProps) => {
  // Calculate customer risk distribution
  const highRiskCount = customers.filter(c => c.segment === 'high-risk').length;
  const mediumRiskCount = customers.filter(c => c.segment === 'medium-risk').length;
  const lowRiskCount = customers.filter(c => c.segment === 'low-risk').length;

  const data = [
    { name: 'High Risk', value: highRiskCount || 15, color: '#F56565' },
    { name: 'Medium Risk', value: mediumRiskCount || 25, color: '#ED8936' },
    { name: 'Low Risk', value: lowRiskCount || 60, color: '#48BB78' },
  ];

  return (
    <Card className="col-span-1 card-hover">
      <CardHeader>
        <CardTitle>Customer Risk Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="bg-red-100 p-2 rounded">
            <div className="text-xl font-bold text-red-600">{highRiskCount || 15}</div>
            <div className="text-xs text-gray-500">High Risk</div>
          </div>
          <div className="bg-orange-100 p-2 rounded">
            <div className="text-xl font-bold text-orange-600">{mediumRiskCount || 25}</div>
            <div className="text-xs text-gray-500">Medium Risk</div>
          </div>
          <div className="bg-green-100 p-2 rounded">
            <div className="text-xl font-bold text-green-600">{lowRiskCount || 60}</div>
            <div className="text-xs text-gray-500">Low Risk</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerRiskSection;
