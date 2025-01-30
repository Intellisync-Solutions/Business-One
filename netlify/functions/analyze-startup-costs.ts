import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import { AnalysisRequest, generateStartupAnalysisPrompt } from '../../src/utils/analysisPrompts';

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

export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse and validate request body
    if (!event.body) {
      throw new Error('Request body is required');
    }

    const data: AnalysisRequest = JSON.parse(event.body);
    const prompt = generateStartupAnalysisPrompt(data);

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
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const analysis = completion.choices[0].message.content;

    if (!analysis) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No analysis generated' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ analysis }),
    };

  } catch (error) {
    console.error('Error in analyze-startup-costs:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate analysis' 
      }),
    };
  }
};
