/**
 * Enhanced Prompt Manager for Intellisync Business Suite
 * 
 * This module provides a comprehensive framework for generating high-quality
 * AI prompts that produce detailed, well-structured, and actionable financial
 * analyses using GPT-4o-mini.
 */

// Import base contexts
import {
  enhancedFinancialContext,
  startupBusinessContext,
  // These contexts are defined for future use in specialized analyses
  // establishedBusinessContext,
  // financialCrisisContext,
  investmentAnalysisContext,
  // taxOptimizationContext
} from './baseContexts';

// Import formatting instructions
import {
  enhancedFormatInstructions,
  standardOutputStructure,
  ratioAnalysisOutputStructure,
  cashFlowOutputStructure,
  breakEvenOutputStructure,
  investmentOutputStructure,
  valuationOutputStructure
} from './formatInstructions';

// Import expert roles
import {
  financialAdvisorRole,
  startupAdvisorRole,
  breakEvenAnalystRole,
  cashFlowSpecialistRole,
  investmentAnalystRole,
  valuationExpertRole,
  ratioAnalystRole,
  // Reserved for future tax-related analyses
  // taxStrategistRole
} from './expertRoles';

// Import types
import { AnalysisRequest } from '../analysisPrompts';
import { RatioCategoryMap, FinancialRatio } from '@/types/financial';

// Import utilities
import { formatCurrency } from '../currency';

/**
 * Core prompt generation function that combines all components
 * @param expertRole The expert role definition
 * @param baseContext The base context for the analysis
 * @param dataSection The data presentation section
 * @param analysisRequirements Specific requirements for the analysis
 * @param outputStructure The required output structure
 * @param additionalInstructions Any additional instructions
 * @returns A complete, structured prompt
 */
const generateStructuredPrompt = (
  expertRole: string,
  baseContext: string,
  dataSection: string,
  analysisRequirements: string,
  outputStructure: string,
  additionalInstructions?: string
): string => {
  return `${expertRole}

${baseContext}

${dataSection}

${analysisRequirements}

${outputStructure}

${enhancedFormatInstructions}${additionalInstructions ? `\n\n${additionalInstructions}` : ''}`;
};

/**
 * Enhanced prompt generator for startup cost analysis
 */
export const generateEnhancedStartupAnalysisPrompt = (data: AnalysisRequest): string => {
  const { costs, metrics } = data;
  
  const dataSection = `
STARTUP COST BREAKDOWN:

One-Time Costs:
- Fixed: ${formatCurrency(costs.oneTime.fixed)}
- Variable: ${formatCurrency(costs.oneTime.variable)}
- Total One-Time: ${formatCurrency(costs.oneTime.total)}

Monthly Operating Costs:
- Fixed: ${formatCurrency(costs.monthly.fixed)}
- Variable: ${formatCurrency(costs.monthly.variable)}
- Total Monthly: ${formatCurrency(costs.monthly.total)}

Inventory Costs:
- Fixed: ${formatCurrency(costs.inventory.fixed)}
- Variable: ${formatCurrency(costs.inventory.variable)}
- Total Inventory: ${formatCurrency(costs.inventory.total)}

Key Financial Metrics:
- Total Startup Cost: ${formatCurrency(metrics.totalStartupCost)}
- Monthly Operating Cost: ${formatCurrency(metrics.monthlyOperatingCost)}
- Recommended Cash Reserve: ${formatCurrency(metrics.recommendedCashReserve)}
- Total Initial Capital Required: ${formatCurrency(metrics.totalInitialCapital)}
`;

  const analysisRequirements = `
Based on this startup cost structure, provide a comprehensive analysis including:

1. Cost Distribution Assessment
   - Evaluate the balance between fixed and variable costs
   - Assess the proportion of one-time vs. ongoing costs
   - Identify any concerning cost allocations

2. Financial Risk Evaluation
   - Identify potential cash flow risks
   - Assess burn rate and runway implications
   - Evaluate financial sustainability

3. Cost Optimization Opportunities
   - Identify specific areas where costs could be reduced
   - Suggest alternative approaches to high-cost areas
   - Prioritize optimization opportunities by impact

4. Funding Strategy Recommendations
   - Suggest appropriate funding sources based on cost structure
   - Provide phased funding approach if appropriate
   - Outline key financial metrics for funding readiness

5. Benchmark Comparison
   - Compare cost structure to industry standards
   - Identify areas where costs deviate significantly from benchmarks
   - Suggest adjustments to align with industry best practices
`;

  return generateStructuredPrompt(
    startupAdvisorRole,
    enhancedFinancialContext + '\n' + startupBusinessContext,
    dataSection,
    analysisRequirements,
    standardOutputStructure
  );
};

/**
 * Enhanced prompt generator for financial ratio analysis
 */
export const generateEnhancedRatioAnalysisPrompt = (
  categoryName: string,
  ratio: FinancialRatio,
  value: number,
  allRatios?: Record<string, number>
): string => {
  const formattedValue = ratio.formatResult(value);
  
  let otherRatiosContext = '';
  if (allRatios && Object.keys(allRatios).length > 0) {
    otherRatiosContext = '\nRELATED FINANCIAL RATIOS:\n';
    
    for (const [name, val] of Object.entries(allRatios)) {
      // Skip the current ratio in the related ratios section
      if (name !== ratio.title) {
        otherRatiosContext += `- ${name}: ${typeof val === 'number' ? val.toFixed(2) : val}\n`;
      }
    }
  }
  
  const dataSection = `
RATIO ANALYSIS DATA:

Primary Ratio:
- Name: ${ratio.title}
- Category: ${categoryName}
- Value: ${formattedValue}
- Description: ${ratio.description}
${otherRatiosContext}`;

  const analysisRequirements = `
Provide a comprehensive analysis of this financial ratio including:

1. Ratio Interpretation
   - Explain what this specific value indicates about the business
   - Assess whether this value is favorable, neutral, or concerning
   - Identify potential causes for this ratio value

2. Industry Benchmark Comparison
   - Compare to industry standard ranges for this ratio
   - Assess performance relative to competitors and industry averages
   - Identify competitive advantages or disadvantages indicated by this ratio

3. Business Impact Assessment
   - Explain how this ratio affects overall business performance
   - Identify specific business areas impacted by this ratio
   - Assess potential consequences if this ratio remains unchanged

4. Improvement Strategies
   - Provide specific, actionable recommendations to improve this ratio
   - Prioritize recommendations by potential impact and implementation difficulty
   - Include expected outcomes and timeframes for each recommendation

5. Monitoring Framework
   - Suggest appropriate targets for this ratio
   - Recommend related metrics to monitor alongside this ratio
   - Provide early warning indicators for potential deterioration
`;

  return generateStructuredPrompt(
    ratioAnalystRole,
    enhancedFinancialContext,
    dataSection,
    analysisRequirements,
    ratioAnalysisOutputStructure
  );
};

/**
 * Enhanced prompt generator for break-even analysis
 */
export const generateEnhancedBreakEvenAnalysisPrompt = (
  breakEvenData: {
    fixedCosts: number;
    variableCostPerUnit: number;
    sellingPricePerUnit: number;
    mode: 'standard' | 'findPrice' | 'findUnits' | 'profitTarget';
    targetUnits?: number;
    targetProfit?: number;
    targetProfitPercentage?: number;
  },
  breakEvenResult: {
    breakEvenUnits?: number;
    breakEvenPrice?: number;
    totalRevenueAtBreakEven?: number;
    contributionMargin?: number;
    profitMargin?: number;
    requiredPrice?: number;
    targetProfitAmount?: number;
  }
): string => {
  const {
    fixedCosts,
    variableCostPerUnit,
    sellingPricePerUnit,
    mode,
    targetProfit,
    targetUnits,
    targetProfitPercentage
  } = breakEvenData;

  const {
    breakEvenUnits,
    totalRevenueAtBreakEven,
    contributionMargin,
    requiredPrice,
    targetProfitAmount
  } = breakEvenResult;
  
  // Calculate contribution margin ratio
  const contributionMarginRatio = contributionMargin ? 
    (contributionMargin / sellingPricePerUnit) * 100 : 
    ((sellingPricePerUnit - variableCostPerUnit) / sellingPricePerUnit) * 100;
  
  // Mode-specific data section
  let modeSpecificData = '';
  if (mode === 'profitTarget' && targetProfit) {
    modeSpecificData = `
Profit Target Analysis:
- Target Profit: ${formatCurrency(targetProfit)}
- Target Profit Percentage: ${targetProfitPercentage ? targetProfitPercentage.toFixed(2) + '%' : 'N/A'}
- Units Required for Target Profit: ${breakEvenUnits ? Math.ceil(breakEvenUnits).toLocaleString() : 'N/A'}
- Target Profit Amount: ${formatCurrency(targetProfitAmount || 0)}
`;
  } else if (mode === 'findPrice' && requiredPrice) {
    modeSpecificData = `
Price Analysis:
- Target Units: ${targetUnits?.toLocaleString() || 'N/A'}
- Required Price per Unit: ${formatCurrency(requiredPrice)}
- Current Variable Cost per Unit: ${formatCurrency(variableCostPerUnit)}
- Contribution Margin at Required Price: ${formatCurrency(requiredPrice - variableCostPerUnit)}
- Contribution Margin Ratio at Required Price: ${(((requiredPrice - variableCostPerUnit) / requiredPrice) * 100).toFixed(2)}%
`;
  }

  const dataSection = `
BREAK-EVEN ANALYSIS DATA:

Cost Structure:
- Fixed Costs: ${formatCurrency(fixedCosts)}
- Variable Cost per Unit: ${formatCurrency(variableCostPerUnit)}
- Selling Price per Unit: ${formatCurrency(sellingPricePerUnit)}
- Analysis Mode: ${mode}

Break-Even Results:
- Break-Even Units: ${breakEvenUnits ? Math.ceil(breakEvenUnits).toLocaleString() : 'N/A'}
- Total Revenue at Break-Even: ${totalRevenueAtBreakEven ? formatCurrency(totalRevenueAtBreakEven) : 'N/A'}
- Contribution Margin per Unit: ${contributionMargin ? formatCurrency(contributionMargin) : formatCurrency(sellingPricePerUnit - variableCostPerUnit)}
- Contribution Margin Ratio: ${contributionMarginRatio.toFixed(2)}%
${modeSpecificData}`;

  const analysisRequirements = `
Provide a comprehensive break-even analysis including:

1. Break-Even Interpretation
   - Explain what the break-even point means for this specific business
   - Assess whether the current break-even point is achievable
   - Evaluate the margin of safety if production/sales exceed break-even

2. Cost Structure Assessment
   - Evaluate the balance between fixed and variable costs
   - Assess the contribution margin and its adequacy
   - Identify concerning aspects of the current cost structure

3. Pricing Strategy Evaluation
   - Assess the current pricing strategy based on break-even results
   - Evaluate price elasticity considerations
   - Suggest potential pricing adjustments with projected impacts

4. Profitability Enhancement Strategies
   - Identify specific strategies to lower the break-even point
   - Suggest approaches to increase contribution margin
   - Recommend operational changes to optimize cost structure

5. Risk Assessment
   - Identify factors that could negatively impact the break-even point
   - Assess vulnerability to market or cost fluctuations
   - Suggest risk mitigation strategies
`;

  return generateStructuredPrompt(
    breakEvenAnalystRole,
    enhancedFinancialContext,
    dataSection,
    analysisRequirements,
    breakEvenOutputStructure
  );
};

/**
 * Enhanced prompt generator for cash flow analysis
 */
export const generateEnhancedCashFlowAnalysisPrompt = (
  operatingCashFlow: number,
  investingCashFlow: number,
  financingCashFlow: number,
  netCashFlow: number,
  cashFlowRatio: number,
  previousPeriodData?: {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netCashFlow: number;
  }
): string => {
  // Calculate period-over-period changes if previous data is available
  let periodComparisonData = '';
  if (previousPeriodData) {
    const calculatePercentageChange = (current: number, previous: number): number => {
      if (previous === 0) {
        return current > 0 ? 100 : current < 0 ? -100 : 0;
      }
      return ((current - previous) / Math.abs(previous)) * 100;
    };

    const operatingChange = calculatePercentageChange(operatingCashFlow, previousPeriodData.operatingCashFlow);
    const investingChange = calculatePercentageChange(investingCashFlow, previousPeriodData.investingCashFlow);
    const financingChange = calculatePercentageChange(financingCashFlow, previousPeriodData.financingCashFlow);
    const netChange = calculatePercentageChange(netCashFlow, previousPeriodData.netCashFlow);
    
    periodComparisonData = `
Period-Over-Period Changes:
- Operating Cash Flow: ${operatingChange.toFixed(2)}%
- Investing Cash Flow: ${investingChange.toFixed(2)}%
- Financing Cash Flow: ${financingChange.toFixed(2)}%
- Net Cash Flow: ${netChange.toFixed(2)}%
`;
  }

  const dataSection = `
CASH FLOW ANALYSIS DATA:

Current Period Cash Flows:
- Operating Cash Flow: ${formatCurrency(operatingCashFlow)}
- Investing Cash Flow: ${formatCurrency(investingCashFlow)}
- Financing Cash Flow: ${formatCurrency(financingCashFlow)}
- Net Cash Flow: ${formatCurrency(netCashFlow)}
- Cash Flow Ratio: ${cashFlowRatio.toFixed(2)}
${periodComparisonData}`;

  const analysisRequirements = `
Provide a comprehensive cash flow analysis including:

1. Cash Flow Health Assessment
   - Evaluate overall cash flow position and sustainability
   - Assess the balance between different cash flow components
   - Identify concerning trends or positive developments

2. Operating Cash Flow Analysis
   - Evaluate operational cash generation capability
   - Identify potential operational inefficiencies
   - Suggest strategies to improve operating cash flow

3. Investment Activity Evaluation
   - Assess the appropriateness of investment cash flows
   - Evaluate return on investment activities
   - Recommend investment strategy adjustments if needed

4. Financing Structure Assessment
   - Evaluate the sustainability of current financing activities
   - Assess debt service capability
   - Recommend financing structure improvements

5. Liquidity Risk Management
   - Identify potential cash flow risks
   - Suggest specific risk mitigation strategies
   - Recommend appropriate cash reserves and contingency plans
`;

  return generateStructuredPrompt(
    cashFlowSpecialistRole,
    enhancedFinancialContext,
    dataSection,
    analysisRequirements,
    cashFlowOutputStructure
  );
};

