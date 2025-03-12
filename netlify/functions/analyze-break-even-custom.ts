import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { generateEnhancedBreakEvenAnalysisPrompt } from '../../src/utils/prompts/enhancedPromptManager';

// NOTE: This is the preferred implementation for break-even analysis that uses the standardized prompt generator
// from specializedPrompts.ts. It provides more structured analysis and recommendations aligned with other financial functions.
// This function is used by the newer BreakEvenAnalysis component in /src/components/financial/
// The analyze-break-even.ts function is maintained for backward compatibility with older components.

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
    
    const { breakEvenData, breakEvenResult } = requestBody;

    // Validate required data
    if (!breakEvenData || !breakEvenResult) {
      console.error('Missing data:', { breakEvenData, breakEvenResult });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required break-even data' }),
      };
    }
    
    // Validate essential fields
    if (typeof breakEvenData.fixedCosts !== 'number' || 
        typeof breakEvenData.variableCostPerUnit !== 'number' || 
        typeof breakEvenData.sellingPricePerUnit !== 'number') {
      console.error('Invalid break-even data format:', breakEvenData);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid break-even data format. Required numeric fields: fixedCosts, variableCostPerUnit, sellingPricePerUnit' }),
      };
    }
    
    // Log the data we're about to process
    console.log('Processing break-even data:', {
      productName: breakEvenData.productName,
      fixedCosts: breakEvenData.fixedCosts,
      variableCostPerUnit: breakEvenData.variableCostPerUnit,
      sellingPricePerUnit: breakEvenData.sellingPricePerUnit,
      mode: breakEvenData.mode
    });

    // Generate the analysis prompt using enhanced prompt system
    const prompt = generateEnhancedBreakEvenAnalysisPrompt(breakEvenData, breakEvenResult);
    console.log('Generated prompt:', prompt);

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

    // Fallback if the expected sections are not found
    if (!analysisSection || !recommendationsSection) {
      console.log('Could not find expected sections in response. Attempting alternative parsing.');
      
      // Try alternative parsing methods
      const analysisSectionAlt = analysis.match(/# Analysis:([\s\S]*?)(?=# Recommendations:|$)/i);
      const recommendationsSectionAlt = analysis.match(/# Recommendations:([\s\S]*?)$/i);
      
      if (analysisSectionAlt && analysisSectionAlt[1]) {
        analysisSection = analysisSectionAlt[1].trim();
      }
      
      if (recommendationsSectionAlt && recommendationsSectionAlt[1]) {
        recommendationsSection = recommendationsSectionAlt[1].trim();
      }
    }

    // If we still don't have both sections, use a simple split
    if (!analysisSection || !recommendationsSection) {
      console.log('Still missing sections. Using simple split method.');
      const parts = analysis.split('# Recommendations:');
      if (parts.length >= 2) {
        if (!analysisSection) analysisSection = parts[0].replace('# Analysis:', '').trim();
        if (!recommendationsSection) recommendationsSection = parts[1].trim();
      }
    }

    // Final fallback - if all parsing methods fail, just return the whole text as analysis
    if (!analysisSection && !recommendationsSection) {
      console.log('All parsing methods failed. Using full text as analysis.');
      analysisSection = analysis;
      recommendationsSection = 'Please see the analysis section for all information.';
    }

    console.log('Final analysis length:', analysisSection.length);
    console.log('Final recommendations length:', recommendationsSection.length);

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
