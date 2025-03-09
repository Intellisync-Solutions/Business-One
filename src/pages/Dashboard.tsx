import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  ArrowRight,
  BarChart2,
  LineChart,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '@/utils/dashboardDataService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { financialMetrics, businessInsights, recentCalculations } = useDashboardData();

  // Force a refresh of dashboard data when localStorage changes
  const refreshDashboard = () => {
    // This will trigger a re-render with updated data
    window.dispatchEvent(new Event('storage'));
  };

  // Navigation handlers for quick access to tools
  const navigateTo = (path: string) => {
    navigate(path);
  };

  // Get icon for calculation type
  const getCalculationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'break-even analysis':
        return <BarChart className="h-4 w-4 text-primary" />;
      case 'pricing strategy':
        return <DollarSign className="h-4 w-4 text-primary" />;
      case 'scenario planning':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      default:
        return <Calculator className="h-4 w-4 text-primary" />;
    }
  };

  // Get priority color for insights
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Business Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshDashboard} title="Refresh dashboard data">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => navigateTo('/business-plan')}>
            View Business Plan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Business Tools & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access Tools */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Financial Tools</CardTitle>
            <CardDescription>Quick access to business calculators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigateTo('/calculators/break-even-analysis')}
              >
                <BarChart className="mr-2 h-4 w-4" />
                Break-Even Analysis
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigateTo('/calculators/pricing-strategy')}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Pricing Strategy
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigateTo('/calculators/scenario-planner')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Scenario Planner
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigateTo('/calculators/financial-ratios')}
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                Financial Ratios
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigateTo('/calculators/business-valuation')}
              >
                <LineChart className="mr-2 h-4 w-4" />
                Business Valuation
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Business Insights */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Business Insights</CardTitle>
            <CardDescription>AI-powered recommendations for your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {businessInsights.length > 0 ? (
                businessInsights.map(insight => (
                  <div key={insight.id} className="p-4 rounded-lg border border-border/40">
                    <div className="flex items-start">
                      <AlertCircle className={`mr-2 h-5 w-5 mt-0.5 ${getPriorityColor(insight.priority)}`} />
                      <div>
                        <h4 className="text-sm font-medium">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No insights available. Use the financial tools to generate insights.
                </div>
              )}
              <Button className="w-full" variant="secondary" onClick={() => navigateTo('/financial-analysis')}>
                View Full Financial Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Calculations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Calculations</CardTitle>
          <CardDescription>Results from your recent financial tools usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCalculations.length > 0 ? (
              recentCalculations.map(calc => (
                <div key={calc.id} className="flex items-start p-3 rounded-lg border border-border/40">
                  <div className="mr-3 mt-1">
                    {getCalculationIcon(calc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{calc.type}</p>
                    <p className="text-sm">{calc.result}</p>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <span>{calc.date}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No recent calculations found. Try using some of the financial tools.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
