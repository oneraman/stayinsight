
import { CustomerData } from "@/utils/dataProcessing";

export const formatDate = (date: Date | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

export const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return "N/A";
  return `$${value.toFixed(2)}`;
};

export const getRecommendations = (customer: CustomerData) => {
  if (!customer) return [];
  
  const recommendations = [];
  
  if (customer.segment === 'high-risk') {
    recommendations.push({
      title: "Offer renewal discount",
      description: "Provide a 15% discount on the next subscription renewal to incentivize staying.",
    });
    recommendations.push({
      title: "Executive outreach",
      description: "Schedule a call with a company executive to discuss customer needs and concerns.",
    });
  } else if (customer.segment === 'medium-risk') {
    recommendations.push({
      title: "Engagement campaign",
      description: "Send targeted emails highlighting unused features of their subscription.",
    });
    recommendations.push({
      title: "Feature education",
      description: "Invite to a product webinar or provide custom tutorials for better product usage.",
    });
  } else {
    recommendations.push({
      title: "Upsell opportunity",
      description: "This customer may be ready for a premium plan upgrade.",
    });
    recommendations.push({
      title: "Referral request",
      description: "Ask this loyal customer for referrals to similar businesses.",
    });
  }
  
  return recommendations;
};

export const getRiskColor = (segment: string | undefined) => {
  switch (segment) {
    case 'high-risk':
      return "text-red-500";
    case 'medium-risk':
      return "text-yellow-500";
    case 'low-risk':
      return "text-green-500";
    default:
      return "text-gray-500";
  }
};
