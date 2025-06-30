import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CustomerData } from "@/utils/dataProcessing";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/utils/customerUtils";
import CustomerHeader from "@/components/customer-profile/CustomerHeader";
import RiskAssessment from "@/components/customer-profile/RiskAssessment";
import CustomerValue from "@/components/customer-profile/CustomerValue";
import RecommendedActions from "@/components/customer-profile/RecommendedActions";
import AIChurnAnalysis from "@/components/customer-profile/AIChurnAnalysis";

const CustomerProfile = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerData>({
    customerId: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) {
        setError("Customer ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("📊 Fetching customer from Supabase:", customerId);
        
        const { data: supabaseCustomer, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            setError("Customer not found");
          } else {
            throw new Error(`Supabase query failed: ${error.message}`);
          }
          return;
        }

        if (supabaseCustomer) {
          // Transform Supabase data to match our CustomerData interface
          const customerData: CustomerData = {
            id: supabaseCustomer.id,
            customerId: supabaseCustomer.customer_id,
            email: supabaseCustomer.email,
            name: supabaseCustomer.name,
            lastPurchaseDate: supabaseCustomer.last_purchase_date ? new Date(supabaseCustomer.last_purchase_date) : undefined,
            purchaseCount: supabaseCustomer.purchase_count,
            totalSpent: supabaseCustomer.total_spent,
            avgOrderValue: supabaseCustomer.avg_order_value,
            riskScore: supabaseCustomer.risk_score,
            segment: supabaseCustomer.segment as 'low-risk' | 'medium-risk' | 'high-risk',
            age: supabaseCustomer.age,
            gender: supabaseCustomer.gender,
            tenure: supabaseCustomer.tenure,
            createdAt: supabaseCustomer.created_at ? new Date(supabaseCustomer.created_at) : undefined,
            updatedAt: supabaseCustomer.updated_at ? new Date(supabaseCustomer.updated_at) : undefined
          };
          
          console.log("✅ Supabase customer loaded:", customerData);
          setCustomer(customerData);
        } else {
          setError("Customer not found");
        }
      } catch (err) {
        console.error("❌ Error fetching Supabase customer:", err);
        setError("Failed to load customer data from Supabase");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">{error}</h1>
        <Button onClick={() => navigate("/customers")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/customers")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>

      <CustomerHeader 
        customer={customer} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <Tabs value={activeTab} className="mt-6">
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RiskAssessment customer={customer} />
                <CustomerValue customer={customer} />
              </div>
              <RecommendedActions customer={customer} />
            </div>
            
            <div className="lg:col-span-1">
              <AIChurnAnalysis customerData={customer} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="purchases">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Purchase History</h3>
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  <p>Last purchase: {formatDate(customer.lastPurchaseDate)}</p>
                  <p>Purchase frequency: {customer.purchaseCount || 0} orders</p>
                  <p>Average order value: {formatCurrency(customer.avgOrderValue)}</p>
                  <p>Total spent: {formatCurrency(customer.totalSpent)}</p>
                </div>
                <p className="text-gray-500">Detailed purchase history will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Customer Engagement</h3>
              <p className="text-gray-500">Customer engagement data will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerProfile;