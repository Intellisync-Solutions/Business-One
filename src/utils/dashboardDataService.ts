import { useEffect, useState } from 'react';

// Define types for our dashboard data
export interface FinancialMetric {
  name: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface BusinessInsight {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
}

export interface RecentCalculation {
  id: string;
  type: string;
  date: string; // Formatted date string
  result: string;
  timestamp: number; // Raw timestamp for sorting
}

export interface DashboardData {
  financialMetrics: FinancialMetric[];
  businessInsights: BusinessInsight[];
  recentCalculations: RecentCalculation[];
}

// Constants for localStorage keys used in the application
const STORAGE_KEYS = {
  BREAK_EVEN: 'break-even-analysis',
  SCENARIO_PLANNER: 'scenario-planner',
  PRICING_STRATEGY: 'pricing-strategy',
  STARTUP_COSTS: 'startup-costs',
  FINANCIAL_RATIOS: 'financial-ratios',
  BUSINESS_VALUATION: 'business-valuation',
  CALCULATOR_STATES: 'intellisync_calculator_states',
};

// Helper function to format currency values
const formatCurrency = (value: number): string => {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Helper function to calculate percentage change
const calculateChange = (current: number, previous: number): { change: string; trend: 'up' | 'down' | 'neutral' } => {
  if (previous === 0) return { change: '+0%', trend: 'neutral' };
  
  const percentChange = ((current - previous) / previous) * 100;
  const trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral';
  const formattedChange = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;
  
  return { change: formattedChange, trend };
};

// Extract recent calculations from localStorage
const extractRecentCalculations = (): RecentCalculation[] => {
  try {
    const calculatorStates = localStorage.getItem(STORAGE_KEYS.CALCULATOR_STATES);
    if (!calculatorStates) return [];
    
    const states = JSON.parse(calculatorStates);
    if (!Array.isArray(states)) return [];
    
    return states.map(state => ({
      id: state.id,
      type: state.calculatorType,
      date: new Date(state.timestamp).toLocaleString(),
      result: getResultSummary(state),
      timestamp: state.timestamp,
    }))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5); // Get only the 5 most recent calculations
  } catch (error) {
    console.error('Error extracting recent calculations:', error);
    return [];
  }
};

// Helper function to get a summary of the calculation result
const getResultSummary = (state: any): string => {
  try {
    switch (state.calculatorType) {
      case 'break-even-analysis':
        if (state.state && state.state.mode === 'standard') {
          return `Break-even point: ${Math.round(state.state.breakEvenUnits || 0)} units`;
        }
        return 'Break-even analysis completed';
        
      case 'pricing-strategy':
        if (state.state && state.state.recommendedPrice) {
          return `Optimal price: ${formatCurrency(state.state.recommendedPrice)}`;
        }
        return 'Pricing strategy analysis completed';
        
      case 'scenario-planner':
        if (state.state && state.state.scenarios && state.state.scenarios.optimistic) {
          return `Best case ROI: ${(state.state.scenarios.optimistic.roi || 0).toFixed(1)}%`;
        }
        return 'Scenario planning completed';
        
      case 'financial-ratios':
        return 'Financial ratio analysis completed';
        
      case 'business-valuation':
        if (state.state && state.state.businessValue) {
          return `Business value: ${formatCurrency(state.state.businessValue)}`;
        }
        return 'Business valuation completed';
        
      case 'startup-costs':
        if (state.state && state.state.totalCost) {
          return `Total startup cost: ${formatCurrency(state.state.totalCost)}`;
        }
        return 'Startup cost analysis completed';
        
      default:
        return `${state.calculatorType} calculation completed`;
    }
  } catch (error) {
    console.error('Error getting result summary:', error);
    return 'Calculation completed';
  }
};

// Extract financial metrics from localStorage
const extractFinancialMetrics = (): FinancialMetric[] => {
  try {
    // Get data from various calculators
    const scenarioData = localStorage.getItem(STORAGE_KEYS.SCENARIO_PLANNER);
    const startupCostsData = localStorage.getItem(STORAGE_KEYS.STARTUP_COSTS);
    
    // Parse the data
    const scenario = scenarioData ? JSON.parse(scenarioData) : null;
    const startupCosts = startupCostsData ? JSON.parse(startupCostsData) : null;
    
    // Calculate metrics
    const revenue = scenario?.scenarios?.base?.revenue || 125400;
    const prevRevenue = revenue * 0.92; // Simulated previous value
    const revenueChange = calculateChange(revenue, prevRevenue);
    
    const expenses = scenario?.scenarios?.base?.expenses || 
                    (startupCosts?.totalCost || 78200);
    const prevExpenses = expenses * 0.97; // Simulated previous value
    const expensesChange = calculateChange(expenses, prevExpenses);
    
    const profit = revenue - expenses;
    const prevProfit = prevRevenue - prevExpenses;
    const profitChange = calculateChange(profit, prevProfit);
    
    // Calculate cash flow (can be derived from scenario planner or simulated)
    const cashFlow = scenario?.scenarios?.base?.cashFlow || profit * 0.7;
    const prevCashFlow = cashFlow * 1.02; // Simulated previous value (showing a decline)
    const cashFlowChange = calculateChange(cashFlow, prevCashFlow);
    
    return [
      {
        name: 'Revenue',
        value: formatCurrency(revenue),
        change: revenueChange.change,
        trend: revenueChange.trend
      },
      {
        name: 'Expenses',
        value: formatCurrency(expenses),
        change: expensesChange.change,
        trend: expensesChange.trend
      },
      {
        name: 'Profit',
        value: formatCurrency(profit),
        change: profitChange.change,
        trend: profitChange.trend
      },
      {
        name: 'Cash Flow',
        value: formatCurrency(cashFlow),
        change: cashFlowChange.change,
        trend: cashFlowChange.trend
      }
    ];
  } catch (error) {
    console.error('Error extracting financial metrics:', error);
    return [];
  }
};

// Generate business insights based on the data
const generateBusinessInsights = (): BusinessInsight[] => {
  try {
    const insights: BusinessInsight[] = [];
    const metrics = extractFinancialMetrics();
    
    // Find the cash flow metric
    const cashFlowMetric = metrics.find(m => m.name === 'Cash Flow');
    if (cashFlowMetric && cashFlowMetric.trend === 'down') {
      insights.push({
        id: '1',
        title: 'Cash Flow Alert',
        description: 'Your projected cash flow is trending downward. Consider reviewing expenses.',
        priority: 'high',
        timestamp: Date.now()
      });
    }
    
    // Check break-even analysis
    const breakEvenData = localStorage.getItem(STORAGE_KEYS.BREAK_EVEN);
    if (breakEvenData) {
      const breakEven = JSON.parse(breakEvenData);
      if (breakEven && breakEven.contributionMargin > 0) {
        insights.push({
          id: '2',
          title: 'Break-Even Improvement',
          description: 'Your break-even point has improved based on your latest calculations.',
          priority: 'medium',
          timestamp: Date.now() - 86400000 // 1 day ago
        });
      }
    }
    
    // Check pricing strategy
    const pricingData = localStorage.getItem(STORAGE_KEYS.PRICING_STRATEGY);
    if (pricingData) {
      const pricing = JSON.parse(pricingData);
      if (pricing && pricing.recommendedPrice) {
        insights.push({
          id: '3',
          title: 'Pricing Opportunity',
          description: 'Market analysis suggests potential for price adjustment based on your latest calculations.',
          priority: 'medium',
          timestamp: Date.now() - 172800000 // 2 days ago
        });
      }
    }
    
    // If we don't have enough insights, add some default ones
    if (insights.length < 3) {
      if (!insights.find(i => i.id === '1')) {
        insights.push({
          id: '1',
          title: 'Cash Flow Management',
          description: 'Maintaining a healthy cash flow is critical. Consider setting up a cash reserve.',
          priority: 'medium',
          timestamp: Date.now()
        });
      }
      
      if (!insights.find(i => i.id === '2')) {
        insights.push({
          id: '2',
          title: 'Break-Even Analysis',
          description: 'Regularly update your break-even analysis to track business performance.',
          priority: 'medium',
          timestamp: Date.now() - 86400000
        });
      }
      
      if (!insights.find(i => i.id === '3')) {
        insights.push({
          id: '3',
          title: 'Pricing Strategy Review',
          description: 'Consider reviewing your pricing strategy quarterly to maximize profitability.',
          priority: 'medium',
          timestamp: Date.now() - 172800000
        });
      }
    }
    
    return insights.sort((a, b) => {
      // Sort by priority first (high > medium > low)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by timestamp (newest first)
      return b.timestamp - a.timestamp;
    });
  } catch (error) {
    console.error('Error generating business insights:', error);
    return [];
  }
};

// Custom hook to get dashboard data
export const useDashboardData = (): DashboardData => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    financialMetrics: [],
    businessInsights: [],
    recentCalculations: []
  });

  useEffect(() => {
    // Function to update dashboard data
    const updateDashboardData = () => {
      setDashboardData({
        financialMetrics: extractFinancialMetrics(),
        businessInsights: generateBusinessInsights(),
        recentCalculations: extractRecentCalculations()
      });
    };

    // Update data initially
    updateDashboardData();

    // Set up storage event listener to update when localStorage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (Object.values(STORAGE_KEYS).includes(event.key || '')) {
        updateDashboardData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return dashboardData;
};
