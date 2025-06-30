
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
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

  return { customer, loading, error };
};
