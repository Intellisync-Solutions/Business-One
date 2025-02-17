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

interface BusinessPlanRequest {
  businessName?: string;
  location?: string;
  missionStatement?: string;
  objectives?: string;
  productsServices?: string;
  marketOpportunity?: string;
  financialHighlights?: string;
  ownershipStructure?: string;
  businessOverview?: string;
  visionStatement?: string;
  legalStructure?: string;
  locationDetails?: string;
  industryOverview?: string;
  targetMarket?: string;
  marketSize?: string;
  competitiveAnalysis?: string;
  regulations?: string;
}

type RemixSection = 
  | 'missionStatement' 
  | 'objectives' 
  | 'productsServices' 
  | 'marketOpportunity' 
  | 'financialHighlights'
  | 'businessOverview'
  | 'visionStatement'
  | 'industryOverview'
  | 'targetMarket'
  | 'marketSize'
  | 'competitiveAnalysis'
  | 'regulations'
  | 'fullBusinessPlan';

interface RemixRequest {
  section: RemixSection;
  content: string;
  context?: Record<string, string>;
}

const SECTION_PROMPTS: Record<string, (content: string, context?: any) => string> = {
  missionStatement: (content, context) => `
    Refine and enhance the following mission statement:
    Current Mission Statement: "${content}"

    Context:
    Business Name: ${context?.businessName || 'Not Provided'}
    Business Objectives: ${context?.objectives || 'Not Provided'}

    Instructions:
    - Make the mission statement more compelling and clear
    - Align with business objectives
    - Use concise, inspirational language
    - Highlight the unique value proposition
  `,

  objectives: (content, context) => `
    Improve and structure the following business objectives:
    Current Objectives: "${content}"

    Context:
    Business Name: ${context?.businessName || 'Not Provided'}
    Mission Statement: ${context?.missionStatement || 'Not Provided'}

    Instructions:
    - Convert objectives into SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
    - Ensure objectives align with the mission statement
    - Provide clear, actionable objectives
    - Include short-term and long-term goals
    - Maintain the original intent and spirit of the provided objectives
  `,

  productsServices: (content, context) => `
    Enhance the description of products or services:
    Current Description: "${content}"

    Context:
    Business Name: ${context?.businessName || 'Not Provided'}
    Market Opportunity: ${context?.marketOpportunity || 'Not Provided'}

    Instructions:
    - Clearly articulate unique value propositions
    - Describe features and benefits
    - Highlight how products/services solve customer problems
    - Use persuasive, customer-centric language
  `,

  marketOpportunity: (content, context) => `
    Refine the market opportunity analysis:
    Current Analysis: "${content}"

    Context:
    Business Name: ${context?.businessName || 'Not Provided'}
    Products/Services: ${context?.productsServices || 'Not Provided'}

    Instructions:
    - Identify and elaborate on market gaps
    - Quantify potential market size
    - Explain why your solution is uniquely positioned
    - Use data-driven insights
  `,

  financialHighlights: (content, context) => `
    Improve financial highlights and projections:
    Current Highlights: "${content}"

    Context:
    Business Name: ${context?.businessName || 'Not Provided'}
    Business Objectives: ${context?.objectives || 'Not Provided'}

    Instructions:
    - Provide a clear financial narrative
    - Include revenue projections
    - Highlight key financial metrics
    - Demonstrate financial viability and growth potential
  `,

  businessOverview: (content, context) => `
    Enhance the business overview:
    Current Overview: "${content}"

    Context:
    Business Name: ${context?.businessName || 'Not Provided'}
    Mission Statement: ${context?.missionStatement || 'Not Provided'}

    Instructions:
    - Tell a compelling story about the business's origin
    - Highlight key milestones and achievements
    - Explain the business model
    - Create a narrative that builds credibility
  `,

  visionStatement: (content, context) => `
    Refine the vision statement:
    Current Vision: "${content}"

    Context:
    Business Name: ${context?.businessName || 'Not Provided'}
    Business Objectives: ${context?.objectives || 'Not Provided'}

    Instructions:
    - Create an inspiring, forward-looking statement
    - Align with long-term business goals
    - Use aspirational language
    - Make it memorable and motivating
  `,

  industryOverview: (content, context) => `
    Improve the industry overview:
    Current Overview: "${content}"

    Context:
    Business Name: ${context?.businessName || 'Not Provided'}
    Products/Services: ${context?.productsServices || 'Not Provided'}

    Instructions:
    - Provide a comprehensive industry analysis
    - Include current trends and future projections
    - Highlight opportunities and challenges
    - Use credible sources and data
  `,

  targetMarket: (content, context) => `
    Enhance the target market description:
    Current Description: "${content}"

    Context:
    Business Name: ${context?.businessName || 'Not Provided'}
    Products/Services: ${context?.productsServices || 'Not Provided'}

    Instructions:
    - Define customer segments precisely
    - Include demographic and psychographic details
    - Explain customer pain points
    - Show how your solution meets their needs
  `,

  marketSize: (content, context) => `
    Refine market size and growth analysis:
    Current Analysis: "${content}"

    Context:
    Business Name: ${context?.businessName || 'Not Provided'}
    Target Market: ${context?.targetMarket || 'Not Provided'}

    Instructions:
    - Quantify total addressable market (TAM)
    - Provide growth rate projections
    - Use reliable market research data
    - Demonstrate market potential
  `,

  competitiveAnalysis: (content, context) => `
    Improve competitive analysis:
    Current Analysis: "${content}"

    Context:
    Business Name: ${context?.businessName || 'Not Provided'}
    Products/Services: ${context?.productsServices || 'Not Provided'}

    Instructions:
    - Identify key competitors
    - Analyze strengths and weaknesses
    - Highlight your competitive advantages
    - Use a structured comparison framework
  `,

  regulations: (content, context) => `
    Enhance regulatory environment analysis:
    Current Analysis: "${content}"

    Context:
    Business Name: ${context?.businessName || 'Not Provided'}
    Industry: ${context?.industryOverview || 'Not Provided'}

    Instructions:
    - Provide comprehensive regulatory overview
    - Explain compliance requirements
    - Highlight potential legal challenges
    - Demonstrate proactive risk management
  `,

  fullBusinessPlan: (content: string, context: any) => {
    // This is now just a placeholder, actual generation happens in the handler
    return `Generating full business plan for ${context?.businessName || 'Business'}`;
  }
};

