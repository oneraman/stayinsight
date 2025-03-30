
import { HelpCircle } from "lucide-react";
import MetricCard from "@/components/MetricCard";

const MetricsOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between">
          <h3 className="text-sm text-gray-500 font-medium">Churn Rate</h3>
          <HelpCircle className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">4.2%</span>
          <span className="ml-2 text-red-500 text-sm">-0.8%</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between">
          <h3 className="text-sm text-gray-500 font-medium">Retention Rate</h3>
          <HelpCircle className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">95.8%</span>
          <span className="ml-2 text-green-500 text-sm">+1.2%</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between">
          <h3 className="text-sm text-gray-500 font-medium">Customer Lifetime Value</h3>
          <HelpCircle className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">$842</span>
          <span className="ml-2 text-green-500 text-sm">+$56</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between">
          <h3 className="text-sm text-gray-500 font-medium">At-Risk Revenue</h3>
          <HelpCircle className="h-4 w-4 text-gray-400" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">$24.5k</span>
          <span className="ml-2 text-red-500 text-sm">-$3.2k</span>
        </div>
      </div>
    </div>
  );
};

export default MetricsOverview;
