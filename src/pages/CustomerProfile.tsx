import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { CustomerData } from "@/utils/dataProcessing";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag, TrendingDown, TrendingUp, DollarSign, Calendar, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const CustomerProfile = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) return;
      
      try {
        setLoading(true);
        
        // Query Firestore for the customer with matching customerId
        const customersRef = doc(firestore, "customers", customerId);
        const customerDoc = await getDoc(customersRef);
        
        if (customerDoc.exists()) {
          const data = customerDoc.data() as CustomerData;
          
          // Convert timestamps to dates if necessary
          if (data.lastPurchaseDate && 
              typeof data.lastPurchaseDate === 'object' && 
              'toDate' in data.lastPurchaseDate && 
              typeof data.lastPurchaseDate.toDate === 'function') {
            data.lastPurchaseDate = data.lastPurchaseDate.toDate();
          }
          
          // Use functional update to avoid the TypeScript error
          setCustomer({
            ...data,
            id: customerDoc.id
          });
        } else {
          setError("Customer not found");
          toast.error("Customer not found");
        }
      } catch (err: any) {
        console.error("Error fetching customer:", err);
        setError(err.message || "Failed to load customer data");
        toast.error("Failed to load customer data");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId]);

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return `$${value.toFixed(2)}`;
  };

  const getRecommendations = (customer: CustomerData) => {
    if (!customer) return [];
    
    const recommendations = [];
    
    if (customer.segment === 'high-risk') {
      recommendations.push({
        title: "Offer renewal discount",
        description: "Provide a 15% discount on the next subscription renewal to incentivize staying.",
      });
      recommendations.push({
        title: "Executive outreach",
        description: "Schedule a call with a company executive to discuss customer needs and concerns.",
      });
    } else if (customer.segment === 'medium-risk') {
      recommendations.push({
        title: "Engagement campaign",
        description: "Send targeted emails highlighting unused features of their subscription.",
      });
      recommendations.push({
        title: "Feature education",
        description: "Invite to a product webinar or provide custom tutorials for better product usage.",
      });
    } else {
      recommendations.push({
        title: "Upsell opportunity",
        description: "This customer may be ready for a premium plan upgrade.",
      });
      recommendations.push({
        title: "Referral request",
        description: "Ask this loyal customer for referrals to similar businesses.",
      });
    }
    
    return recommendations;
  };

  const getRiskColor = (segment: string | undefined) => {
    switch (segment) {
      case 'high-risk':
        return "text-red-500";
      case 'medium-risk':
        return "text-yellow-500";
      case 'low-risk':
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link to="/customers">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-4">Customer Profile</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">
            {error}
          </div>
        ) : customer ? (
          <div className="space-y-6">
            {/* Customer Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{customer.name || 'Unnamed Customer'}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        {customer.email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="h-4 w-4 mr-1" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <Badge 
                          className={`${
                            customer.segment === 'high-risk' 
                              ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                              : customer.segment === 'medium-risk' 
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {customer.segment} customer
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                    <div className="text-sm text-gray-500">Customer ID</div>
                    <div className="font-mono">{customer.customerId}</div>
                    {customer.lastPurchaseDate && (
                      <div className="mt-2 text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" /> Last purchase: {formatDate(customer.lastPurchaseDate)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment and Customer Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingDown className="h-5 w-5 mr-2" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Churn Risk Score</span>
                        <span className={`text-sm font-medium ${getRiskColor(customer.segment)}`}>
                          {customer.riskScore || 0}%
                        </span>
                      </div>
                      <Progress 
                        value={customer.riskScore || 0} 
                        className={
                          customer.riskScore && customer.riskScore > 70 
                            ? "h-2 bg-gray-200 text-red-500" 
                            : customer.riskScore && customer.riskScore > 30 
                              ? "h-2 bg-gray-200 text-yellow-500" 
                              : "h-2 bg-gray-200 text-green-500"
                        }
                      />
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md mt-4">
                      <h4 className="font-medium mb-2">Risk Factors</h4>
                      <ul className="space-y-2 text-sm">
                        {customer.lastPurchaseDate && (
                          new Date().getTime() - new Date(customer.lastPurchaseDate).getTime() > 90 * 24 * 60 * 60 * 1000
                        ) && (
                          <li className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            No purchase in over 90 days
                          </li>
                        )}
                        {customer.purchaseCount !== undefined && customer.purchaseCount < 3 && (
                          <li className="flex items-start">
                            <span className="text-yellow-500 mr-2">•</span>
                            Low purchase frequency ({customer.purchaseCount} orders)
                          </li>
                        )}
                        {customer.avgOrderValue !== undefined && customer.avgOrderValue < 100 && (
                          <li className="flex items-start">
                            <span className="text-yellow-500 mr-2">•</span>
                            Low average order value ({formatCurrency(customer.avgOrderValue)})
                          </li>
                        )}
                        {customer.purchaseCount !== undefined && customer.purchaseCount > 5 && (
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            Loyal customer with {customer.purchaseCount} orders
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Customer Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="text-sm text-gray-500">Total Spent</div>
                      <div className="text-2xl font-bold">{formatCurrency(customer.totalSpent)}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="text-sm text-gray-500">Purchase Count</div>
                      <div className="text-2xl font-bold">{customer.purchaseCount || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="text-sm text-gray-500">Avg Order Value</div>
                      <div className="text-2xl font-bold">{formatCurrency(customer.avgOrderValue)}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="text-sm text-gray-500">Customer Since</div>
                      <div className="text-lg font-medium">Unknown</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommended Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>Based on customer risk profile and purchase history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getRecommendations(customer).map((recommendation, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-primary">{recommendation.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center p-4">
            Customer not found
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfile;
