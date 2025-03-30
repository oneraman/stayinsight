
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChurnRateChart from "./ChurnRateChart";
import RetentionBySegmentChart from "./RetentionBySegmentChart";
import CustomerRiskSection from "./CustomerRiskSection";

const DashboardTabs = () => {
  const [selectedTab, setSelectedTab] = useState("overview");

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="segments">Customer Segments</TabsTrigger>
        <TabsTrigger value="predictions">Churn Predictions</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChurnRateChart />
          <RetentionBySegmentChart />
        </div>
        <CustomerRiskSection />
      </TabsContent>

      <TabsContent value="segments">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">
            Customer Segments Content
          </h3>
          <p>Customer segmentation data will appear here.</p>
        </Card>
      </TabsContent>

      <TabsContent value="predictions">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">
            Churn Predictions Content
          </h3>
          <p>Detailed churn prediction data will appear here.</p>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
