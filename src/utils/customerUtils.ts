
import { CustomerData } from "@/utils/dataProcessing";

// Function to format date to a readable string
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format currency values
export const formatCurrency = (value: number | undefined): string => {
  if (value === undefined) return "N/A";
  return `$${value.toFixed(2)}`;
};

// Get color based on risk score
export const getRiskColor = (score: number | undefined): string => {
  if (!score && score !== 0) return 'bg-gray-200';
  
  if (score < 30) return 'bg-green-500';
  if (score < 70) return 'bg-yellow-500';
  return 'bg-red-500';
};

// Get recommendations based on customer data
export const getRecommendations = (customer: CustomerData) => {
  const recommendations = [];
  
  if (customer.riskScore && customer.riskScore > 70) {
    recommendations.push({
      title: "Immediate Outreach",
      description: "This customer is at high risk of churning. Schedule a personal call to address concerns.",
    });
    recommendations.push({
      title: "Loyalty Discount",
      description: "Offer a special discount on their next purchase to incentivize loyalty.",
    });
  } else if (customer.riskScore && customer.riskScore > 40) {
    recommendations.push({
      title: "Re-engagement Email",
      description: "Send a personalized email with product recommendations based on past purchases.",
    });
    recommendations.push({
      title: "Feedback Survey",
      description: "Request feedback to understand potential pain points and areas for improvement.",
    });
  } else {
    recommendations.push({
      title: "Upsell Opportunity",
      description: "This loyal customer may be interested in premium offerings or complementary products.",
    });
    recommendations.push({
      title: "Referral Program",
      description: "Invite this satisfied customer to participate in your referral program.",
    });
  }
  
  if (customer.purchaseCount && customer.purchaseCount < 2) {
    recommendations.push({
      title: "First Purchase Follow-up",
      description: "Send a thank you message and request feedback on their first experience.",
    });
  }
  
  return recommendations;
};

// Get risk status text and color based on risk score
export const getRiskStatus = (score: number | undefined) => {
  if (!score && score !== 0) return { text: 'Unknown', color: 'gray' };
  
  if (score < 30) return { text: 'Low Risk', color: 'green' };
  if (score < 70) return { text: 'Medium Risk', color: 'yellow' };
  return { text: 'High Risk', color: 'red' };
};

// Get segment description based on risk score
export const getSegmentDescription = (score: number | undefined) => {
  if (!score && score !== 0) return 'Not enough data to determine segment';
  
  if (score < 30) return 'Loyal customer with strong engagement and regular purchases';
  if (score < 70) return 'Average engagement with occasional purchases';
  return 'At risk of churning with declining engagement';
};
