
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChurnRateChart from "./ChurnRateChart";
import RetentionBySegmentChart from "./RetentionBySegmentChart";
import CustomerRiskSection from "./CustomerRiskSection";
import AdvancedAnalyticsDashboard from './AdvancedAnalyticsDashboard';
import AdvancedMetricsGrid from './AdvancedMetricsGrid';
import ReportingDashboard from './ReportingDashboard';
import AdvancedCharts from './AdvancedCharts';

interface DashboardTabsProps {
  customers: any[];
  timeframe: string;
}

const DashboardTabs = ({ customers = [], timeframe = "30" }: DashboardTabsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        <TabsTrigger value="reporting">Reporting</TabsTrigger>
        <TabsTrigger value="insights">AI Insights</TabsTrigger>
        <TabsTrigger value="visualizations">Charts</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <AdvancedMetricsGrid customers={customers} timeframe={timeframe} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChurnRateChart />
          <RetentionBySegmentChart />
        </div>
        
        <CustomerRiskSection />
      </TabsContent>

      <TabsContent value="analytics">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">
            Analytics Content
          </h3>
          <p>Advanced analytics data will appear here.</p>
        </Card>
      </TabsContent>

      <TabsContent value="advanced">
        <AdvancedAnalyticsDashboard customers={customers} />
      </TabsContent>

      <TabsContent value="reporting">
        <ReportingDashboard customers={customers} timeframe={timeframe} />
      </TabsContent>

      <TabsContent value="insights">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">
            AI Insights Content
          </h3>
          <p>AI insights data will appear here.</p>
        </Card>
      </TabsContent>

      <TabsContent value="visualizations">
        <AdvancedCharts customers={customers} timeframe={timeframe} />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
