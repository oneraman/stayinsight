
import { CustomerData } from "@/utils/dataProcessing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getRecommendations } from "@/utils/customerUtils";

interface RecommendedActionsProps {
  customer: CustomerData;
}

const RecommendedActions = ({ customer }: RecommendedActionsProps) => {
  return (
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
  );
};

export default RecommendedActions;
