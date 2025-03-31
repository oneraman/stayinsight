
import { TrendingDown } from "lucide-react";
import { CustomerData } from "@/utils/dataProcessing";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RiskAssessmentProps {
  customer: CustomerData;
  getRiskColor: (segment: string | undefined) => string;
  formatDate: (date: Date | undefined) => string;
}

const RiskAssessment = ({ customer, getRiskColor, formatDate }: RiskAssessmentProps) => {
  return (
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
                  Low average order value ({customer.avgOrderValue})
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
  );
};

export default RiskAssessment;
