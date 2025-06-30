
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CustomerData } from "@/utils/dataProcessing";
import { toast } from "sonner";

export const useCustomerProfile = (customerId: string | undefined) => {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Query Supabase for the customer with matching customerId
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('customer_id', customerId)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Transform Supabase data to match CustomerData interface
          const customerData: CustomerData = {
            id: data.id,
            customerId: data.customer_id,
            email: data.email,
            name: data.name,
            lastPurchaseDate: data.last_purchase_date ? new Date(data.last_purchase_date) : undefined,
            purchaseCount: data.purchase_count,
            totalSpent: data.total_spent,
            avgOrderValue: data.avg_order_value,
            riskScore: data.risk_score,
            segment: data.segment as 'low-risk' | 'medium-risk' | 'high-risk',
            age: data.age,
            gender: data.gender,
            tenure: data.tenure,
            usageFrequency: data.usage_frequency,
            supportCalls: data.support_calls,
            paymentDelay: data.payment_delay,
            subscriptionType: data.subscription_type,
            createdAt: data.created_at ? new Date(data.created_at) : undefined,
            updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
          };
          
          setCustomer(customerData);
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

  return { customer, loading, error };
};