/**
 * Enhanced prompt generator for business valuation
 */
export const generateEnhancedBusinessValuationPrompt = (
  valuationData: {
    annualRevenue: number;
    netProfit: number;
    growthRate: number;
    industryMultiple: number;
    assetValue: number;
    liabilities: number;
    discountRate: number;
    projectionYears: number;
    companyName?: string;
    industry?: string;
  }
): string => {
  const { 
    annualRevenue, 
    netProfit, 
    growthRate, 
    industryMultiple, 
    assetValue, 
    liabilities,
    discountRate,
    projectionYears,
    companyName = 'the company',
    industry = 'the industry'
  } = valuationData;
  
  // Calculate preliminary valuation metrics
  const revenueMultipleValuation = annualRevenue * industryMultiple;
  const profitMultipleValuation = netProfit * (industryMultiple * 2); // Profit multiples typically higher
  const assetBasedValuation = assetValue - liabilities;
  
  const dataSection = `
BUSINESS VALUATION DATA:

Business Information:
- Company Name: ${companyName}
- Industry: ${industry}

Financial Metrics:
- Annual Revenue: ${formatCurrency(annualRevenue)}
- Net Profit: ${formatCurrency(netProfit)}
- Growth Rate: ${growthRate.toFixed(2)}%
- Industry Multiple: ${industryMultiple.toFixed(2)}x
- Asset Value: ${formatCurrency(assetValue)}
- Liabilities: ${formatCurrency(liabilities)}
- Discount Rate: ${discountRate.toFixed(2)}%
- Projection Years: ${projectionYears}

Preliminary Valuation Estimates:
- Revenue Multiple Valuation: ${formatCurrency(revenueMultipleValuation)}
- Profit Multiple Valuation: ${formatCurrency(profitMultipleValuation)}
- Asset-Based Valuation: ${formatCurrency(assetBasedValuation)}
`;

  const analysisRequirements = `
Provide a comprehensive business valuation analysis including:

1. Valuation Methodology Assessment
   - Evaluate the appropriateness of different valuation methods for this business
   - Recommend primary and supporting valuation approaches
   - Explain the rationale for the recommended valuation methods

2. Detailed Valuation Calculation
   - Provide detailed calculations for each valuation method
   - Explain key assumptions and their justification
   - Reconcile differences between valuation methods

3. Value Driver Analysis
   - Identify specific factors positively impacting business value
   - Assess factors negatively impacting business value
   - Quantify the approximate impact of key value drivers

4. Market Comparability Assessment
   - Compare valuation to similar businesses in the industry
   - Explain variances from industry benchmarks
   - Assess market conditions affecting valuation

5. Value Enhancement Strategies
   - Recommend specific strategies to increase business value
   - Prioritize recommendations by potential impact
   - Provide implementation guidance and expected outcomes
`;

  return generateStructuredPrompt(
    valuationExpertRole,
    enhancedFinancialContext,
    dataSection,
    analysisRequirements,
    valuationOutputStructure
  );
};

/**
 * Enhanced prompt generator for investment analysis
 */
