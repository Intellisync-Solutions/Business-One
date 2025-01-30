interface CostBreakdown {
  fixed: number;
  variable: number;
  total: number;
}

export interface CostTotals {
  oneTime: CostBreakdown;
  monthly: CostBreakdown;
  inventory: CostBreakdown;
}

export interface FinancialMetrics {
  totalStartupCost: number;
  monthlyOperatingCost: number;
  recommendedCashReserve: number;
  totalInitialCapital: number;
}

export interface AnalysisRequest {
  costs: CostTotals;
  metrics: FinancialMetrics;
}

export const generateStartupAnalysisPrompt = (data: AnalysisRequest): string => {
  const { costs, metrics } = data;
  
  return `As a financial advisor, analyze the following startup cost breakdown and provide strategic insights:

COST BREAKDOWN:
One-Time Costs:
- Fixed: $${costs.oneTime.fixed.toLocaleString()}
- Variable: $${costs.oneTime.variable.toLocaleString()}
- Total: $${costs.oneTime.total.toLocaleString()}

Monthly Operating Costs:
- Fixed: $${costs.monthly.fixed.toLocaleString()}
- Variable: $${costs.monthly.variable.toLocaleString()}
- Total: $${costs.monthly.total.toLocaleString()}

Inventory Costs:
- Fixed: $${costs.inventory.fixed.toLocaleString()}
- Variable: $${costs.inventory.variable.toLocaleString()}
- Total: $${costs.inventory.total.toLocaleString()}

Key Metrics:
- Total Startup Cost: $${metrics.totalStartupCost.toLocaleString()}
- Monthly Operating Cost: $${metrics.monthlyOperatingCost.toLocaleString()}
- Recommended Cash Reserve: $${metrics.recommendedCashReserve.toLocaleString()}
- Total Initial Capital Required: $${metrics.totalInitialCapital.toLocaleString()}

Please analyze this cost structure and provide:
1. Key observations about the cost distribution
2. Potential areas of concern or risk
3. Recommendations for cost optimization
4. Suggestions for financial planning and funding strategy
5. Comparison with industry benchmarks (if applicable)

Please provide actionable insights that can help in decision-making.`
}
