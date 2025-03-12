// Import base context, format instructions, and currency formatter
import { baseFinancialContext, formatInstructions } from './promptManager';
import { formatCurrency } from '../currency';

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
  // Using centralized formatCurrency from currency utility
  
  /**
   * Safely calculates percentage change, handling zero and negative values appropriately
   */
  const calculatePercentageChange = (current: number, previous: number): number => {
    // Handle division by zero
    if (previous === 0) {
      return current > 0 ? 100 : current < 0 ? -100 : 0;
    }
    return ((current - previous) / Math.abs(previous)) * 100;
  };
  
  // Calculate period-over-period changes if previous data is available
  let periodComparison = '';
  if (previousPeriodData) {
    const operatingChange = calculatePercentageChange(operatingCashFlow, previousPeriodData.operatingCashFlow);
    const investingChange = calculatePercentageChange(investingCashFlow, previousPeriodData.investingCashFlow);
    const financingChange = calculatePercentageChange(financingCashFlow, previousPeriodData.financingCashFlow);
    const netChange = calculatePercentageChange(netCashFlow, previousPeriodData.netCashFlow);
    
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
 * Calculates the Net Present Value (NPV) for a series of cash flows.
 * @param initialInvestment The initial investment amount (assumed positive).
 * @param cashFlows An array of cash flows for each period.
 * @param discountRate The annual discount rate as a percentage.
 * @param compoundingFrequency Number of compounding periods per year (default is 1).
 * @param continuous If true, uses continuous compounding (default is false).
 * @returns The Net Present Value.
 */
function calculateNPV(initialInvestment: number, cashFlows: number[], discountRate: number, compoundingFrequency: number = 1, continuous: boolean = false): number {
  // Input validation
  if (initialInvestment < 0) {
    console.warn('Initial investment should be positive; the function will negate it internally');
    initialInvestment = Math.abs(initialInvestment);
  }
  
  if (discountRate < 0) {
    console.warn('Negative discount rate provided, using absolute value');
    discountRate = Math.abs(discountRate);
  }
  
  if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
    console.error('Invalid cash flows provided');
    return -initialInvestment; // Return just the negative initial investment if no valid cash flows
  }
  
  if (compoundingFrequency <= 0) {
    console.warn('Invalid compounding frequency, defaulting to annual (1)');
    compoundingFrequency = 1;
  }
  
  let npv = -initialInvestment;
  const r = discountRate / 100; // Convert percentage to decimal
  
  if (continuous) {
    // Continuous compounding formula: PV = FV * e^(-rt)
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] * Math.exp(-r * (t + 1));
    }
  } else {
    // Discrete compounding formula: PV = FV / (1 + r/m)^(m*t)
    // Where m is the compounding frequency per period
    for (let i = 0; i < cashFlows.length; i++) {
      const periodRate = r / compoundingFrequency;
      const periods = compoundingFrequency * (i + 1);
      npv += cashFlows[i] / Math.pow(1 + periodRate, periods);
    }
  }
  return npv;
}

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
  
  // Using centralized formatCurrency from currency utility
  
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
  
  // Using centralized formatCurrency from currency utility
  
  // Calculate NPV (simplified)
  const npv = calculateNPV(initialInvestment, projectedCashFlows, discountRate);
  
  /**
   * Calculates Internal Rate of Return (IRR) using Newton-Raphson method
   * @param initialInvestment The initial investment amount (positive)
   * @param cashFlows Array of cash flows for each period
   * @param maxIterations Maximum number of iterations for convergence
   * @param tolerance Acceptable error tolerance
   * @returns The IRR as a percentage, or NaN if no convergence
   */
  function calculateIRR(initialInvestment: number, cashFlows: number[], maxIterations: number = 100, tolerance: number = 0.0001): number {
    // Input validation
    if (initialInvestment <= 0) {
      console.warn('Initial investment should be positive');
      return NaN;
    }
    
    if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
      console.error('Invalid cash flows provided');
      return NaN;
    }
    
    // Initial guess (using simplified approximation)
    const totalReturn = cashFlows.reduce((sum, cf) => sum + cf, 0);
    const averageAnnualReturn = totalReturn / cashFlows.length;
    let guess = (averageAnnualReturn / initialInvestment);
    
    // Ensure reasonable starting point
    if (guess <= -1) guess = 0.1;
    
    // Newton-Raphson method
    for (let i = 0; i < maxIterations; i++) {
      let npv = -initialInvestment;
      let derivative = 0;
      
      for (let t = 0; t < cashFlows.length; t++) {
        const discountFactor = Math.pow(1 + guess, -(t + 1));
        npv += cashFlows[t] * discountFactor;
        derivative -= (t + 1) * cashFlows[t] * discountFactor / (1 + guess);
      }
      
      // Check if we're close enough to zero
      if (Math.abs(npv) < tolerance) {
        return guess * 100; // Convert to percentage
      }
      
      // Avoid division by zero
      if (Math.abs(derivative) < 1e-10) {
        return NaN; // Derivative too small, can't continue
      }
      
      // Update guess
      const newGuess = guess - npv / derivative;
      
      // Check for non-convergence or divergence
      if (newGuess < -1 || !isFinite(newGuess)) {
        return NaN; // IRR not found or diverging
      }
      
      guess = newGuess;
    }
    
    return NaN; // Did not converge within max iterations
  }
  
  // Calculate IRR using the robust numerical method
  const irr = calculateIRR(initialInvestment, projectedCashFlows);
  // Fall back to approximation if numerical method fails
  const totalCashFlow = projectedCashFlows.reduce((sum, cf) => sum + cf, 0);
  const averageAnnualReturn = totalCashFlow / projectLifespan;
  const irrValue = isNaN(irr) ? 
    (averageAnnualReturn / initialInvestment) * 100 : 
    irr;
  
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
- Internal Rate of Return (IRR): ${irrValue.toFixed(2)}%
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
/**
 * Calculates break-even units
 * @param fixedCosts Total fixed costs
 * @param sellingPricePerUnit Selling price per unit
 * @param variableCostPerUnit Variable cost per unit
 * @returns The break-even point in units, or Infinity if contribution margin is zero or negative
 */
