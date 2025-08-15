'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, X, BarChart3, PieChart, Activity, Target, AlertTriangle, CheckCircle
} from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: { value: number; isPositive: boolean; period: string; };
  details?: {
    breakdown?: Array<{ label: string; value: string | number; percentage: number }>;
    metrics?: Array<{ label: string; value: string | number; status: 'good' | 'warning' | 'danger' }>;
    insights?: string[];
    recommendations?: string[];
  };
}

export default function InteractiveAnalyticsCard({
  title, value, subtitle, icon, color, bgColor, trend, details
}: AnalyticsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: 'good' | 'warning' | 'danger') => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'danger': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'danger') => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'danger': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Main Card */}
      <Card 
        className={`group cursor-pointer transition-all duration-500 ease-out hover:duration-300 transform hover:scale-[1.02] hover:-translate-y-1 border-0 shadow-lg hover:shadow-2xl overflow-hidden relative`}
        onClick={() => setIsExpanded(true)}
        style={{
          background: `linear-gradient(135deg, white 0%, ${color}08 100%)`,
          border: `1px solid ${color}20`
        }}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-white/5 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500 opacity-0 group-hover:opacity-100" />
        
        {/* Animated border effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-transparent group-hover:via-white/20 group-hover:to-transparent transition-all duration-700 transform translate-x-[-100%] group-hover:translate-x-[100%]" />
        
        <CardHeader className="pb-4 pt-6 px-6">
          <div className="flex items-center justify-between">
            {/* Enhanced Icon Container */}
            <div 
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3`}
              style={{
                background: `linear-gradient(135deg, ${bgColor} 0%, ${color} 100%)`,
                boxShadow: `0 8px 32px ${color}40`
              }}
            >
              <div className="transform group-hover:scale-110 transition-transform duration-300">
                {icon}
              </div>
            </div>
            
            {/* Enhanced Trend Indicator */}
            {trend && (
              <div className={`flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 transform group-hover:scale-105 ${
                trend.isPositive 
                  ? 'bg-green-50 text-green-700 border border-green-200 group-hover:bg-green-100 group-hover:border-green-300' 
                  : 'bg-red-50 text-red-700 border border-red-200 group-hover:bg-red-100 group-hover:border-red-300'
              }`}>
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 mr-2 animate-pulse" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-2 animate-pulse" />
                )}
                <span className="font-semibold">{trend.value}%</span>
                <span className="ml-1 text-xs opacity-75">{trend.period}</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          <div className="text-center space-y-3">
            {/* Enhanced Value Display */}
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                {typeof value === 'number' && value >= 1000 
                  ? `$${(value / 1000).toFixed(1)}K` 
                  : typeof value === 'number' 
                    ? `$${value.toLocaleString()}` 
                    : value
                }
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 font-medium">
                {subtitle}
              </p>
            </div>
            
            {/* Enhanced Title with Badge */}
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors duration-300">
              <span className="text-xs font-medium text-gray-700 group-hover:text-gray-800">
                {title}
              </span>
            </div>
            
            {/* Interactive Hint */}
            <div className="pt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 group-hover:text-gray-600">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
                <span className="font-medium">Click for detailed analysis</span>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 50%, rgba(79, 70, 229, 0.3) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}>
          <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-200/50 backdrop-blur-sm">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-blue-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shadow-lg`}>
                  {icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{title}</h2>
                  <p className="text-blue-700 font-medium">{subtitle}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white hover:text-white transition-all duration-200 shadow-md"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="text-3xl font-bold text-blue-700 mb-2">
                    {typeof value === 'number' && value >= 1000 
                      ? `$${(value / 1000).toFixed(1)}K` 
                      : typeof value === 'number' 
                        ? `$${value.toLocaleString()}` 
                        : value
                    }
                  </div>
                  <div className="text-sm text-blue-600 font-medium">Current Value</div>
                </div>
                {trend && (
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className={`text-3xl font-bold mb-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {trend.isPositive ? '+' : ''}{trend.value}%
                    </div>
                    <div className="text-sm text-green-600 font-medium">{trend.period}</div>
                  </div>
                )}
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    <BarChart3 className="h-8 w-8 mx-auto" />
                  </div>
                  <div className="text-sm text-purple-600 font-medium">Analytics</div>
                </div>
              </div>

              {/* Breakdown Analysis */}
              {details?.breakdown && (
                <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 border border-blue-200/50 shadow-sm">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                    Breakdown Analysis
                  </h3>
                  <div className="space-y-3">
                    {details.breakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-blue-100/50 hover:bg-white/90 transition-all duration-200">
                        <span className="text-sm text-blue-800 font-medium">{item.label}</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-bold text-blue-900">{item.value}</span>
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                            {item.percentage}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Performance Metrics */}
              {details?.metrics && (
                <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-2xl p-6 border border-green-200/50 shadow-sm">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-green-600" />
                    Key Performance Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {details.metrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-green-100/50 hover:bg-white/90 transition-all duration-200">
                        <span className="text-sm text-green-800 font-medium">{metric.label}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-green-900">{metric.value}</span>
                          <Badge className={`text-xs ${getStatusColor(metric.status)}`}>
                            {getStatusIcon(metric.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Insights */}
              {details?.insights && (
                <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl p-6 border border-indigo-200/50 shadow-sm">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                    Financial Insights
                  </h3>
                  <ul className="space-y-3">
                    {details.insights.map((insight, index) => (
                      <li key={index} className="flex items-start space-x-3 p-3 bg-white/70 rounded-xl border border-indigo-100/50 hover:bg-white/90 transition-all duration-200">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-indigo-800 font-medium">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Auditor Recommendations */}
              {details?.recommendations && (
                <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-2xl p-6 border border-emerald-200/50 shadow-sm">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-emerald-600" />
                    Auditor Recommendations
                  </h3>
                  <ul className="space-y-3">
                    {details.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start space-x-3 p-3 bg-white/70 rounded-xl border border-emerald-100/50 hover:bg-white/90 transition-all duration-200">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-emerald-800 font-medium">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-blue-200/50 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
              <div className="text-sm text-blue-600 font-medium">
                Click outside to close • Data refreshes automatically
              </div>
              <Button
                onClick={() => setIsExpanded(false)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
