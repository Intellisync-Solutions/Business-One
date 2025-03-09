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

/**
 * Generate a SMART objective in markdown format
 * @param title Objective title
 * @param specific Specific goal description
 * @param measurable How progress will be measured
 * @param achievable Steps to make the goal achievable
 * @param relevant How the goal aligns with broader mission
 * @param timeBound Timeline for achieving the objective
 * @returns Formatted markdown for a SMART objective
 */
export const generateSmartObjective = (
  title: string,
  specific: string,
  measurable: string,
  achievable: string,
  relevant: string,
  timeBound: string
): string => `**${title}**
- **Specific:** ${specific}
- **Measurable:** ${measurable}
- **Achievable:** ${achievable}
- **Relevant:** ${relevant}
- **Time-bound:** ${timeBound}
`;

/**
 * Generate a comprehensive Business Plan objectives section
 * @param objectives Array of objective configurations
 * @returns Formatted markdown for Business Plan objectives section
 */
export const generateBusinessPlanObjectives = (
  objectives: Array<{
    title: string;
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
  }>
): string => {
  const objectivesMarkdown = objectives
    .map(obj => generateSmartObjective(
      obj.title, 
      obj.specific, 
      obj.measurable, 
      obj.achievable, 
      obj.relevant, 
      obj.timeBound
    ))
    .join('\n\n');

  return `### Business Objectives

${objectivesMarkdown}

These structured objectives provide a clear roadmap for achieving our mission, ensuring that every goal is actionable, measurable, and aligned with our commitment to excellence and innovation.`;
};

/**
 * Generate a detailed explanation of the SMART goal framework
 * @returns Markdown-formatted explanation of SMART goal methodology
 */
export const generateSMARTGoalContext = (): string => `### Understanding SMART Goals

The SMART goal framework is a critical tool for strategic planning and objective setting. Each component of a SMART goal ensures that the objective is well-defined, actionable, and achievable:

- **Specific:** Clearly define what needs to be accomplished. Avoid vague statements and focus on precise, well-defined outcomes.
  - Example: Instead of "Improve sales", use "Increase quarterly sales by 15% in the enterprise software segment"

- **Measurable:** Establish concrete criteria for measuring progress. Quantify your objectives to track advancement and know when the goal is achieved.
  - Example: Use specific metrics like percentages, dollar amounts, or numerical targets

- **Achievable:** Ensure the goal is realistic and attainable. Consider current resources, constraints, and capabilities while setting challenging yet possible objectives.
  - Example: Set goals that stretch your capabilities but remain within the realm of possibility given your current resources and expertise

- **Relevant:** Align the objective with broader business strategies, mission, and long-term vision. The goal should matter to the organization and contribute to its overall success.
  - Example: Directly link the objective to key business outcomes or strategic priorities

- **Time-bound:** Set a clear timeframe for achieving the objective. A defined timeline creates urgency and helps in planning and resource allocation.
  - Example: Specify exact dates or periods, such as "within the next 12 months" or "by Q4 of the current fiscal year"

**Benefits of SMART Goals:**
- Provides clarity and direction
- Increases motivation and accountability
- Enables precise tracking and measurement
- Aligns individual and team efforts with organizational objectives
- Facilitates more effective strategic planning and execution

When developing SMART goals, continuously review and refine them to ensure they remain relevant and impactful.`;

/**
 * Generate a comprehensive Business Plan prompt for AI response generation
 * @param companyName Name of the company
 * @param objectives Array of objective configurations
 * @param additionalContext Optional additional context or specific requirements
 * @returns Fully formatted prompt for AI-generated Business Plan section
 */
export const generateBusinessPlanPrompt = (
  companyName: string,
  objectives: Array<{
    title: string;
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
  }>,
  additionalContext?: string
): string => {
  const objectivesSection = generateBusinessPlanObjectives(objectives);
  const smartGoalContext = generateSMARTGoalContext();
  
  return `${baseFinancialContext}

# Business Plan for ${companyName}

## Executive Summary
Provide a concise overview of ${companyName}'s strategic direction, key strengths, and primary business objectives.

${objectivesSection}

## SMART Goal Methodology
${smartGoalContext}

## Strategic Analysis
${additionalContext || 'Conduct a comprehensive analysis of the company\'s current position, market opportunities, and potential challenges.'}

### Goal Setting Context
For each objective outlined above, we have applied the SMART goal framework to ensure:
- Precise and clear goal definition
- Measurable outcomes
- Realistic and achievable targets
- Alignment with broader business strategy
- Clear timelines for implementation

### Market Positioning
- Describe the unique value proposition
- Analyze competitive landscape
- Identify key market opportunities

### Risk Assessment
- Outline potential risks and mitigation strategies
- Provide contingency planning recommendations

## Financial Projections
- Develop detailed financial forecasts
- Include revenue models, cost structures, and growth projections

## Implementation Roadmap
- Break down objectives into actionable phases
- Define key milestones and success metrics
- Establish timeline for strategic initiatives

${formatInstructions}

Ensure all recommendations are:
- Aligned with ${companyName}'s core mission
- Supported by data-driven insights
- Practical and implementable
- Focused on long-term sustainable growth`;
};
