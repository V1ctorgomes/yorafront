export type AnalyticsPeriodPreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "year"
  | "custom";

export interface AnalyticsPeriod {
  preset: AnalyticsPeriodPreset;
  from: string;
  to: string;
}

export interface AnalyticsKpis {
  totalRevenue: number;
  periodRevenue: number;
  grossRevenue: number;
  netRevenue: number;
  collectedRevenue: number;
  totalCollectedRevenue: number;
  totalOrders: number;
  periodOrders: number;
  averageTicket: number;
  averageCollectedTicket: number;
  paidOrders: number;
  cancelledOrders: number;
  newCustomers: number;
  activeCustomers: number;
  recurringCustomers: number;
  productsSold: number;
  conversionRate: number | null;
}

export interface AnalyticsRevenuePoint {
  date: string;
  gross: number;
  net: number;
  collected: number;
}

export interface AnalyticsOrdersPoint {
  date: string;
  count: number;
}

export interface AnalyticsTopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface AnalyticsCategoryBreakdown {
  categoryId: string;
  categoryName: string;
  revenue: number;
  percentage: number;
}

export interface AnalyticsCollectionRanking {
  collectionId: string;
  collectionName: string;
  revenue: number;
  orderCount: number;
}

export interface AnalyticsMethodBreakdown {
  method: string;
  count: number;
  percentage: number;
}

export interface AnalyticsLowStockItem {
  productName: string;
  sku: string;
  color: string;
  size: string;
  stock: number;
  threshold: number;
}

export interface AnalyticsRecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface AnalyticsPromotionsSummary {
  topPromotions: Array<{
    promotionId: string;
    name: string;
    code: string | null;
    usageCount: number;
  }>;
  totalDiscountGranted: number;
  promotionRevenue: number;
  ordersWithPromotion: number;
  conversionRate: number;
}

export interface AnalyticsDashboard {
  period: AnalyticsPeriod;
  kpis: AnalyticsKpis;
  revenueSeries: AnalyticsRevenuePoint[];
  ordersSeries: AnalyticsOrdersPoint[];
  topProducts: AnalyticsTopProduct[];
  categories: AnalyticsCategoryBreakdown[];
  collections: AnalyticsCollectionRanking[];
  paymentMethods: AnalyticsMethodBreakdown[];
  shippingMethods: AnalyticsMethodBreakdown[];
  lowStock: AnalyticsLowStockItem[];
  recentOrders: AnalyticsRecentOrder[];
  promotions: AnalyticsPromotionsSummary;
}

export const ANALYTICS_PERIOD_OPTIONS: Array<{
  value: AnalyticsPeriodPreset;
  label: string;
}> = [
  { value: "today", label: "Hoje" },
  { value: "yesterday", label: "Ontem" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "year", label: "Este ano" },
];
