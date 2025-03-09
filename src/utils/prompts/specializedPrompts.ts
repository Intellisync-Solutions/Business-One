
// Import base context and format instructions from promptManager
import { baseFinancialContext, formatInstructions } from './promptManager';

/**
 * Generates a prompt for cash flow analysis
 */
export const generateCashFlowAnalysisPrompt = (
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
  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  // Calculate period-over-period changes if previous data is available
  let periodComparison = '';
  if (previousPeriodData) {
    const operatingChange = ((operatingCashFlow - previousPeriodData.operatingCashFlow) / Math.abs(previousPeriodData.operatingCashFlow)) * 100;
    const investingChange = ((investingCashFlow - previousPeriodData.investingCashFlow) / Math.abs(previousPeriodData.investingCashFlow)) * 100;
    const financingChange = ((financingCashFlow - previousPeriodData.financingCashFlow) / Math.abs(previousPeriodData.financingCashFlow)) * 100;
    const netChange = ((netCashFlow - previousPeriodData.netCashFlow) / Math.abs(previousPeriodData.netCashFlow)) * 100;
    
    periodComparison = `\nPERIOD-OVER-PERIOD CHANGES:\n- Operating Cash Flow: ${operatingChange.toFixed(2)}%\n- Investing Cash Flow: ${investingChange.toFixed(2)}%\n- Financing Cash Flow: ${financingChange.toFixed(2)}%\n- Net Cash Flow: ${netChange.toFixed(2)}%\n`;
  }
  
  return `${baseFinancialContext}

As a financial advisor, analyze the following cash flow data and provide strategic insights:

CASH FLOW STATEMENT:
- Operating Cash Flow: ${formatCurrency(operatingCashFlow)}
- Investing Cash Flow: ${formatCurrency(investingCashFlow)}
- Financing Cash Flow: ${formatCurrency(financingCashFlow)}
- Net Cash Flow: ${formatCurrency(netCashFlow)}
- Cash Flow Ratio: ${cashFlowRatio.toFixed(2)}
${periodComparison}

Please provide:
1. Analysis of the company's cash flow health
2. Interpretation of operating, investing, and financing activities
3. Sustainability assessment of current cash flow patterns
4. Recommendations for improving cash flow management
5. Potential risks and opportunities based on cash flow trends

${formatInstructions}`;
};

/**
 * Generates a prompt for business valuation analysis
 */
export const generateBusinessValuationPrompt = (
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
  
  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  // Calculate some basic valuation metrics
  const revenueMultipleValuation = annualRevenue * industryMultiple;
  const profitMultipleValuation = netProfit * (industryMultiple * 2); // Typically profit multiples are higher
  const assetBasedValuation = assetValue - liabilities;
  
  return `${baseFinancialContext}

As a business valuation expert, analyze the following data and provide a comprehensive valuation assessment:

BUSINESS INFORMATION:
- Company Name: ${companyName}
- Industry: ${industry}

BUSINESS FINANCIAL DATA:
- Annual Revenue: ${formatCurrency(annualRevenue)}
- Net Profit: ${formatCurrency(netProfit)}
- Growth Rate: ${growthRate.toFixed(2)}%
- Industry Multiple: ${industryMultiple.toFixed(2)}x
- Asset Value: ${formatCurrency(assetValue)}
- Liabilities: ${formatCurrency(liabilities)}
- Discount Rate: ${discountRate.toFixed(2)}%
- Projection Years: ${projectionYears}

PRELIMINARY VALUATION METHODS:
- Revenue Multiple Valuation: ${formatCurrency(revenueMultipleValuation)}
- Profit Multiple Valuation: ${formatCurrency(profitMultipleValuation)}
- Asset-Based Valuation: ${formatCurrency(assetBasedValuation)}

Please provide:
1. A comprehensive business valuation analysis
2. Comparison of different valuation methods (income, market, asset-based)
3. Recommended valuation range with justification
4. Key value drivers and risk factors affecting the valuation
5. Strategies to increase business value over time

${formatInstructions}`;
};

/**
 * Generates a prompt for investment analysis
 */