const generateBusinessPlanPrompt = (data: BusinessPlanRequest) => `
You are a professional business plan writer. Generate a comprehensive, well-structured business plan based on the following inputs:

BUSINESS OVERVIEW
Business Name: ${data.businessName || 'Not Specified'}
Location: ${data.location || 'Not Specified'}
Mission Statement: ${data.missionStatement || 'Not Provided'}
Business Objectives: ${data.objectives || 'Not Outlined'}

PRODUCTS & SERVICES
Offerings: ${data.productsServices || 'Not Described'}
Market Opportunity: ${data.marketOpportunity || 'Not Analyzed'}

FINANCIAL PERSPECTIVE
Financial Highlights: ${data.financialHighlights || 'Not Detailed'}
Ownership Structure: ${data.ownershipStructure || 'Not Specified'}

COMPANY DETAILS
Business Overview: ${data.businessOverview || 'Not Provided'}
Vision Statement: ${data.visionStatement || 'Not Articulated'}
Legal Structure: ${data.legalStructure || 'Not Specified'}
Location & Facilities: ${data.locationDetails || 'Not Described'}

MARKET ANALYSIS
Industry Overview: ${data.industryOverview || 'Not Analyzed'}
Target Market: ${data.targetMarket || 'No target market defined'}
Market Size & Growth: ${data.marketSize || 'Market size not specified'}
Competitive Landscape: ${data.competitiveAnalysis || 'No competitive analysis provided'}
Regulatory Environment: ${data.regulations || 'No regulatory information provided'}

INSTRUCTIONS:
1. Create a professional, comprehensive business plan
2. Use clear, concise language
3. Structure the document with appropriate headings
4. Highlight unique value propositions
5. Demonstrate market understanding and business viability
6. Maintain a professional and compelling tone

OUTPUT FORMAT:
- Use markdown for formatting
- Include clear section headings
- Provide actionable insights
- Estimate potential financial projections if data allows
`;

