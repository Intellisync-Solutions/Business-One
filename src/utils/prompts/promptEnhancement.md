# Intellisync Business Suite Prompt Enhancement Strategy

## Core Principles for High-Quality Prompts

1. **Contextual Richness**: Every prompt should provide comprehensive context about the business domain, financial principles, and specific analysis requirements.

2. **Structured Output Format**: All prompts should explicitly define the expected output structure with clear section headers and formatting requirements.

3. **Domain Expertise Guidance**: Prompts should guide the AI to adopt the perspective of a specific type of financial expert relevant to the analysis.

4. **Data Interpretation Framework**: Include specific instructions on how to interpret numerical data and financial metrics.

5. **Actionable Insights Focus**: Direct the AI to prioritize actionable recommendations over theoretical explanations.

6. **Audience Adaptation**: Tailor the language complexity and terminology based on the intended audience (business owner, financial professional, etc.).

7. **Visual Presentation Guidance**: Include instructions for formatting data in ways that enhance readability (tables, bullet points, hierarchical sections).

8. **Consistent Terminology**: Maintain consistent financial terminology across all prompts.

## Prompt Structure Template

```typescript
/**
 * Standard Prompt Structure
 * 
 * 1. Expert Role Definition
 * 2. Context Setting
 * 3. Data Presentation
 * 4. Analysis Requirements
 * 5. Output Structure Requirements
 * 6. Formatting Instructions
 * 7. Tone and Style Guidelines
 */

export const generateStandardPrompt = (data: any): string => {
  return `
  ${expertRoleDefinition}

  ${contextSetting}

  ${dataPresentationSection(data)}

  ${analysisRequirements}

  ${outputStructureRequirements}

  ${formattingInstructions}

  ${toneAndStyleGuidelines}
  `;
};
```

## Implementation Recommendations

1. **Enhance Base Context**
   - Expand the financial context to include more specific industry standards
   - Add regional regulatory considerations
   - Include economic trend awareness

2. **Improve Format Instructions**
   - Add visual hierarchy guidelines
   - Include data presentation best practices
   - Specify professional terminology requirements

3. **Standardize Section Headers**
   - Create a consistent set of section headers across all analyses
   - Define subsection structure for complex analyses

4. **Enhance Data Interpretation Guidance**
   - Add benchmark comparison instructions
   - Include trend analysis requirements
   - Specify risk assessment frameworks

5. **Implement Audience-Specific Variations**
   - Create different prompt variations based on user expertise level
   - Adjust terminology complexity accordingly

## Example Enhanced Prompt Components

### Expert Role Definition
```typescript
export const financialAdvisorRole = `
You are an elite financial strategist with 20+ years of experience advising Canadian businesses. You specialize in translating complex financial data into actionable business strategies. Your expertise includes:

- Advanced financial ratio analysis and interpretation
- Strategic business valuation methodologies
- Cash flow optimization techniques
- Risk assessment and mitigation strategies
- Industry-specific benchmarking

Your advice is always practical, data-driven, and tailored to the specific business context.
`;
```

### Enhanced Output Structure
```typescript
export const enhancedOutputStructure = `
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
```

### Enhanced Formatting Instructions
```typescript
export const enhancedFormattingInstructions = `
Format your response using these precise guidelines:

1. Use markdown formatting for optimal readability:
   - # for main section headers
   - ## for subsection headers
   - ### for topic headers within subsections
   - **Bold text** for key metrics and important concepts
   - *Italic text* for emphasis and technical terms (first instance only)
   - Bullet points for lists of related items
   - Numbered lists for sequential steps or prioritized recommendations

2. For numerical data:
   - Always include % symbols for percentages
   - Use consistent decimal precision (2 decimal places for percentages, whole numbers for currency)
   - Format large numbers with commas as thousand separators
   - Include currency symbols for all monetary values
   - Present comparative data in parentheses (e.g., "20% increase (from 15%)")

3. For recommendations:
   - Begin with an action verb
   - Specify expected outcome
   - Include implementation complexity (Low/Medium/High)
   - Note timeframe for expected results
`;
```
