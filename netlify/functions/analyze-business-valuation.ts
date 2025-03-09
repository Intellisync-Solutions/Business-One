import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { generateBusinessValuationPrompt } from '../../src/utils/prompts/specializedPrompts';

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
    
    // The BusinessValuationAnalysis component sends the form data directly
    // Map the incoming data to the expected structure for the prompt
    const valuationData = {
      annualRevenue: requestBody.revenue || 0,
      netProfit: requestBody.netIncome || 0,
      growthRate: requestBody.growthRate || 0,
      industryMultiple: 4.5, // Default industry multiple if not provided
      assetValue: requestBody.totalAssets || 0,
      liabilities: requestBody.totalLiabilities || 0,
      discountRate: requestBody.discountRate || 0.1,
      projectionYears: 5, // Default projection years
      companyName: requestBody.companyName,
      industry: requestBody.industry
    };

    // Validate required data
    if (!requestBody.companyName || !requestBody.industry) {
      console.error('Missing required data:', requestBody);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required business data (company name and industry)' }),
      };
    }

    // Generate the analysis prompt
    const prompt = generateBusinessValuationPrompt(valuationData);
    console.log('Generated prompt:', prompt);

    // Generate the analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an experienced business valuation expert. 
          
          Provide your response in TWO DISTINCT SECTIONS with these exact headers:
          
          # Analysis:
          [Provide a thorough analysis of the business valuation, focusing on:
          - Comprehensive valuation assessment
          - Comparison of different valuation methods
          - Key value drivers and risk factors
          - Context for the valuation range]

          # Recommendations:
          [Provide specific, actionable recommendations, focusing on:
          - Strategies to increase business value
          - Risk mitigation steps
          - Preparation for potential sale or investment
          - Prioritized next steps for value enhancement]

          IMPORTANT: 
          1. Start each section with the EXACT headers shown above (# Analysis: and # Recommendations:)
          2. Keep sections clearly separated
          3. Use markdown formatting (###, ####, **, -) for structure`
        },
        {
          role: "user",
          content: prompt
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

    // Return the analysis
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        analysis: analysisSection,
        recommendations: recommendationsSection
      }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Error processing request' }),
    };
  }
};