export const generateEnhancedInvestmentAnalysisPrompt = (
  investmentData: {
    initialInvestment: number;
    projectedCashFlows: number[];
    discountRate: number;
    projectLifespan: number;
    alternativeInvestmentReturn: number;
  }
): string => {
  const { 
    initialInvestment, 
    projectedCashFlows, 
    discountRate, 
    projectLifespan,
    alternativeInvestmentReturn
  } = investmentData;
  
  // Format the cash flows for display
  let cashFlowsDisplay = '';
  projectedCashFlows.forEach((cf, index) => {
    cashFlowsDisplay += `- Year ${index + 1}: ${formatCurrency(cf)}\n`;
  });
  
  const dataSection = `
INVESTMENT ANALYSIS DATA:

Investment Parameters:
- Initial Investment: ${formatCurrency(initialInvestment)}
- Project Lifespan: ${projectLifespan} years
- Discount Rate: ${discountRate.toFixed(2)}%
- Alternative Investment Return: ${alternativeInvestmentReturn.toFixed(2)}%

Projected Cash Flows:
${cashFlowsDisplay}`;

  const analysisRequirements = `
Provide a comprehensive investment analysis including:

1. Net Present Value (NPV) Analysis
   - Calculate and interpret the NPV
   - Assess the investment's financial viability
   - Explain the significance of the NPV result

2. Internal Rate of Return (IRR) Assessment
   - Calculate and interpret the IRR
   - Compare IRR to the discount rate and alternative investments
   - Assess the investment's relative attractiveness

3. Payback Period Calculation
   - Calculate the discounted and undiscounted payback periods
   - Assess the investment's liquidity and risk profile
   - Compare to industry benchmarks for similar investments

4. Risk Assessment
   - Identify specific risks associated with this investment
   - Perform sensitivity analysis on key variables
   - Recommend risk mitigation strategies

5. Investment Recommendation
   - Provide a clear recommendation (proceed, modify, or reject)
   - Justify your recommendation with specific data points
   - Suggest modifications to improve investment performance if applicable
`;

  return generateStructuredPrompt(
    investmentAnalystRole,
    enhancedFinancialContext + '\n' + investmentAnalysisContext,
    dataSection,
    analysisRequirements,
    investmentOutputStructure
  );
};

/**
 * Enhanced prompt generator for comprehensive financial health analysis
 */
export const generateEnhancedFinancialHealthAnalysisPrompt = (
  ratiosByCategory: RatioCategoryMap,
  calculatedRatios: Record<string, number>
): string => {
  let ratiosDataSection = '\nFINANCIAL RATIO ANALYSIS DATA:\n';
  
  // Group ratios by category for the prompt
  Object.entries(ratiosByCategory).forEach(([_, category]) => {
    ratiosDataSection += `\n${category.title}:\n`;
    
    category.ratios.forEach(ratio => {
      const ratioValue = calculatedRatios[ratio.title];
      if (ratioValue !== undefined) {
        ratiosDataSection += `- ${ratio.title}: ${ratio.formatResult(ratioValue)}\n`;
      }
    });
  });
  
  const analysisRequirements = `
Provide a comprehensive financial health analysis including:

1. Overall Financial Health Assessment
   - Evaluate the company's overall financial position
   - Identify areas of financial strength and concern
   - Provide a financial health score or rating

2. Liquidity Analysis
   - Assess the company's ability to meet short-term obligations
   - Evaluate working capital management
   - Identify liquidity risks and opportunities

3. Solvency and Leverage Assessment
   - Evaluate the company's debt structure and leverage
   - Assess long-term financial stability
   - Identify debt-related risks and opportunities

4. Profitability Analysis
   - Assess profit margins and return metrics
   - Evaluate profit trends and drivers
   - Identify profit enhancement opportunities

5. Efficiency Analysis
   - Evaluate asset utilization and operational efficiency
   - Assess inventory, receivables, and payables management
   - Identify efficiency improvement opportunities

6. Growth Assessment
   - Evaluate growth metrics and sustainability
   - Assess growth potential and constraints
   - Identify growth opportunities and strategies
`;

  return generateStructuredPrompt(
    financialAdvisorRole,
    enhancedFinancialContext,
    ratiosDataSection,
    analysisRequirements,
    standardOutputStructure
  );
};

/**
 * Enhanced prompt generator for pricing strategy analysis
 * 
 * @param breakEvenAnalysis Break-even analysis data
 * @param scenarios Pricing scenarios
 * @param costStructure Cost structure data
 * @param marketData Market data
 * @returns Structured prompt for pricing strategy analysis
 */
