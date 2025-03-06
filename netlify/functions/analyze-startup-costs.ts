import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

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

interface CostBreakdown {
  fixed: number;
  variable: number;
  total: number;
}

interface CostTotals {
  oneTime: CostBreakdown;
  monthly: CostBreakdown;
  inventory: CostBreakdown;
}

interface FinancialMetrics {
  totalStartupCost: number;
  monthlyOperatingCost: number;
  recommendedCashReserve: number;
  totalInitialCapital: number;
}

interface AnalysisRequest {
  costs: CostTotals;
  metrics: FinancialMetrics;
}

const generateAnalysisPrompt = (data: AnalysisRequest): string => {
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
- Recommended Cash Reserve (6 months): $${metrics.recommendedCashReserve.toLocaleString()}
- Total Initial Capital Required: $${metrics.totalInitialCapital.toLocaleString()}

Please provide a concise analysis that includes:
1. Cost Structure Assessment:
   - Evaluate the balance between fixed and variable costs
   - Identify potential risks or advantages in the current cost structure
   
2. Financial Health Indicators:
   - Analyze the sustainability of monthly operating costs
   - Assess the adequacy of the cash reserve
   
3. Strategic Recommendations:
   - Suggest areas for potential cost optimization
   - Identify key financial considerations for success
   
4. Industry Context:
   - Compare these metrics to typical startup benchmarks
   - Highlight any unusual patterns or concerns

Please provide actionable insights that can help in decision-making.`;
};

export const handler: Handler = async (event, context) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // Be more specific in production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Successful preflight call.' }),
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const requestBody = event.body ? JSON.parse(event.body) : null;

    if (!requestBody) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request body' }),
      };
    }

    const { costs, metrics } = requestBody;

    // Validate required data with more detailed logging
    if (!costs) {
      console.error('Missing costs data', requestBody);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required cost data (costs)' }),
      };
    }

    if (!metrics) {
      console.error('Missing metrics data', requestBody);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required cost data (metrics)' }),
      };
    }

    // Generate the analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an experienced business financial advisor specializing in startup finances and business planning. 
          Your role is to provide clear, actionable insights based on startup cost data. 
          Focus on practical advice, industry benchmarks, and risk assessment.
          Be concise but thorough, and always maintain a professional, advisory tone.`
        },
        {
          role: "user",
          content: generateAnalysisPrompt({ costs, metrics })
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const analysis = completion.choices[0].message.content;

    if (!analysis) {
      console.error('No analysis generated', { costs, metrics });
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'No analysis generated' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ analysis }),
    };

  } catch (error) {
    console.error('Detailed error in analyze-startup-costs:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      requestBody: event.body
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate analysis',
        details: error instanceof Error ? error.stack : 'No additional details'
      }),
    };
  }
};
