
import ActionInsightCard from "./ActionInsightCard";

const ActionInsightsSection = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Insights & Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActionInsightCard
          type="warning"
          title="High-Value Customers at Risk"
          description="3 customers with LTV >$5,000 have been identified as high churn risk."
          action="View Customers"
          onAction={() => console.log("View high-risk customers")}
        />
        <ActionInsightCard
          type="tip"
          title="Retention Opportunity"
          description="Send targeted offers to 15 medium-risk customers before they churn."
          action="Create Campaign"
          onAction={() => console.log("Create campaign")}
        />
        <ActionInsightCard
          type="info"
          title="Churn Rate Increasing"
          description="Churn has increased 2.5% in the last 30 days compared to previous period."
          action="See Analysis"
          onAction={() => console.log("See analysis")}
        />
        <ActionInsightCard
          type="tip"
          title="Import More Data"
          description="Upload purchase history to improve prediction accuracy by 35%."
          action="Upload Data"
          onAction={() => console.log("Upload data")}
        />
      </div>
    </div>
  );
};

export default ActionInsightsSection;