export const generateEnhancedPricingStrategyPrompt = (
  breakEvenAnalysis: {
    point: number;
    optimalPrice: number;
    optimalPriceRange: {
      min: number;
      max: number;
    };
    marketSensitivity: number;
  },
  scenarios: Array<{
    price: number;
    volume: number;
    revenue: number;
    variableCosts: number;
    totalCosts: number;
    profit: number;
    targetProfit: number;
    profitMargin: number;
    meetsTargetProfit: boolean;
  }>,
  costStructure: {
    fixedCosts: number;
    variableCostPerUnit: number;
    targetProfitPercentage: number;
  },
  marketData: {
    competitorPrice: number;
    marketSize: number;
    priceElasticity: number;
  }
): string => {
  // Create expert role for pricing strategy
  const pricingStrategistRole = `You are a senior pricing strategy consultant with expertise in market positioning, financial analysis, and competitive strategy. You have 15+ years of experience helping businesses optimize their pricing to maximize profitability while maintaining market competitiveness.`;

  // Create base context for pricing strategy
  const pricingStrategyContext = `Your task is to analyze pricing strategy data including break-even analysis, multiple pricing scenarios, cost structure, and market conditions. You will provide strategic recommendations that balance profitability goals with market positioning and competitive factors. Your analysis should consider price elasticity, competitor pricing, and the relationship between price points and projected sales volumes.`;

  // Create output structure for pricing strategy
  const pricingStrategyOutputStructure = `# Pricing Strategy Analysis

### Market Position Assessment
[Analyze how the proposed pricing scenarios position the product/service in the market relative to competitors and customer expectations. Discuss price elasticity implications and market sensitivity.]

### Financial Impact Analysis
[Evaluate the financial implications of each pricing scenario, including revenue projections, profit margins, and break-even considerations. Identify which scenarios meet or exceed target profit requirements.]

### Optimal Pricing Strategy
[Recommend the optimal pricing approach based on both market position and financial goals. Specify the recommended price point or range and explain the rationale.]

### Implementation Recommendations
[Provide actionable steps for implementing the recommended pricing strategy, including potential phasing, market messaging considerations, and monitoring metrics.]

### Risk Assessment
[Identify potential risks associated with the recommended pricing strategy and suggest mitigation approaches.]`;

  // Format the data section
  const dataSection = `## Pricing Analysis Data

### Break-Even Analysis
- Break-Even Point: ${formatCurrency(breakEvenAnalysis.point)}
- Optimal Price: ${formatCurrency(breakEvenAnalysis.optimalPrice)}
- Optimal Price Range: ${formatCurrency(breakEvenAnalysis.optimalPriceRange.min)} to ${formatCurrency(breakEvenAnalysis.optimalPriceRange.max)}
- Market Sensitivity: ${breakEvenAnalysis.marketSensitivity.toFixed(2)}

### Cost Structure
- Fixed Costs: ${formatCurrency(costStructure.fixedCosts)}
- Variable Cost Per Unit: ${formatCurrency(costStructure.variableCostPerUnit)}
- Target Profit Percentage: ${costStructure.targetProfitPercentage}%

### Market Data
- Competitor Price: ${formatCurrency(marketData.competitorPrice)}
- Market Size: ${marketData.marketSize.toLocaleString()} units
- Price Elasticity: ${marketData.priceElasticity.toFixed(2)}

### Pricing Scenarios
${scenarios.map((scenario, index) => {
  return `
#### Scenario ${index + 1}
- Price: ${formatCurrency(scenario.price)}
- Volume: ${scenario.volume.toLocaleString()} units
- Revenue: ${formatCurrency(scenario.revenue)}
- Variable Costs: ${formatCurrency(scenario.variableCosts)}
- Total Costs: ${formatCurrency(scenario.totalCosts)}
- Profit: ${formatCurrency(scenario.profit)}
- Target Profit: ${formatCurrency(scenario.targetProfit)}
- Profit Margin: ${scenario.profitMargin.toFixed(2)}%
- Meets Target Profit: ${scenario.meetsTargetProfit ? 'Yes' : 'No'}`;
}).join('\n')}`;

  // Analysis requirements
  const analysisRequirements = `Based on the provided pricing data, please analyze the various pricing scenarios and provide strategic recommendations. Consider the break-even point, market positioning, competitor pricing, and profitability targets. Identify the optimal pricing strategy that balances market competitiveness with financial goals.`;

  // Generate the structured prompt
  return generateStructuredPrompt(
    pricingStrategistRole,
    pricingStrategyContext,
    dataSection,
    analysisRequirements,
    pricingStrategyOutputStructure
  );
};

