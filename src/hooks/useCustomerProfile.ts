
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CustomerData } from "@/utils/dataProcessing";
import { toast } from "sonner";

export const useCustomerProfile = (customerId: string | undefined) => {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) return;
      
      try {
        setLoading(true);
        
        // Query Supabase for the customer with matching customerId
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('customer_id', customerId)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            setError("Customer not found");
            toast.error("Customer not found");
          } else {
            console.error("Error fetching customer:", error);
            setError(error.message || "Failed to load customer data");
            toast.error("Failed to load customer data");
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
