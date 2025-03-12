import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import { generateEnhancedScenarioAnalysisPrompt } from '../../src/utils/prompts/enhancedPromptManager';

// Configure OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the request body interface
interface ScenarioAnalysisRequest {
  scenarios: {
    base: {
      name: string;
      description: string;
      metrics: {
        revenue: number;
        costs: number;
        marketShare: number;
        customerGrowth: number;
        baselineClients: number;
        operatingExpenses: number;
        profitMargin: number;
        expectedRevenue: number;
        expectedProfit: number;
      };
      probability: number;
    };
    optimistic: {
      name: string;
      description: string;
      metrics: {
        revenue: number;
        costs: number;
        marketShare: number;
        customerGrowth: number;
        baselineClients: number;
        operatingExpenses: number;
        profitMargin: number;
        expectedRevenue: number;
        expectedProfit: number;
      };
      probability: number;
    };
    pessimistic: {
      name: string;
      description: string;
      metrics: {
        revenue: number;
        costs: number;
        marketShare: number;
        customerGrowth: number;
        baselineClients: number;
        operatingExpenses: number;
        profitMargin: number;
        expectedRevenue: number;
        expectedProfit: number;
      };
      probability: number;
    };
  };
  metrics: {
    expectedRevenue: number;
    expectedProfit: number;
    marketShareRange: {
      min: number;
      max: number;
    };
    customerGrowthRange: {
      min: number;
      max: number;
    };
  };
}

// Define the handler function
const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Parse the request body
    const requestBody: ScenarioAnalysisRequest = JSON.parse(event.body || '{}');
    
    // Log the received request body for debugging
    console.log('Received request body:', JSON.stringify(requestBody, null, 2));
    
    // Generate the prompt using the enhanced prompt generator
    const prompt = generateEnhancedScenarioAnalysisPrompt(requestBody);
    
    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that provides business scenario analysis.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    // Extract the response content
    const analysisContent = response.choices[0]?.message?.content || 'Analysis could not be generated.';
    
    // Return the analysis
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ analysis: analysisContent }),
    };
  } catch (error) {
    console.error('Error:', error);
    
    // Return an error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'An error occurred while generating the analysis.' }),
    };
  }
};

export { handler };
