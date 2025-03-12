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

// Import the enhanced prompt generator
import { generateEnhancedStartupAnalysisPrompt } from '../../src/utils/prompts/enhancedPromptManager';

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

    const { costs, metrics } = requestBody as AnalysisRequest;

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

    // Log the request data for debugging
    console.log('Processing analysis request with data:', {
      costsSummary: {
        oneTimeTotal: costs?.oneTime?.total || 0,
        monthlyTotal: costs?.monthly?.total || 0,
        inventoryTotal: costs?.inventory?.total || 0
      },
      metricsSummary: {
        totalStartupCost: metrics?.totalStartupCost || 0,
        monthlyOperatingCost: metrics?.monthlyOperatingCost || 0
      }
    });
    
    // Generate the analysis
    let analysis: string;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an experienced business financial advisor specializing in startup finances and business planning. 
            Your role is to provide clear, actionable insights based on startup cost data.
            Focus on practical advice, industry benchmarks, and risk assessment.
            Be concise but thorough, and always maintain a professional, advisory tone.
            Follow the formatting instructions provided in the prompt exactly.`
          },
          {
            role: "user",
            content: generateEnhancedStartupAnalysisPrompt({ costs, metrics })
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      console.log('OpenAI API call successful');
      analysis = completion.choices[0].message.content || '';
    } catch (error: unknown) {
      console.error('OpenAI API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }
    
    if (!analysis) {
      throw new Error('No analysis generated from the OpenAI API');
    }

    // Analysis existence already checked in the try-catch block
    console.log('Analysis generated successfully:', analysis.substring(0, 100) + '...');

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
