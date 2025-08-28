
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CustomerData } from "@/utils/dataProcessing";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useCustomerProfile = (customerId: string | undefined) => {
  const { currentUser } = useAuth();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) return;

      if (!currentUser) {
        setLoading(false);
        setError("Please log in to view customer data");
        return;
      }
      
      try {
        setLoading(true);
        
        // Query Supabase for the customer with matching customerId and user
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('customer_id', customerId)
          .eq('user_id', currentUser.id)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            setError("Customer not found or you don't have access to this customer");
          } else {
            console.error("Error fetching customer:", error);
            setError(error.message || "Failed to load customer data");
          }
          return;
        }

        if (data) {
          // Convert the Supabase data to match CustomerData interface
          const customerData: CustomerData = {
            id: data.id,
            customerId: data.customer_id,
            name: data.name || '',
            email: data.email || '',
            totalSpent: data.total_spent || 0,
            purchaseCount: data.purchase_count || 0,
            lastPurchaseDate: data.last_purchase_date ? new Date(data.last_purchase_date) : undefined,
            avgOrderValue: data.avg_order_value || 0,
            riskScore: data.risk_score || 50,
            segment: data.segment || 'medium-risk',
            age: data.age,
            tenure: data.tenure,
            supportCalls: data.support_calls || 0,
            paymentDelay: data.payment_delay || 0,
            usageFrequency: data.usage_frequency,
            subscriptionType: data.subscription_type,
            gender: data.gender
          };
          
          setCustomer(customerData);
        } else {
          setError("Customer not found or you don't have access to this customer");
        }
      } catch (err: any) {
        console.error("Error fetching customer:", err);
        setError(err.message || "Failed to load customer data");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId, currentUser]);

  return { customer, loading, error };
};
