/**
 * Enhanced Format Instructions for Intellisync Business Suite
 * 
 * This module provides detailed formatting instructions for AI-generated content
 * to ensure consistent, professional, and visually appealing outputs across all
 * financial analyses in the application.
 */

// Core formatting instructions for all financial analyses
export const enhancedFormatInstructions = `
Format your response using these precise guidelines:

1. DOCUMENT STRUCTURE
   - Use a clear hierarchical structure with properly nested headings
   - Include an executive summary at the beginning
   - Group related information into logical sections
   - End with a concise, actionable conclusion

2. MARKDOWN FORMATTING
   - Use # for main section headers
   - Use ## for subsection headers
   - Use ### for topic headers within subsections
   - Use **bold text** for key metrics and important concepts
   - Use *italic text* for emphasis and technical terms (first instance only)
   - Use bullet points for lists of related items
   - Use numbered lists for sequential steps or prioritized recommendations
   - Use horizontal rules (---) to separate major sections when appropriate
   - Use blockquotes (>) for important notes or warnings

3. NUMERICAL DATA PRESENTATION
   - Always include % symbols for percentages
   - Use consistent decimal precision (2 decimal places for percentages, whole numbers for currency)
   - Format large numbers with commas as thousand separators
   - Include currency symbols for all monetary values
   - Present comparative data in parentheses (e.g., "20% increase (from 15%)")
   - Use consistent units of measurement throughout

4. VISUAL CLARITY
   - Use whitespace effectively to separate sections
   - Keep paragraphs concise (3-5 sentences maximum)
   - Use tables for comparing multiple data points
   - Use bullet points for lists with more than 3 items
   - Highlight critical information visually
`;

// Standard output structure for financial analyses
export const standardOutputStructure = `
Structure your response using the following precise format:

## Executive Summary
Provide a 3-5 sentence overview of the key findings and most critical recommendations.

## Key Metrics Analysis
- Present the most important metrics with their interpretation
- Include comparative benchmarks where applicable
- Highlight concerning trends or exceptional performance

## Strategic Implications
### Strengths
[Identify 2-3 financial strengths with supporting data]

### Areas for Improvement
[Identify 2-3 financial weaknesses with supporting data]

### Risk Assessment
[Evaluate key financial risks with probability and impact estimates]

## Actionable Recommendations
1. [Primary recommendation with implementation steps]
2. [Secondary recommendation with implementation steps]
3. [Tertiary recommendation with implementation steps]

## Next Steps Timeline
- Immediate (0-30 days): [Specific actions]
- Short-term (1-3 months): [Specific actions]
- Medium-term (3-12 months): [Specific actions]
`;

// Specialized output structure for ratio analysis
export const ratioAnalysisOutputStructure = `
Structure your response using the following precise format:

## Ratio Analysis: [Ratio Name]

### Interpretation
- Current value: [Value with appropriate formatting]
- Industry benchmark: [Benchmark with appropriate formatting]
- Variance from benchmark: [Variance with appropriate formatting]
- Performance assessment: [Excellent/Good/Adequate/Concerning/Critical]

### Impact Analysis
- Business area affected: [Specific business function or process]
- Potential consequences: [Specific outcomes if not addressed]
- Related metrics to monitor: [Other metrics affected by or affecting this ratio]

### Improvement Strategies
1. [Primary strategy with specific implementation steps]
2. [Secondary strategy with specific implementation steps]
3. [Monitoring recommendation with specific metrics and targets]
`;

// Specialized output structure for cash flow analysis
export const cashFlowOutputStructure = `
Structure your response using the following precise format:

## Cash Flow Analysis

### Cash Flow Health Assessment
- Overall cash position: [Strong/Stable/Concerning/Critical]
- Cash flow trend: [Improving/Stable/Declining] with [X%] [increase/decrease] [period-over-period]
- Cash conversion cycle: [X days] compared to industry average of [Y days]

### Cash Flow Component Analysis
#### Operating Cash Flow
[Detailed analysis of operating cash flow with specific drivers]

#### Investing Cash Flow
[Detailed analysis of investing cash flow with specific drivers]

#### Financing Cash Flow
[Detailed analysis of financing cash flow with specific drivers]

### Liquidity Risk Assessment
- Short-term liquidity risk: [Low/Moderate/High]
- Long-term solvency outlook: [Strong/Stable/Concerning]
- Key risk factors: [Specific factors affecting cash position]

### Cash Management Recommendations
1. [Primary recommendation with implementation steps]
2. [Secondary recommendation with implementation steps]
3. [Tertiary recommendation with implementation steps]
`;

// Specialized output structure for break-even analysis
export const breakEvenOutputStructure = `
Structure your response using the following precise format:

## Break-Even Analysis

### Current Break-Even Position
- Break-even point: [X units] or [$ amount]
- Current production/sales: [X units] or [$ amount]
- Margin of safety: [X units (Y%)] or [$ amount (Y%)]

### Cost Structure Analysis
- Fixed costs: [$ amount] ([X%] of total costs)
- Variable costs per unit: [$ amount] ([Y%] of selling price)
- Contribution margin per unit: [$ amount] ([Z%] of selling price)

### Sensitivity Analysis
- Impact of [X%] price increase: [New break-even point]
- Impact of [Y%] fixed cost reduction: [New break-even point]
- Impact of [Z%] variable cost reduction: [New break-even point]

### Profitability Strategies
1. [Primary strategy focusing on price, volume, fixed costs, or variable costs]
2. [Secondary strategy with specific implementation steps]
3. [Tertiary strategy with specific implementation steps]
`;

// Specialized output structure for investment analysis
export const investmentOutputStructure = `
Structure your response using the following precise format:

## Investment Analysis

### Investment Summary
- Net Present Value (NPV): [$ amount]
- Internal Rate of Return (IRR): [X%]
- Payback Period: [X years/months]
- Return on Investment (ROI): [X%]

### Risk Assessment
- Risk level: [Low/Moderate/High]
- Sensitivity factors: [Key variables affecting outcome]
- Scenario analysis: [Best/Expected/Worst case outcomes]

### Comparative Analysis
- Alternative investment options
- Opportunity cost assessment
- Strategic alignment evaluation

### Investment Recommendation
- [Proceed/Modify/Reject] recommendation with justification
- Implementation considerations
- Key performance indicators to monitor
`;

// Specialized output structure for business valuation
export const valuationOutputStructure = `
Structure your response using the following precise format:

## Business Valuation

### Valuation Summary
- Recommended valuation range: [$ amount] to [$ amount]
- Primary valuation method: [Method name with brief explanation]
- Supporting valuation methods: [Method names with brief explanations]

### Valuation Method Breakdown
#### [Primary Method Name]
[Detailed explanation with calculations and assumptions]

#### [Supporting Method Name]
[Detailed explanation with calculations and assumptions]

### Value Drivers and Detractors
#### Key Value Drivers
- [Driver 1 with specific impact]
- [Driver 2 with specific impact]
- [Driver 3 with specific impact]

#### Value Detractors
- [Detractor 1 with specific impact]
- [Detractor 2 with specific impact]
- [Detractor 3 with specific impact]

### Value Enhancement Strategies
1. [Primary strategy with implementation steps]
2. [Secondary strategy with implementation steps]
3. [Tertiary strategy with implementation steps]
`;
