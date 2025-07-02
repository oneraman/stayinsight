import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChurnRateChart from "./ChurnRateChart";
import RetentionBySegmentChart from "./RetentionBySegmentChart";
import CustomerRiskSection from "./CustomerRiskSection";
import AdvancedAnalyticsDashboard from './AdvancedAnalyticsDashboard';

const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [customers, setCustomers] = useState([]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="customers">Customers</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        <TabsTrigger value="insights">AI Insights</TabsTrigger>
        <TabsTrigger value="actions">Actions</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChurnRateChart />
          <RetentionBySegmentChart />
        </div>
        <CustomerRiskSection />
      </TabsContent>

      <TabsContent value="customers">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">
            Customers Content
          </h3>
          <p>Customer data will appear here.</p>
        </Card>
      </TabsContent>

      <TabsContent value="analytics">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">
            Analytics Content
          </h3>
          <p>Analytics data will appear here.</p>
        </Card>
      </TabsContent>

      <TabsContent value="advanced">
        <AdvancedAnalyticsDashboard customers={customers} />
      </TabsContent>

      <TabsContent value="insights">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">
            AI Insights Content
          </h3>
          <p>AI insights data will appear here.</p>
        </Card>
      </TabsContent>

      <TabsContent value="actions">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">
            Actions Content
          </h3>
          <p>Actions data will appear here.</p>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
