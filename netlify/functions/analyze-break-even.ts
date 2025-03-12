import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { generateEnhancedBreakEvenAnalysisPrompt } from '../../src/utils/prompts/enhancedPromptManager';

// NOTE: This file is being maintained for backward compatibility with the BreakEvenCalculator component.
// New components should use analyze-break-even-custom.ts which will eventually replace this function.

// Explicitly load environment variables
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env') 
});

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

// Use the standardized prompt generator from specializedPrompts.ts

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Adjust this in production
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  // Log incoming request details
  console.log('Incoming request:', {
    method: event.httpMethod,
    body: event.body,
    headers: event.headers
  });

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.error('Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body || '{}');
    console.log('Parsed request body:', requestBody);
    
    const { breakEvenData, breakEvenResult } = requestBody as { breakEvenData: BreakEvenData, breakEvenResult: BreakEvenResult };

    // Validate required data
    if (!breakEvenData || !breakEvenResult) {
      console.error('Missing data:', { breakEvenData, breakEvenResult });
      return {
        statusCode: 400,
        headers: corsHeaders,
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
          
          Provide your response in EXACTLY TWO SECTIONS with these EXACT headers:
          
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

          CRITICAL INSTRUCTIONS: 
          1. You MUST start each section with the EXACT headers shown above: '# Analysis:' and '# Recommendations:' (including the # symbol and colon)
          2. Do NOT add any other main headers with # symbols
          3. Do NOT modify these headers in any way
          4. Keep sections clearly separated
          5. Use markdown formatting (###, ####, **, -) for structure within each section`
        },
        {
          role: "user",
          content: generateEnhancedBreakEvenAnalysisPrompt(breakEvenData, breakEvenResult)
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
        headers: corsHeaders,
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
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Analysis not properly formatted',
          rawContent: analysis 
        }),
      };
    }

    // Return successful response with CORS headers
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        analysis: analysisSection, 
        recommendations: recommendationsSection 
      }),
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Unexpected server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
    };
  }
};
