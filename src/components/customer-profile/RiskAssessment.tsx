
import { CustomerData } from "@/utils/dataProcessing";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getRiskColor, formatDate } from "@/utils/customerUtils";

interface RiskAssessmentProps {
  customer: CustomerData;
}

const RiskAssessment = ({ customer }: RiskAssessmentProps) => {
  // Convert string to number and handle null/undefined
  const riskScoreValue = customer.riskScore ? Number(customer.riskScore) : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Risk Score</span>
            <span className="text-sm font-bold">{customer.riskScore || 0}</span>
          </div>
          <Progress 
            value={riskScoreValue} 
            className={`h-2 bg-gray-200 ${getRiskColor(customer.segment)}`}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Segment</p>
            <p className="font-medium">{customer.segment || "Unknown"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Last Purchase</p>
            <p className="font-medium">{formatDate(customer.lastPurchaseDate)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Purchase Frequency</p>
            <p className="font-medium">{customer.purchaseFrequency || "N/A"} days</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Churn Probability</p>
            <p className="font-medium">{customer.churnProbability || 0}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskAssessment;