// Import expert roles for scenario analysis
const scenarioAnalystRole = `You are a strategic business scenario analyst with expertise in financial modeling and business forecasting. Your role is to analyze different business scenarios and provide actionable insights on risk management, opportunity assessment, and strategic planning. You excel at interpreting complex financial data and translating it into clear, actionable business recommendations.`;

// Base context for scenario analysis
const scenarioAnalysisContext = `
When analyzing business scenarios, consider the following key factors:
- Probability-weighted outcomes and expected values
- Risk-reward tradeoffs across different scenarios
- Key drivers of success and failure in each scenario
- Strategic implications and recommended actions
- Contingency planning and risk mitigation strategies
- Opportunity costs and resource allocation considerations
- Market conditions and competitive landscape impacts
`;

// Output structure for scenario analysis
const scenarioAnalysisOutputStructure = `
# Scenario Analysis: Strategic Assessment

## Executive Summary
[Provide a concise overview of the scenario analysis, highlighting key findings and recommendations]

## Scenario Comparison
[Compare the base, optimistic, and pessimistic scenarios, highlighting key differences and implications]

## Probability-Weighted Outcomes
[Analyze the expected outcomes based on scenario probabilities, including expected revenue, profit, and other key metrics]

## Strategic Recommendations
[Provide actionable recommendations based on the scenario analysis, including risk mitigation strategies and opportunity maximization]

## Implementation Roadmap
[Outline specific steps to implement the recommendations, with timelines and resource requirements]

## Risk Assessment
[Identify key risks and contingency plans for each scenario]
`;

/**
 * Enhanced prompt generator for scenario analysis
 * 
 * @param scenarioData Complete scenario data including base, optimistic, and pessimistic scenarios
 * @returns Structured prompt for scenario analysis
 */
