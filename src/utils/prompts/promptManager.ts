import { AnalysisRequest } from '../analysisPrompts';
import { RatioCategoryMap, FinancialRatio } from '@/types/financial';

/**
 * Model Context Protocol
 * 
 * This system centralizes all prompts used across the application to ensure:
 * 1. Consistent formatting of AI-generated content
 * 2. All relevant financial data is factored into each model response
 * 3. Standardized approach to prompt construction
 */

// Base context that should be included in all financial-related prompts
export const baseFinancialContext = `
As a financial advisor for Intellisync Business Suite, ensure all recommendations:
- Are based on Canadian financial regulations and standards
- Consider both short-term cash flow and long-term sustainability
- Provide actionable insights with clear implementation steps
- Highlight potential risks and mitigation strategies
- Use professional financial terminology with clear explanations
`;

// Format instructions to ensure consistent AI output
export const formatInstructions = `
Format your response using markdown with the following structure:

## [Main Title]

### Key Insights
- [Bulleted list of 3-5 most important takeaways]

### Detailed Analysis
[Organized analysis with appropriate subheadings]

### Recommendations
1. [First recommendation with brief explanation]
2. [Second recommendation with brief explanation]
[And so on...]

### Next Steps
[Concrete actions the business should take]
`;

/**
 * Generates a standardized prompt for startup cost analysis
 */
export const generateStartupAnalysisPrompt = (data: AnalysisRequest): string => {
  const { costs, metrics } = data;
  
  return `${baseFinancialContext}

As a financial advisor, analyze the following startup cost breakdown and provide strategic insights:

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

${formatInstructions}`;
};

/**
 * Generates a prompt for financial ratio analysis
 */
export const generateRatioAnalysisPrompt = (
  categoryName: string,
  ratio: FinancialRatio,
  value: number,
  allRatios?: Record<string, number>
): string => {
  const formattedValue = ratio.formatResult(value);
  const otherRatiosContext = allRatios ? generateOtherRatiosContext(allRatios) : '';
  
  return `${baseFinancialContext}

Analyze the following financial ratio for a business:

Ratio: ${ratio.title}
Category: ${categoryName}
Value: ${formattedValue}

Ratio Description: ${ratio.description}
${otherRatiosContext}

Please provide:
1. An interpretation of this ratio value
2. How this compares to industry standards
3. Potential implications for the business
4. Recommendations for improvement (if needed)

${formatInstructions}`;
};

/**
 * Generates a prompt for pricing strategy analysis
 */
export const generatePricingAnalysisPrompt = (
  productCost: number,
  competitorPrices: number[],
  targetMargin: number,
  marketSegment: string
): string => {
  const avgCompetitorPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;
  
  return `${baseFinancialContext}

As a pricing strategy advisor, analyze the following data and recommend an optimal pricing strategy:

Product Cost: $${productCost.toLocaleString()}
Average Competitor Price: $${avgCompetitorPrice.toLocaleString()}
Competitor Price Range: $${Math.min(...competitorPrices).toLocaleString()} - $${Math.max(...competitorPrices).toLocaleString()}
Target Profit Margin: ${targetMargin}%
Target Market Segment: ${marketSegment}

Please provide:
1. Recommended price point(s) with justification
2. Analysis of how this pricing relates to the market positioning
3. Expected profit margins at different price points
4. Potential pricing strategies (e.g., premium, value, penetration)
5. Recommendations for price testing or adjustment over time

${formatInstructions}`;
};

/**
 * Generates a context string for other financial ratios when analyzing a specific ratio
 */
const generateOtherRatiosContext = (ratios: Record<string, number>): string => {
  if (Object.keys(ratios).length === 0) return '';
  
  let context = '\nOther Financial Ratios:\n';
  
  for (const [name, value] of Object.entries(ratios)) {
    context += `- ${name}: ${value.toFixed(2)}\n`;
  }
  
  return context;
};

/**
 * Generates a comprehensive financial health analysis prompt
 */
export const generateFinancialHealthAnalysisPrompt = (
  ratiosByCategory: RatioCategoryMap,
  calculatedRatios: Record<string, number>
): string => {
  let ratiosContext = '\nCalculated Financial Ratios:\n';
  
  // Group ratios by category for the prompt
  Object.entries(ratiosByCategory).forEach(([_, category]) => {
    ratiosContext += `\n${category.title}:\n`;
    
    category.ratios.forEach(ratio => {
      const ratioValue = calculatedRatios[ratio.title];
      if (ratioValue !== undefined) {
        ratiosContext += `- ${ratio.title}: ${ratio.formatResult(ratioValue)}\n`;
      }
    });
  });
  
  return `${baseFinancialContext}

As a financial analyst, provide a comprehensive analysis of the following financial ratios:
${ratiosContext}

Please provide:
1. An overall assessment of the company's financial health
2. Strengths and weaknesses identified from these ratios
3. Comparison to industry benchmarks where applicable
4. Potential red flags or areas of concern
5. Recommendations for improving financial performance

${formatInstructions}`;
};
