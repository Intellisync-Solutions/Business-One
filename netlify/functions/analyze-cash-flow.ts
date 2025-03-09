import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { generateCashFlowAnalysisPrompt } from '../../src/utils/prompts/specializedPrompts';

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
    
    const { 
      operatingCashFlow, 
      investingCashFlow, 
      financingCashFlow, 
      netCashFlow, 
      cashFlowRatio, 
      previousPeriodData 
    } = requestBody;

    // Validate required data
    if (operatingCashFlow === undefined || 
        investingCashFlow === undefined || 
        financingCashFlow === undefined || 
        netCashFlow === undefined || 
        cashFlowRatio === undefined) {
      console.error('Missing data:', { 
        operatingCashFlow, 
        investingCashFlow, 
        financingCashFlow, 
        netCashFlow, 
        cashFlowRatio 
      });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required cash flow data' }),
      };
    }

    // Generate the analysis prompt
    const prompt = generateCashFlowAnalysisPrompt(
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow,
      cashFlowRatio,
      previousPeriodData
    );
    console.log('Generated prompt:', prompt);

    // Generate the analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an experienced financial advisor specializing in cash flow analysis. 
          
          Provide your response in TWO DISTINCT SECTIONS with these exact headers:
          
          # Analysis:
          [Provide a thorough analysis of the cash flow data, focusing on:
          - Overall cash flow health assessment
          - Interpretation of operating, investing, and financing activities
          - Sustainability assessment of current cash flow patterns
          - Potential risks based on cash flow trends]

          # Recommendations:
          [Provide specific, actionable recommendations, focusing on:
          - Cash flow management improvement strategies
          - Specific actions to address weaknesses
          - Opportunities to leverage cash flow strengths
          - Prioritized next steps for financial management]

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
