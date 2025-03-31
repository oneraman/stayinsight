
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import CustomerHeader from "@/components/customer-profile/CustomerHeader";
import RiskAssessment from "@/components/customer-profile/RiskAssessment";
import CustomerValue from "@/components/customer-profile/CustomerValue";
import RecommendedActions from "@/components/customer-profile/RecommendedActions";
import { useCustomerProfile } from "@/hooks/useCustomerProfile";
import { formatDate, formatCurrency, getRecommendations, getRiskColor } from "@/utils/customerUtils";

const CustomerProfile = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { customer, loading, error } = useCustomerProfile(customerId);

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
            {/* Customer Header */}
            <CustomerHeader 
              customer={customer} 
              formatDate={formatDate} 
            />

            {/* Risk Assessment and Customer Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RiskAssessment 
                customer={customer} 
                getRiskColor={getRiskColor} 
                formatDate={formatDate} 
              />
              
              <CustomerValue 
                customer={customer} 
                formatCurrency={formatCurrency} 
              />
            </div>

            {/* Recommended Actions */}
            <RecommendedActions 
              customer={customer} 
              getRecommendations={getRecommendations} 
            />
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
