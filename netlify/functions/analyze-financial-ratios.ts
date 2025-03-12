import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { generateEnhancedFinancialHealthAnalysisPrompt } from '../../src/utils/prompts/enhancedPromptManager';

// Explicitly load environment variables from multiple possible locations
try {
  // Try to load from .env file in project root
  dotenv.config({ 
    path: path.resolve(process.cwd(), '.env') 
  });
  
  // Also try to load from netlify directory
  dotenv.config({ 
    path: path.resolve(process.cwd(), 'netlify', '.env') 
  });
  
  console.log('Environment variables loaded, checking for OPENAI_API_KEY');
} catch (envError) {
  console.error('Error loading environment variables:', envError);
}

// Secure environment variable access
const openaiApiKey = process.env.OPENAI_API_KEY;

// Log API key status (without revealing the key)
console.log('OpenAI API Key status:', {
  configured: !!openaiApiKey,
  length: openaiApiKey ? openaiApiKey.length : 0
});

// Initialize OpenAI client - we'll handle missing API key in the handler function
let openai: OpenAI;

try {
  openai = new OpenAI({
    apiKey: openaiApiKey || 'dummy-key-for-initialization'
  });
} catch (initError) {
  console.error('Error initializing OpenAI client:', initError);
  // We'll continue and handle this in the handler function
}

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

  // Check if OpenAI API key is configured
  if (!openaiApiKey) {
    console.error('OpenAI API Key is missing. Cannot process request.');
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Server configuration error', 
        details: 'OpenAI API Key is not configured. Please contact the administrator.',
        timestamp: new Date().toISOString()
      }),
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
    
    const { ratiosByCategory, calculatedRatios } = requestBody;

    // Validate required data
    if (!ratiosByCategory || !calculatedRatios) {
      console.error('Missing data:', { ratiosByCategory, calculatedRatios });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required financial ratio data' }),
      };
    }
    
    // Check if we have enough calculated ratios for meaningful analysis
    const totalCalculatedRatios = Object.keys(calculatedRatios).length;
    console.log('Total calculated ratios:', totalCalculatedRatios);
    
    if (totalCalculatedRatios < 3) {
      console.error('Insufficient data for analysis. Need at least 3 ratios, got:', totalCalculatedRatios);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Insufficient data for analysis', 
          details: 'Please calculate at least 3 financial ratios for a meaningful analysis.'
        }),
      };
    }

    // Generate the analysis prompt using enhanced prompt system
    const prompt = generateEnhancedFinancialHealthAnalysisPrompt(ratiosByCategory, calculatedRatios);
    console.log('Generated prompt length:', prompt.length);

    // Generate the analysis
    let completion;
    try {
      // Log OpenAI configuration (without sensitive data)
      console.log('OpenAI configuration:', {
        modelUsed: 'gpt-4o-mini',
        apiKeyConfigured: !!openaiApiKey,
        apiKeyLength: openaiApiKey ? openaiApiKey.length : 0,
        promptLength: prompt.length
      });
      
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an experienced financial analyst specializing in ratio analysis. 
            
            Provide your response in TWO DISTINCT SECTIONS with these exact headers:
            
            # Analysis:
            [Provide a thorough analysis of the financial ratios, focusing on:
            - Overall financial health assessment
            - Strengths and weaknesses identified
            - Comparison to industry benchmarks
            - Potential red flags or areas of concern]

            # Recommendations:
            [Provide specific, actionable recommendations, focusing on:
            - Strategies to improve problematic ratios
            - Opportunities to leverage financial strengths
            - Specific actions to address weaknesses
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
      
      console.log('OpenAI API call successful');
    } catch (apiError) {
      console.error('OpenAI API call failed:', apiError);
      
      // Provide detailed error information
      const errorDetails = apiError instanceof Error ? {
        message: apiError.message,
        name: apiError.name,
        stack: apiError.stack,
        // Include additional properties that might be present in OpenAI errors
        ...(apiError as any).response?.data && { responseData: (apiError as any).response.data },
        ...(apiError as any).status && { status: (apiError as any).status }
      } : 'Unknown error';
      
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Error calling OpenAI API', 
          details: errorDetails,
          timestamp: new Date().toISOString()
        }),
      };
    }

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
    // First check if the response already has the expected format
    let analysisSection = '';
    let recommendationsSection = '';
    
    // Try to extract sections using multiple patterns to be more robust
    const analysisMatch = analysis.match(/(?:^|\n)# Analysis:([\s\S]*?)(?=\n# Recommendations:|$)/i) || 
                         analysis.match(/(?:^|\n)## Key Insights([\s\S]*?)(?=\n## |$)/i);
    
    const recommendationsMatch = analysis.match(/(?:^|\n)# Recommendations:([\s\S]*?)$/i) || 
                                analysis.match(/(?:^|\n)### Recommendations([\s\S]*?)(?=\n### Next Steps|$)/i);
    
    if (analysisMatch && analysisMatch[1]) {
      analysisSection = analysisMatch[1].trim();
    } else {
      // Fallback: if we can't find the Analysis section, use the first half of the content
      analysisSection = analysis.substring(0, Math.floor(analysis.length / 2)).trim();
      console.log('Using fallback for analysis section');
    }
    
    if (recommendationsMatch && recommendationsMatch[1]) {
      recommendationsSection = recommendationsMatch[1].trim();
    } else {
      // Fallback: if we can't find the Recommendations section, use the second half of the content
      recommendationsSection = analysis.substring(Math.floor(analysis.length / 2)).trim();
      console.log('Using fallback for recommendations section');
    }
    
    // Log the extracted sections for debugging
    console.log('Analysis section length:', analysisSection.length);
    console.log('Recommendations section length:', recommendationsSection.length);

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
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Error processing request', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      }),
    };
  }
};
