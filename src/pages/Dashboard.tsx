
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FileUp, RefreshCw, Filter } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import CustomerRiskTable from "@/components/CustomerRiskTable";
import RetentionActionCard from "@/components/RetentionActionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const data = [
  {
    name: "Jan",
    churnRate: 4.0,
    retention: 96.0,
  },
  {
    name: "Feb",
    churnRate: 3.8,
    retention: 96.2,
  },
  {
    name: "Mar",
    churnRate: 3.5,
    retention: 96.5,
  },
  {
    name: "Apr",
    churnRate: 4.2,
    retention: 95.8,
  },
  {
    name: "May",
    churnRate: 3.9,
    retention: 96.1,
  },
  {
    name: "Jun",
    churnRate: 3.2,
    retention: 96.8,
  },
];

const segmentData = [
  {
    name: "High Value",
    atRisk: 12,
    stable: 78,
    growing: 10,
  },
  {
    name: "Mid Value",
    atRisk: 18,
    stable: 65,
    growing: 17,
  },
  {
    name: "Low Value",
    atRisk: 25,
    stable: 55,
    growing: 20,
  },
];

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-[#5E5AFF]">StayInsights</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">
                <RefreshCw size={16} className="mr-2" />
                Refresh Data
              </Button>
              <Link to="/upload">
                <Button>
                  <FileUp size={16} className="mr-2" />
                  Upload Data
                </Button>
              </Link>
              <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-8">
          {/* Dashboard Title */}
          <div>
            <h1 className="text-2xl font-bold">Customer Analytics Dashboard</h1>
            <p className="text-gray-500">
              Overview of customer churn risk and retention metrics
            </p>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Churn Rate"
              value="3.8%"
              change="-0.5%"
              isPositive={true}
              description="Last 30 days"
              icon="chart"
            />
            <MetricCard
              title="At-Risk Customers"
              value="47"
              change="+3"
              isPositive={false}
              description="Identified this month"
              icon="alert"
            />
            <MetricCard
              title="Customer Lifetime Value"
              value="$842"
              change="+$28"
              isPositive={true}
              description="Average per customer"
              icon="money"
            />
          </div>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="segments">Customer Segments</TabsTrigger>
              <TabsTrigger value="predictions">Churn Predictions</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-medium mb-4">
                    Churn Rate Trend
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={data}
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
                        <Line
                          type="monotone"
                          dataKey="churnRate"
                          stroke="#5E5AFF"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

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
                          fill="#F56565"
                        />
                        <Bar
                          name="Stable"
                          dataKey="stable"
                          stackId="a"
                          fill="#68D391"
                        />
                        <Bar
                          name="Growing"
                          dataKey="growing"
                          stackId="a"
                          fill="#4C51BF"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* At-Risk Customers Table */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    Customers at Risk of Churning
                  </h3>
                  <Button variant="outline" size="sm">
                    <Filter size={16} className="mr-2" />
                    Filter
                  </Button>
                </div>
                <CustomerRiskTable />
              </Card>
            </TabsContent>

            {/* Segments Tab */}
            <TabsContent value="segments">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">
                  Customer Segments Content
                </h3>
                <p>Customer segmentation data will appear here.</p>
              </Card>
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">
                  Churn Predictions Content
                </h3>
                <p>Detailed churn prediction data will appear here.</p>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Recommended Actions */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recommended Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <RetentionActionCard
                title="Send Renewal Offer"
                description="12 high-value customers have subscriptions expiring in the next 30 days."
                impact="High"
                actionText="View Customers"
              />
              <RetentionActionCard
                title="Follow Up on Support Tickets"
                description="8 customers with open support tickets for more than 48 hours."
                impact="Medium"
                actionText="View Tickets"
              />
              <RetentionActionCard
                title="Re-engagement Campaign"
                description="22 customers showing decreased usage in the last 14 days."
                impact="Medium"
                actionText="Create Campaign"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
