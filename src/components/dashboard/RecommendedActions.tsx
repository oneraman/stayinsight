
import RetentionActionCard from "@/components/RetentionActionCard";

const RecommendedActions = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Recommended Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RetentionActionCard
          title="Send Renewal Offer"
          description="12 high-value customers have subscriptions expiring in the next 30 days."
          actionType="offer"
          impactScore={85}
          actionText="View Customers"
          onActionClick={() => console.log("View customers clicked")}
        />
        <RetentionActionCard
          title="Follow Up on Support Tickets"
          description="8 customers with open support tickets for more than 48 hours."
          actionType="call"
          impactScore={60}
          actionText="View Tickets"
          onActionClick={() => console.log("View tickets clicked")}
        />
        <RetentionActionCard
          title="Re-engagement Campaign"
          description="22 customers showing decreased usage in the last 14 days."
          actionType="email"
          impactScore={60}
          actionText="Create Campaign"
          onActionClick={() => console.log("Create campaign clicked")}
        />
      </div>
    </div>
  );
};

export default RecommendedActions;
