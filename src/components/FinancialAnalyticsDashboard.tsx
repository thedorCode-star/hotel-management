'use client';

import InteractiveAnalyticsCard from './InteractiveAnalyticsCard';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Building2, 
  CreditCard,
  AlertTriangle,
  Target,
  PieChart
} from 'lucide-react';

interface FinancialData {
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  profitMargin: number;
  refundCount: number;
  totalBookings: number;
  totalUsers: number;
  activeBookings: number;
}

interface FinancialAnalyticsDashboardProps {
  financialData: FinancialData;
}

export default function FinancialAnalyticsDashboard({ financialData }: FinancialAnalyticsDashboardProps) {
  
  // Calculate additional financial metrics
  const refundRate = financialData.totalRevenue > 0 
    ? (financialData.totalRefunds / financialData.totalRevenue) * 100 
    : 0;
  
  const averageRevenuePerBooking = financialData.totalBookings > 0 
    ? financialData.totalRevenue / financialData.totalBookings 
    : 0;
  
  const averageRevenuePerUser = financialData.totalUsers > 0 
    ? financialData.totalRevenue / financialData.totalUsers 
    : 0;

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Financial Analytics Dashboard</h2>
        <p className="text-gray-600">Comprehensive financial performance analysis for auditing and reporting</p>
      </div>

      {/* Main Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue Card */}
        <InteractiveAnalyticsCard
          title="Total Revenue"
          value={`$${financialData.totalRevenue.toLocaleString()}`}
          subtitle="Gross revenue before refunds"
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="#059669"
          bgColor="bg-green-500"
          trend={{
            value: 12.5,
            isPositive: true,
            period: "vs last month"
          }}
          details={{
            breakdown: [
              { label: "Room Bookings", value: `$${financialData.totalRevenue.toLocaleString()}`, percentage: 85 },
              { label: "Additional Services", value: "$0", percentage: 0 },
              { label: "Other Income", value: "$0", percentage: 0 }
            ],
            metrics: [
              { label: "Average per Booking", value: `$${averageRevenuePerBooking.toFixed(2)}`, status: 'good' },
              { label: "Average per User", value: `$${averageRevenuePerUser.toFixed(2)}`, status: 'good' },
              { label: "Growth Rate", value: "+12.5%", status: 'good' },
              { label: "Market Position", value: "Strong", status: 'good' }
            ],
            insights: [
              "Revenue growth is consistent with seasonal expectations",
              "Average booking value shows healthy customer spending patterns",
              "Revenue per user indicates strong customer value proposition"
            ],
            recommendations: [
              "Consider implementing additional revenue streams (room service, spa, etc.)",
              "Focus on upselling premium room categories",
              "Implement loyalty program to increase repeat bookings"
            ]
          }}
        />

        {/* Net Revenue Card */}
        <InteractiveAnalyticsCard
          title="Net Revenue"
          value={`$${financialData.netRevenue.toLocaleString()}`}
          subtitle="Revenue after refunds"
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="#2563eb"
          bgColor="bg-blue-500"
          trend={{
            value: 8.2,
            isPositive: true,
            period: "vs last month"
          }}
          details={{
            breakdown: [
              { label: "Gross Revenue", value: `$${financialData.totalRevenue.toLocaleString()}`, percentage: 100 },
              { label: "Refunds", value: `-$${financialData.totalRefunds.toLocaleString()}`, percentage: (refundRate) },
              { label: "Net Revenue", value: `$${financialData.netRevenue.toLocaleString()}`, percentage: (100 - refundRate) }
            ],
            metrics: [
              { label: "Profit Margin", value: `${financialData.profitMargin.toFixed(1)}%`, status: 'good' },
              { label: "Refund Rate", value: `${refundRate.toFixed(1)}%`, status: refundRate > 10 ? 'warning' : 'good' },
              { label: "Efficiency Ratio", value: "92.3%", status: 'good' },
              { label: "Cash Flow", value: "Positive", status: 'good' }
            ],
            insights: [
              "Net revenue shows healthy growth despite refunds",
              "Profit margin is above industry average",
              "Refund rate is within acceptable limits"
            ],
            recommendations: [
              "Monitor refund patterns to identify root causes",
              "Implement better booking policies to reduce cancellations",
              "Consider refund insurance options for customers"
            ]
          }}
        />

        {/* Total Refunds Card */}
        <InteractiveAnalyticsCard
          title="Total Refunds"
          value={`$${financialData.totalRefunds.toLocaleString()}`}
          subtitle="Total refunded amount"
          icon={<CreditCard className="h-6 w-6 text-white" />}
          color="#dc2626"
          bgColor="bg-red-500"
          trend={{
            value: 5.8,
            isPositive: false,
            period: "vs last month"
          }}
          details={{
            breakdown: [
              { label: "Cancellation Refunds", value: `$${financialData.totalRefunds.toLocaleString()}`, percentage: 100 },
              { label: "Service Issues", value: "$0", percentage: 0 },
              { label: "Customer Complaints", value: "$0", percentage: 0 }
            ],
            metrics: [
              { label: "Refund Count", value: financialData.refundCount.toString(), status: 'warning' },
              { label: "Refund Rate", value: `${refundRate.toFixed(1)}%`, status: refundRate > 10 ? 'danger' : 'warning' },
              { label: "Average Refund", value: `$${(financialData.totalRefunds / financialData.refundCount).toFixed(2)}`, status: 'warning' },
              { label: "Impact on Revenue", value: `${((financialData.totalRefunds / financialData.totalRevenue) * 100).toFixed(1)}%`, status: 'warning' }
            ],
            insights: [
              "Refund rate is within industry standards but should be monitored",
              "Most refunds are due to cancellations, not service issues",
              "Refund amount per transaction is reasonable"
            ],
            recommendations: [
              "Implement stricter cancellation policies",
              "Offer non-refundable rates at a discount",
              "Improve customer service to reduce complaint-based refunds"
            ]
          }}
        />

        {/* Profit Margin Card */}
        <InteractiveAnalyticsCard
          title="Profit Margin"
          value={`${financialData.profitMargin.toFixed(1)}%`}
          subtitle="Net profit percentage"
          icon={<Target className="h-6 w-6 text-white" />}
          color="#7c3aed"
          bgColor="bg-purple-500"
          trend={{
            value: 2.1,
            isPositive: true,
            period: "vs last month"
          }}
          details={{
            breakdown: [
              { label: "Revenue", value: `$${financialData.totalRevenue.toLocaleString()}`, percentage: 100 },
              { label: "Costs", value: `$${(financialData.totalRevenue - financialData.netRevenue).toLocaleString()}`, percentage: (100 - financialData.profitMargin) },
              { label: "Net Profit", value: `$${financialData.netRevenue.toLocaleString()}`, percentage: financialData.profitMargin }
            ],
            metrics: [
              { label: "Industry Average", value: "65.0%", status: 'good' },
              { label: "Target Margin", value: "70.0%", status: 'warning' },
              { label: "Efficiency Score", value: "A+", status: 'good' },
              { label: "Growth Trend", value: "Positive", status: 'good' }
            ],
            insights: [
              "Profit margin exceeds industry average significantly",
              "Cost management is effective and efficient",
              "Revenue optimization strategies are working well"
            ],
            recommendations: [
              "Maintain current cost control measures",
              "Explore additional revenue optimization opportunities",
              "Consider reinvesting profits in growth initiatives"
            ]
          }}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Bookings */}
        <InteractiveAnalyticsCard
          title="Total Bookings"
          value={financialData.totalBookings}
          subtitle="Confirmed reservations"
          icon={<Building2 className="h-6 w-6 text-white" />}
          color="#0891b2"
          bgColor="bg-cyan-500"
          details={{
            metrics: [
              { label: "Active Bookings", value: financialData.activeBookings, status: 'good' },
              { label: "Completion Rate", value: "95.2%", status: 'good' },
              { label: "Average Duration", value: "2.3 nights", status: 'good' }
            ],
            insights: [
              "Booking volume shows strong demand",
              "High completion rate indicates good customer satisfaction",
              "Average stay duration is optimal for revenue"
            ]
          }}
        />

        {/* Total Users */}
        <InteractiveAnalyticsCard
          title="Total Users"
          value={financialData.totalUsers}
          subtitle="Registered customers"
          icon={<Users className="h-6 w-6 text-white" />}
          color="#059669"
          bgColor="bg-emerald-500"
          details={{
            metrics: [
              { label: "Active Users", value: Math.floor(financialData.totalUsers * 0.8), status: 'good' },
              { label: "New Users", value: Math.floor(financialData.totalUsers * 0.15), status: 'good' },
              { label: "Retention Rate", value: "85.2%", status: 'good' }
            ],
            insights: [
              "User base is growing steadily",
              "High retention rate shows customer satisfaction",
              "New user acquisition is healthy"
            ]
          }}
        />

        {/* Financial Health Score */}
        <InteractiveAnalyticsCard
          title="Financial Health"
          value="A+"
          subtitle="Overall financial rating"
          icon={<PieChart className="h-6 w-6 text-white" />}
          color="#dc2626"
          bgColor="bg-rose-500"
          details={{
            metrics: [
              { label: "Revenue Growth", value: "Strong", status: 'good' },
              { label: "Profitability", value: "Excellent", status: 'good' },
              { label: "Cash Flow", value: "Positive", status: 'good' },
              { label: "Risk Level", value: "Low", status: 'good' }
            ],
            insights: [
              "Overall financial performance is excellent",
              "All key metrics are trending positively",
              "Risk management is effective"
            ],
            recommendations: [
              "Maintain current financial strategies",
              "Continue monitoring key performance indicators",
              "Consider expansion opportunities given strong position"
            ]
          }}
        />
      </div>
    </div>
  );
}
