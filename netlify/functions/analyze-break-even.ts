import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import { Buffer } from 'buffer';

// Secure environment variable access
const openaiApiKey = process.env.OPENAI_API_KEY;

// Validate API key at startup
if (!openaiApiKey) {
  console.error('OpenAI API Key is not configured. Please add OPENAI_API_KEY to your environment variables.');
  throw new Error('OpenAI API Key is not configured');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openaiApiKey
});

interface BreakEvenData {
  fixedCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  mode: 'standard' | 'findPrice' | 'findUnits' | 'profitTarget';
  targetUnits?: number;
  targetProfit?: number;
  targetProfitPercentage?: number;
  profitInputMode?: 'fixed' | 'percentage';
}

interface BreakEvenResult {
  breakEvenUnits?: number;
  breakEvenPrice?: number;
  totalRevenueAtBreakEven?: number;
  contributionMargin?: number;
  profitMargin?: number;
  requiredPrice?: number;
  targetProfitAmount?: number;
}

const generateBreakEvenAnalysisPrompt = (data: BreakEvenData, result: BreakEvenResult): string => {
  const { 
    fixedCosts, 
    variableCostPerUnit, 
    sellingPricePerUnit, 
    mode 
  } = data;

  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return `Provide a comprehensive break-even analysis based on the following business financial data:

FINANCIAL INPUTS:
- Fixed Costs: ${formatCurrency(fixedCosts)}
- Variable Cost per Unit: ${formatCurrency(variableCostPerUnit)}
- Selling Price per Unit: ${formatCurrency(sellingPricePerUnit)}
- Calculation Mode: ${mode}

BREAK-EVEN METRICS:
- Break-Even Units: ${result.breakEvenUnits ? result.breakEvenUnits.toLocaleString() : 'N/A'}
- Total Revenue at Break-Even: ${result.totalRevenueAtBreakEven ? formatCurrency(result.totalRevenueAtBreakEven) : 'N/A'}
- Contribution Margin: ${result.contributionMargin ? formatCurrency(result.contributionMargin) : 'N/A'}
${result.requiredPrice ? `- Required Price per Unit: ${formatCurrency(result.requiredPrice)}` : ''}

Please provide a strategic analysis that includes:
1. Break-Even Interpretation:
   - What does the break-even point mean for this business?
   - Assess the feasibility of reaching the break-even point

2. Financial Strategy Recommendations:
   - Strategies to reduce fixed or variable costs
   - Pricing optimization suggestions
   - Potential ways to increase contribution margin

3. Risk Assessment:
   - Identify potential challenges in reaching break-even
   - Discuss market and operational risks

4. Comparative Analysis:
   - How do these metrics compare to industry benchmarks?
   - Provide context for the break-even calculations

Offer actionable, concise insights that a business owner can use to make informed financial decisions.`;
}

export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body || '{}');
    console.log('Received request body:', requestBody);
    
    const { breakEvenData, breakEvenResult } = requestBody;

    // Validate required data
    if (!breakEvenData || !breakEvenResult) {
      console.error('Missing data:', { breakEvenData, breakEvenResult });
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing required break-even data' }),
      };
    }

    // Generate the analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an experienced financial strategist specializing in break-even analysis. 
          
          Provide your response in TWO DISTINCT SECTIONS with these exact headers:
          
          # Analysis:
          [Provide a thorough analysis of the break-even calculations, focusing on:
          - Break-even point interpretation
          - Financial metrics assessment
          - Key factors affecting profitability
          - Current pricing strategy evaluation]

          # Recommendations:
          [Provide specific, actionable recommendations, focusing on:
          - Cost reduction strategies
          - Revenue optimization tactics
          - Pricing adjustments
          - Risk mitigation steps]

          IMPORTANT: 
          1. Start each section with the EXACT headers shown above (# Analysis: and # Recommendations:)
          2. Keep sections clearly separated
          3. Use markdown formatting (###, ####, **, -) for structure`
        },
        {
          role: "user",
          content: generateBreakEvenAnalysisPrompt(breakEvenData, breakEvenResult)
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const analysis = completion.choices[0].message.content;
    console.log('Generated analysis length:', analysis?.length);

    if (!analysis) {
      console.error('No analysis generated from OpenAI');
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'No analysis generated' }),
      };
    }

    // Split the analysis into sections using the exact headers
    const sections = analysis.split(/^# /m).filter(Boolean);
    let analysisSection = '';
    let recommendationsSection = '';

    sections.forEach(section => {
      if (section.startsWith('Analysis:')) {
        analysisSection = section.replace('Analysis:', '').trim();
      } else if (section.startsWith('Recommendations:')) {
        recommendationsSection = section.replace('Recommendations:', '').trim();
      }
    });

    if (!analysisSection || !recommendationsSection) {
      console.error('Analysis not properly formatted. Raw content:', analysis);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Analysis not properly formatted' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        analysis: analysisSection,
        recommendations: recommendationsSection,
        length: analysis.length 
      }),
    };

  } catch (error) {
    console.error('Error in analyze-break-even:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate analysis' 
      }),
    };
  }
};
