
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsOverview from "@/components/dashboard/MetricsOverview";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import RecommendedActions from "@/components/dashboard/RecommendedActions";

const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Customer Analytics Dashboard</h1>
            <p className="text-gray-500">
              Overview of customer churn risk and retention metrics
            </p>
          </div>

          <MetricsOverview />
          <DashboardTabs />
          <RecommendedActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
