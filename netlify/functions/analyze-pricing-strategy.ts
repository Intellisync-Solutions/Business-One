import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

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

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Adjust this in production
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Interfaces for type safety
interface CostStructure {
  fixedCosts: number;
  variableCostPerUnit: number;
  targetProfitPercentage: number;
}

interface MarketData {
  competitorPrice: number;
  marketSize: number;
  priceElasticity: number;
}

interface PricingScenario {
  price: number;
  volume: number;
  revenue: number;
  variableCosts: number;
  totalCosts: number;
  profit: number;
  targetProfit: number;
  profitMargin: number;
  meetsTargetProfit: boolean;
}

interface BreakEvenAnalysis {
  point: number;
  optimalPrice: number;
  optimalPriceRange: {
    min: number;
    max: number;
  };
  marketSensitivity: number;
  min: number;
  max: number;
}

// Import the shared prompt generator
import { generatePricingStrategyPrompt } from '../utils/sharedPrompts';

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

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
    
    const { 
      breakEvenAnalysis, 
      scenarios, 
      costStructure, 
      marketData 
    } = requestBody;

    // Validate required data
    if (!breakEvenAnalysis || !scenarios || !costStructure || !marketData) {
      console.error('Missing data:', { 
        breakEvenAnalysis, 
        scenarios, 
        costStructure, 
        marketData 
      });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required pricing data' }),
      };
    }

    // Generate the analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert pricing strategy consultant specializing in financial analysis and market positioning.
          
          Your role is to provide clear, actionable insights based on pricing strategy data.
          Focus on practical advice, market positioning, and risk assessment.
          Be concise but thorough, and always maintain a professional, advisory tone.
          
          Provide your response in the exact format specified in the prompt, using proper markdown
          formatting with clear section headers, bullet points, and numbered lists as appropriate.
          
          IMPORTANT: 
          1. Start each section with the EXACT headers shown in the format instructions
          2. Keep sections clearly separated
          3. Use markdown formatting (###, ####, **, -) for structure`
        },
        {
          role: "user",
          content: generatePricingStrategyPrompt(
            breakEvenAnalysis, 
            scenarios, 
            costStructure, 
            marketData
          )
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
