
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartBar, Users, Clock, FileUp, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import MetricCard from "@/components/MetricCard";
import CustomerRiskTable from "@/components/CustomerRiskTable";
import RetentionActionCard from "@/components/RetentionActionCard";
import { useToast } from "@/components/ui/use-toast";

// Mock data
const mockCustomers = [
  {
    id: "1",
    name: "John Smith",
    company: "Acme Inc",
    email: "john@acme.com",
    risk: "high" as const,
    score: 85,
    subscriptionValue: 4200
  },
  {
    id: "2",
    name: "Sarah Johnson",
    company: "XYZ Corp",
    email: "sarah@xyz.com",
    risk: "medium" as const,
    score: 52,
    subscriptionValue: 3600
  },
  {
    id: "3",
    name: "Robert Williams",
    company: "Tech Solutions",
    email: "robert@techsolutions.com",
    risk: "low" as const,
    score: 18,
    subscriptionValue: 6800
  },
  {
    id: "4",
    name: "Emily Davis",
    company: "Global Services",
    email: "emily@globalservices.com",
    risk: "high" as const,
    score: 79,
    subscriptionValue: 5300
  },
  {
    id: "5",
    name: "Michael Brown",
    company: "Innovative Systems",
    email: "michael@innosys.com",
    risk: "medium" as const,
    score: 64,
    subscriptionValue: 3900
  }
];

const mockActions = [
  {
    id: "1",
    title: "Send Personalized Email",
    description: "A re-engagement email with personalized product recommendations",
    actionType: "email" as const,
    impactScore: 75
  },
  {
    id: "2",
    title: "Schedule Check-in Call",
    description: "A customer success check-in call to address potential concerns",
    actionType: "call" as const,
    impactScore: 85
  },
  {
    id: "3",
    title: "Loyalty Discount Offer",
    description: "10% discount on next renewal to reward customer loyalty",
    actionType: "offer" as const,
    impactScore: 65
  },
  {
    id: "4",
    title: "Feature Usage Survey",
    description: "Get feedback on product features and identify improvement areas",
    actionType: "survey" as const,
    impactScore: 55
  }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  
  const handleActionClick = (actionTitle: string) => {
    toast({
      title: "Action initiated",
      description: `${actionTitle} has been scheduled successfully.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-churnify-blue text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <Link to="/" className="text-xl font-bold">Churnify</Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-churnify-blue/20">Help</Button>
            <Button variant="ghost" className="text-white hover:bg-churnify-blue/20">Settings</Button>
            <Link to="/">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-churnify-blue">Logout</Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Customer Dashboard</h1>
          <div className="flex space-x-4">
            <Link to="/upload">
              <Button className="bg-churnify-blue hover:bg-churnify-dark-blue">
                <FileUp className="mr-2 h-4 w-4" /> Upload Data
              </Button>
            </Link>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-8" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customers">At-Risk Customers</TabsTrigger>
            <TabsTrigger value="actions">Recommended Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Metrics section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                icon={<Users size={20} />}
                title="Customers" 
                value="248"
                trend={{ value: 12, isPositive: true }}
              />
              <MetricCard 
                icon={<ChartBar size={20} />}
                title="Churn Rate" 
                value="6.2%"
                trend={{ value: 2.1, isPositive: false }}
              />
              <MetricCard 
                icon={<Clock size={20} />}
                title="Avg. Lifetime" 
                value="14.3 mo"
                trend={{ value: 0.8, isPositive: true }}
              />
              <MetricCard 
                icon={<Users size={20} />}
                title="At-Risk Customers" 
                value="32"
                trend={{ value: 5, isPositive: false }}
              />
            </div>
            
            {/* Churn prediction overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Churn Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center">
                  {/* Placeholder for chart */}
                  <div className="text-center text-gray-500">
                    <ChartBar size={64} className="mx-auto mb-4 text-churnify-blue opacity-50" />
                    <p>Churn prediction visualization</p>
                    <p className="text-sm">(Simulated data visualization)</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Risk Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">High Risk</span>
                        <span className="text-sm font-medium text-churnify-red">32 customers</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-churnify-red h-2 rounded-full" style={{ width: "13%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Medium Risk</span>
                        <span className="text-sm font-medium text-churnify-amber">87 customers</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-churnify-amber h-2 rounded-full" style={{ width: "35%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Low Risk</span>
                        <span className="text-sm font-medium text-churnify-green">129 customers</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-churnify-green h-2 rounded-full" style={{ width: "52%" }}></div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <h4 className="font-medium mb-2">Top Churn Factors</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center text-sm">
                          <ChevronRight size={16} className="text-churnify-red mr-2" />
                          Low product usage in last 30 days
                        </li>
                        <li className="flex items-center text-sm">
                          <ChevronRight size={16} className="text-churnify-red mr-2" />
                          Support tickets unresolved > 7 days
                        </li>
                        <li className="flex items-center text-sm">
                          <ChevronRight size={16} className="text-churnify-amber mr-2" />
                          Contract renewal within 45 days
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">High-Risk Customers</h2>
              <Button variant="link" onClick={() => setActiveTab("customers")} className="text-churnify-blue">
                View All <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
            
            <CustomerRiskTable customers={mockCustomers.slice(0, 3)} />
          </TabsContent>
          
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>At-Risk Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerRiskTable customers={mockCustomers} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockActions.map((action) => (
                <RetentionActionCard 
                  key={action.id}
                  title={action.title}
                  description={action.description}
                  actionType={action.actionType}
                  impactScore={action.impactScore}
                  onActionClick={() => handleActionClick(action.title)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
