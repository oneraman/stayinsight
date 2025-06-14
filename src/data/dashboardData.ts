
export const trendData = [
  {
    name: "Jan",
    churnRate: 4.0,
    retention: 96.0,
  },
  {
    name: "Feb",
    churnRate: 3.8,
    retention: 96.2,
  },
  {
    name: "Mar",
    churnRate: 3.5,
    retention: 96.5,
  },
  {
    name: "Apr",
    churnRate: 4.2,
    retention: 95.8,
  },
  {
    name: "May",
    churnRate: 3.9,
    retention: 96.1,
  },
  {
    name: "Jun",
    churnRate: 3.2,
    retention: 96.8,
  },
];

export const segmentData = [
  {
    name: "High Value",
    atRisk: 12,
    stable: 78,
    growing: 10,
  },
  {
    name: "Mid Value",
    atRisk: 18,
    stable: 65,
    growing: 17,
  },
  {
    name: "Low Value",
    atRisk: 25,
    stable: 55,
    growing: 20,
  },
];

export const customerData = [
  { 
    id: "c1", 
    customerId: "c1",
    name: "Sarah Johnson", 
    email: "sarah@acmecorp.com", 
    riskScore: 82, 
    segment: "high-risk" as const,
    totalSpent: 15000,
    lastPurchaseDate: new Date(2023, 1, 15),
    purchaseCount: 12,
    avgOrderValue: 1250
  },
  { 
    id: "c2", 
    customerId: "c2",
    name: "Tom Martinez", 
    email: "tom@globex.com", 
    riskScore: 58, 
    segment: "medium-risk" as const,
    totalSpent: 8500,
    lastPurchaseDate: new Date(2023, 3, 22),
    purchaseCount: 8,
    avgOrderValue: 1062.50
  },
  { 
    id: "c3", 
    customerId: "c3",
    name: "Emma Wilson", 
    email: "emma@stark.com", 
    riskScore: 76, 
    segment: "high-risk" as const,
    totalSpent: 22000,
    lastPurchaseDate: new Date(2023, 2, 8),
    purchaseCount: 15,
    avgOrderValue: 1466.67
  },
  { 
    id: "c4", 
    customerId: "c4",
    name: "David Chen", 
    email: "david@wayne.com", 
    riskScore: 32, 
    segment: "medium-risk" as const,
    totalSpent: 5000,
    lastPurchaseDate: new Date(2023, 5, 10),
    purchaseCount: 4,
    avgOrderValue: 1250
  },
  { 
    id: "c5", 
    customerId: "c5",
    name: "Lisa Park", 
    email: "lisa@hooli.com", 
    riskScore: 62, 
    segment: "medium-risk" as const,
    totalSpent: 10000,
    lastPurchaseDate: new Date(2023, 4, 15),
    purchaseCount: 9,
    avgOrderValue: 1111.11
  },
];