const generateFullBusinessPlan = async (content: string, context: Record<string, string>) => {
  // Parse the content as BusinessPlanRequest
  const businessPlanData: BusinessPlanRequest = JSON.parse(content);

  // Generate the prompt using the business plan data
  const prompt = generateBusinessPlanPrompt(businessPlanData);

  try {
    // Generate the business plan using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system", 
          content: "You are a professional business plan writer. Create a comprehensive, well-structured business plan that is clear, compelling, and tailored to the specific business context."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    // Return the generated business plan
    return {
      businessPlan: response.choices[0].message.content || 'Unable to generate business plan',
      tokens_used: response.usage?.total_tokens || null
    };
  } catch (error) {
    console.error('Error generating full business plan:', error);
    throw error;
  }
};

const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Successful preflight call.' })
    };
  }

  // Validate HTTP method
  if (event.httpMethod !== 'POST') {
    console.error(`Invalid HTTP method: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method Not Allowed', 
        details: `Received ${event.httpMethod}, expected POST` 
      })
    };
  }

  // Validate request body
  if (!event.body) {
    console.error('No request body provided');
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Bad Request', 
        details: 'No request body provided' 
      })
    };
  }

  try {
    // Parse request body
    const requestBody = JSON.parse(event.body);
    console.log('Received request body:', JSON.stringify(requestBody, null, 2));

    // Validate section and content for requests
    const section = requestBody.section;
    const content = requestBody.content;
    const context = requestBody.context || {};

    // Validate required fields
    if (!section) {
      console.error('Missing section in request');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Bad Request', 
          details: 'Missing section in request' 
        })
      };
    }

    // Validate OpenAI configuration
    if (!openaiApiKey) {
      console.error('OpenAI API Key is not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server Configuration Error', 
          details: 'OpenAI API Key is not configured' 
        })
      };
    }

    // Process different sections
    if (section === 'fullBusinessPlan') {
      try {
        const generatedPlan = await generateFullBusinessPlan(content, context);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            businessPlan: generatedPlan.businessPlan,
            success: true,
            tokens_used: generatedPlan.tokens_used
          })
        };
      } catch (planGenerationError) {
        console.error('Full Business Plan Generation Error:', planGenerationError);
        
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Failed to generate full business plan',
            details: planGenerationError instanceof Error ? planGenerationError.message : String(planGenerationError),
            success: false
          })
        };
      }
    } else {
      // Handle other section remix requests
      const validSections: RemixSection[] = [
        'missionStatement', 'objectives', 'productsServices', 
        'marketOpportunity', 'financialHighlights', 'businessOverview', 
        'visionStatement', 'industryOverview', 'targetMarket', 
        'marketSize', 'competitiveAnalysis', 'regulations', 
        'fullBusinessPlan'
      ];

      if (!validSections.includes(section as RemixSection)) {
        console.error(`Invalid section: ${section}`);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Invalid section',
            details: `Section must be one of: ${validSections.join(', ')}`
          })
        };
      }

      try {
        const prompt = SECTION_PROMPTS[section as RemixSection](
          content, 
          context
        );

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system", 
              content: "You are a professional business plan writer. Enhance and refine the given section with clarity and precision."
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        });

        const remixedContent = response.choices[0].message.content || '';

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            remixedSection: remixedContent,
            success: true,
            tokens_used: response.usage?.total_tokens 
          })
        };
      } catch (remixError) {
        console.error(`Error remixing section ${section}:`, remixError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: `Failed to remix ${section} section`,
            details: remixError instanceof Error ? remixError.message : String(remixError),
            success: false
          })
        };
      }
    }
  } catch (error) {
    console.error('Unexpected error in handler:', error);
    
    // Handle different types of errors
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid JSON', 
          details: 'Request body is not valid JSON' 
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      })
    };
  }
};

export { handler };