export const generateInvestmentAnalysisPrompt = (
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
  
  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  // Calculate NPV (simplified)
  let npv = -initialInvestment;
  projectedCashFlows.forEach((cashFlow, index) => {
    npv += cashFlow / Math.pow(1 + (discountRate / 100), index + 1);
  });
  
  // Calculate IRR (simplified approximation)
  // For a proper IRR calculation, we would need to use numerical methods
  const totalReturn = projectedCashFlows.reduce((sum, cf) => sum + cf, 0);
  const averageAnnualReturn = totalReturn / projectLifespan;
  const approximateIRR = (averageAnnualReturn / initialInvestment) * 100;
  
  // Calculate payback period (simplified)
  let cumulativeCashFlow = -initialInvestment;
  let paybackPeriod = projectLifespan;
  for (let i = 0; i < projectedCashFlows.length; i++) {
    cumulativeCashFlow += projectedCashFlows[i];
    if (cumulativeCashFlow >= 0) {
      paybackPeriod = i + 1;
      break;
    }
  }
  
  // Format cash flows for display
  const cashFlowsDisplay = projectedCashFlows.map((cf, index) => 
    `Year ${index + 1}: ${formatCurrency(cf)}`
  ).join('\n- ');
  
  return `${baseFinancialContext}

As an investment advisor, analyze the following investment opportunity and provide recommendations:

INVESTMENT DETAILS:
- Initial Investment: ${formatCurrency(initialInvestment)}
- Project Lifespan: ${projectLifespan} years
- Discount Rate: ${discountRate.toFixed(2)}%
- Alternative Investment Return: ${alternativeInvestmentReturn.toFixed(2)}%

PROJECTED CASH FLOWS:
- ${cashFlowsDisplay}

INVESTMENT METRICS:
- Net Present Value (NPV): ${formatCurrency(npv)}
- Internal Rate of Return (IRR): ${approximateIRR.toFixed(2)}%
- Payback Period: ${paybackPeriod} years

Please provide:
1. A comprehensive investment analysis
2. Assessment of investment viability based on NPV, IRR, and payback period
3. Comparison with alternative investment opportunities
4. Risk assessment and sensitivity analysis
5. Recommendations for proceeding with or modifying the investment

${formatInstructions}`;
};

/**
 * Generates a prompt for break-even analysis
 */
export const generateBreakEvenAnalysisPrompt = (
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
    targetProfit
  } = breakEvenData;

  const { 
    breakEvenUnits, 
    totalRevenueAtBreakEven, 
    contributionMargin,
    requiredPrice
  } = breakEvenResult;
  
  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  // Additional context based on mode
  let modeSpecificContext = '';
  if (mode === 'profitTarget' && targetProfit) {
    modeSpecificContext = `\nPROFIT TARGET ANALYSIS:\n- Target Profit: ${formatCurrency(targetProfit)}\n- Units Required for Target Profit: ${breakEvenUnits ? Math.ceil(breakEvenUnits).toLocaleString() : 'N/A'}\n`;
  } else if (mode === 'findPrice' && requiredPrice) {
    modeSpecificContext = `\nPRICE ANALYSIS:\n- Required Price per Unit: ${formatCurrency(requiredPrice)}\n- Current Variable Cost per Unit: ${formatCurrency(variableCostPerUnit)}\n- Contribution Margin at Required Price: ${formatCurrency(requiredPrice - variableCostPerUnit)}\n`;
  }
  
  return `${baseFinancialContext}

As a financial advisor, analyze the following break-even data and provide strategic insights:

BREAK-EVEN INPUTS:
- Fixed Costs: ${formatCurrency(fixedCosts)}
- Variable Cost per Unit: ${formatCurrency(variableCostPerUnit)}
- Selling Price per Unit: ${formatCurrency(sellingPricePerUnit)}
- Analysis Mode: ${mode}

BREAK-EVEN RESULTS:
- Break-Even Units: ${breakEvenUnits ? Math.ceil(breakEvenUnits).toLocaleString() : 'N/A'}
- Total Revenue at Break-Even: ${totalRevenueAtBreakEven ? formatCurrency(totalRevenueAtBreakEven) : 'N/A'}
- Contribution Margin per Unit: ${contributionMargin ? formatCurrency(contributionMargin) : 'N/A'}
- Contribution Margin Ratio: ${contributionMargin ? ((contributionMargin / sellingPricePerUnit) * 100).toFixed(2) + '%' : 'N/A'}
${modeSpecificContext}

Your response MUST be structured in exactly two sections with these precise headers:

# Analysis:
(In this section, provide a thorough interpretation of the break-even analysis results, assessment of pricing strategy and cost structure, and risk assessment)

# Recommendations:
(In this section, provide specific recommendations for improving profitability, strategies to lower the break-even point, and actionable next steps)

IMPORTANT FORMATTING INSTRUCTIONS:
1. Use EXACTLY the section headers shown above (# Analysis: and # Recommendations:)
2. Use markdown formatting for better readability (e.g., ##, ###, bullet points, etc.)
3. Keep your analysis data-driven and actionable

${formatInstructions}`;
};