export const generateEnhancedScenarioAnalysisPrompt = (
  scenarioData: {
    scenarios: {
      base: {
        name: string;
        description: string;
        metrics: {
          revenue: number;
          costs: number;
          marketShare: number;
          customerGrowth: number;
          baselineClients: number;
          operatingExpenses: number;
          profitMargin: number;
          expectedRevenue: number;
          expectedProfit: number;
        };
        probability: number;
      };
      optimistic: {
        name: string;
        description: string;
        metrics: {
          revenue: number;
          costs: number;
          marketShare: number;
          customerGrowth: number;
          baselineClients: number;
          operatingExpenses: number;
          profitMargin: number;
          expectedRevenue: number;
          expectedProfit: number;
        };
        probability: number;
      };
      pessimistic: {
        name: string;
        description: string;
        metrics: {
          revenue: number;
          costs: number;
          marketShare: number;
          customerGrowth: number;
          baselineClients: number;
          operatingExpenses: number;
          profitMargin: number;
          expectedRevenue: number;
          expectedProfit: number;
        };
        probability: number;
      };
    };
    metrics: {
      expectedRevenue: number;
      expectedProfit: number;
      marketShareRange: {
        min: number;
        max: number;
      };
      customerGrowthRange: {
        min: number;
        max: number;
      };
    };
  }
): string => {
  const { scenarios, metrics } = scenarioData;
  const { base, optimistic, pessimistic } = scenarios;
  
  // Calculate expected values based on probabilities
  const totalProbability = base.probability + optimistic.probability + pessimistic.probability;
  const normalizedBaseProbability = base.probability / totalProbability;
  const normalizedOptimisticProbability = optimistic.probability / totalProbability;
  const normalizedPessimisticProbability = pessimistic.probability / totalProbability;
  
  const expectedRevenue = (
    base.metrics.revenue * normalizedBaseProbability +
    optimistic.metrics.revenue * normalizedOptimisticProbability +
    pessimistic.metrics.revenue * normalizedPessimisticProbability
  );
  
  const expectedProfit = (
    base.metrics.expectedProfit * normalizedBaseProbability +
    optimistic.metrics.expectedProfit * normalizedOptimisticProbability +
    pessimistic.metrics.expectedProfit * normalizedPessimisticProbability
  );
  
  // Format the data section
  const dataSection = `
### Scenario Probabilities
- ${base.name}: ${base.probability}%
- ${optimistic.name}: ${optimistic.probability}%
- ${pessimistic.name}: ${pessimistic.probability}%

### Base Case Scenario: ${base.name}
${base.description}
- Revenue: $${base.metrics.revenue.toLocaleString()}
- Costs: $${base.metrics.costs.toLocaleString()}
- Operating Expenses: $${base.metrics.operatingExpenses.toLocaleString()}
- Profit Margin: ${base.metrics.profitMargin.toFixed(2)}%
- Market Share: ${base.metrics.marketShare.toFixed(2)}%
- Customer Growth: ${base.metrics.customerGrowth.toFixed(2)}%
- Baseline Clients: ${base.metrics.baselineClients.toLocaleString()}
- Expected Revenue: $${base.metrics.expectedRevenue.toLocaleString()}
- Expected Profit: $${base.metrics.expectedProfit.toLocaleString()}

### Optimistic Scenario: ${optimistic.name}
${optimistic.description}
- Revenue: $${optimistic.metrics.revenue.toLocaleString()}
- Costs: $${optimistic.metrics.costs.toLocaleString()}
- Operating Expenses: $${optimistic.metrics.operatingExpenses.toLocaleString()}
- Profit Margin: ${optimistic.metrics.profitMargin.toFixed(2)}%
- Market Share: ${optimistic.metrics.marketShare.toFixed(2)}%
- Customer Growth: ${optimistic.metrics.customerGrowth.toFixed(2)}%
- Baseline Clients: ${optimistic.metrics.baselineClients.toLocaleString()}
- Expected Revenue: $${optimistic.metrics.expectedRevenue.toLocaleString()}
- Expected Profit: $${optimistic.metrics.expectedProfit.toLocaleString()}

### Pessimistic Scenario: ${pessimistic.name}
${pessimistic.description}
- Revenue: $${pessimistic.metrics.revenue.toLocaleString()}
- Costs: $${pessimistic.metrics.costs.toLocaleString()}
- Operating Expenses: $${pessimistic.metrics.operatingExpenses.toLocaleString()}
- Profit Margin: ${pessimistic.metrics.profitMargin.toFixed(2)}%
- Market Share: ${pessimistic.metrics.marketShare.toFixed(2)}%
- Customer Growth: ${pessimistic.metrics.customerGrowth.toFixed(2)}%
- Baseline Clients: ${pessimistic.metrics.baselineClients.toLocaleString()}
- Expected Revenue: $${pessimistic.metrics.expectedRevenue.toLocaleString()}
- Expected Profit: $${pessimistic.metrics.expectedProfit.toLocaleString()}

### Probability-Weighted Expected Values
- Expected Revenue: $${expectedRevenue.toLocaleString()}
- Expected Profit: $${expectedProfit.toLocaleString()}
- Market Share Range: ${metrics.marketShareRange.min.toFixed(2)}% to ${metrics.marketShareRange.max.toFixed(2)}%
- Customer Growth Range: ${metrics.customerGrowthRange.min.toFixed(2)}% to ${metrics.customerGrowthRange.max.toFixed(2)}%
`;

  // Analysis requirements
  const analysisRequirements = `Based on the provided scenario data, analyze the base, optimistic, and pessimistic scenarios. Compare their financial implications, assess risks and opportunities, and provide strategic recommendations. Consider the probability-weighted outcomes and provide actionable insights for decision-making. Include specific strategies for risk mitigation and opportunity maximization.`;

  // Generate the structured prompt
  return generateStructuredPrompt(
    scenarioAnalystRole,
    scenarioAnalysisContext,
    dataSection,
    analysisRequirements,
    scenarioAnalysisOutputStructure
  );
};

// Re-export legacy functions with enhanced implementations
export const generateStartupAnalysisPrompt = generateEnhancedStartupAnalysisPrompt;
export const generateRatioAnalysisPrompt = generateEnhancedRatioAnalysisPrompt;
export const generateBreakEvenAnalysisPrompt = generateEnhancedBreakEvenAnalysisPrompt;
export const generateCashFlowAnalysisPrompt = generateEnhancedCashFlowAnalysisPrompt;
export const generateBusinessValuationPrompt = generateEnhancedBusinessValuationPrompt;
export const generateInvestmentAnalysisPrompt = generateEnhancedInvestmentAnalysisPrompt;
export const generateFinancialHealthAnalysisPrompt = generateEnhancedFinancialHealthAnalysisPrompt;
export const generateScenarioAnalysisPrompt = generateEnhancedScenarioAnalysisPrompt;

// Export the base contexts and format instructions for use in other modules
export {
  enhancedFinancialContext as baseFinancialContext,
  enhancedFormatInstructions as formatInstructions
};