function calculateBreakEvenUnits(fixedCosts: number, sellingPricePerUnit: number, variableCostPerUnit: number): number {
  const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
  if (contributionMargin <= 0) {
    console.warn('Contribution margin is zero or negative, break-even is not possible');
    return Infinity;
  }
  return fixedCosts / contributionMargin;
}

/**
 * Calculates units needed to achieve target profit
 * @param fixedCosts Total fixed costs
 * @param sellingPricePerUnit Selling price per unit
 * @param variableCostPerUnit Variable cost per unit
 * @param targetProfit Target profit amount
 * @returns The number of units needed to achieve the target profit
 */
function calculateProfitTargetUnits(fixedCosts: number, sellingPricePerUnit: number, variableCostPerUnit: number, targetProfit: number): number {
  const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
  if (contributionMargin <= 0) {
    console.warn('Contribution margin is zero or negative, profit target is not possible');
    return Infinity;
  }
  return (fixedCosts + targetProfit) / contributionMargin;
}

/**
 * Calculates the required selling price to achieve break-even at a given unit volume
 * @param fixedCosts Total fixed costs
 * @param variableCostPerUnit Variable cost per unit
 * @param targetUnits Target unit volume
 * @returns The required selling price per unit
 */
function calculateRequiredPrice(fixedCosts: number, variableCostPerUnit: number, targetUnits: number): number {
  if (targetUnits <= 0) {
    console.warn('Target units must be positive');
    return Infinity;
  }
  return variableCostPerUnit + (fixedCosts / targetUnits);
}

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
    targetProfit,
    targetUnits
  } = breakEvenData;

  const {
    breakEvenUnits: providedBreakEvenUnits,
    totalRevenueAtBreakEven,
    contributionMargin: providedContributionMargin,
    requiredPrice: providedRequiredPrice
  } = breakEvenResult;
  
  // Validate and calculate key metrics to ensure accuracy
  const actualContributionMargin = sellingPricePerUnit - variableCostPerUnit;
  
  // Calculate break-even units for validation
  const calculatedBreakEvenUnits = calculateBreakEvenUnits(fixedCosts, sellingPricePerUnit, variableCostPerUnit);
  
  // Use calculated or provided values based on validation
  const breakEvenUnits = isFinite(calculatedBreakEvenUnits) ? 
    calculatedBreakEvenUnits : 
    providedBreakEvenUnits;
    
  const contributionMargin = actualContributionMargin !== 0 ? 
    actualContributionMargin : 
    providedContributionMargin;
  
  // Calculate required price if in findPrice mode
  let requiredPrice = providedRequiredPrice;
  if (mode === 'findPrice' && targetUnits && targetUnits > 0) {
    requiredPrice = calculateRequiredPrice(fixedCosts, variableCostPerUnit, targetUnits);
  }
  
  // Calculate units for profit target if in profitTarget mode
  let profitTargetUnits = breakEvenUnits;
  if (mode === 'profitTarget' && targetProfit && targetProfit > 0) {
    profitTargetUnits = calculateProfitTargetUnits(fixedCosts, sellingPricePerUnit, variableCostPerUnit, targetProfit);
  }
  
  // Using centralized formatCurrency from currency utility
  
  // Additional context based on mode
  let modeSpecificContext = '';
  if (mode === 'profitTarget' && targetProfit) {
    // Use the calculated profit target units for more accurate analysis
    modeSpecificContext = `\nPROFIT TARGET ANALYSIS:\n- Target Profit: ${formatCurrency(targetProfit)}\n- Units Required for Target Profit: ${profitTargetUnits ? Math.ceil(profitTargetUnits).toLocaleString() : 'N/A'}\n`;
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
}