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

const generateFullBusinessPlan = async (content: string, context: Record<string, string>) => {
  // Prepare the prompt for full business plan generation
  const prompt = `
    Generate a comprehensive, professional business plan based on the following context:

    Business Name: ${context?.businessName || 'Unnamed Business'}
    Mission Statement: ${context?.missionStatement || 'No mission statement provided'}
    Business Objectives: ${context?.objectives || 'No objectives specified'}

    Business Overview: ${context?.businessOverview || 'No business overview provided'}
    Vision Statement: ${context?.visionStatement || 'No vision statement provided'}
    Legal Structure: ${context?.legalStructure || 'Not specified'}

    Industry Overview: ${context?.industryOverview || 'No industry context provided'}
    Target Market: ${context?.targetMarket || 'No target market defined'}
    Market Size & Growth: ${context?.marketSize || 'Market size not specified'}
    Competitive Landscape: ${context?.competitiveAnalysis || 'No competitive analysis provided'}
    Regulatory Environment: ${context?.regulations || 'No regulatory information provided'}

    Products/Services: ${context?.productsServices || 'No products or services described'}
    Market Opportunity: ${context?.marketOpportunity || 'No market opportunity outlined'}
    Financial Highlights: ${context?.financialHighlights || 'No financial information provided'}

    Instructions:
    1. Create a well-structured, professional business plan
    2. Use a clear, concise, and compelling language
    3. Organize the plan into standard sections:
       a. Executive Summary
       b. Company Description
       c. Market Analysis
       d. Products and Services
       e. Marketing and Sales Strategy
       f. Financial Projections
    4. Ensure the plan tells a coherent story about the business
    5. Highlight unique value propositions and competitive advantages
    6. Provide realistic and data-driven insights
    7. Format the document for readability with appropriate headings and spacing
    8. If any section lacks detail, use professional business writing techniques to elaborate
  `;

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

const handler: Handler = async (event, context) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Validate request method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Log raw request body for debugging
    console.log('Raw request body:', event.body);

    // Parse incoming request body
    const requestBody = JSON.parse(event.body || '{}');

    // Log parsed request body
    console.log('Parsed request body:', JSON.stringify(requestBody, null, 2));

    // Detailed request body validation
    if (!requestBody) {
      console.error('Empty request body received');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing request body',
          details: 'Request body cannot be empty'
        })
      };
    }

    // Validate section and content for remix requests
    if (requestBody.section && requestBody.content) {
      const section = requestBody.section;
      const content = requestBody.content;
      const context = requestBody.context || {};

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
        // Validate section is a valid RemixSection
        const validSections: RemixSection[] = [
          'missionStatement', 'objectives', 'productsServices', 
          'marketOpportunity', 'financialHighlights', 'businessOverview', 
          'visionStatement', 'industryOverview', 'targetMarket', 
          'marketSize', 'competitiveAnalysis', 'regulations', 
          'fullBusinessPlan'
        ];

        if (!validSections.includes(section)) {
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
          body: JSON.stringify({ 
            remixedSection: remixedContent,
            success: true,
            tokens_used: response.usage?.total_tokens 
          }),
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        };
      }
    } else {
      // Validate full business plan request
      const data: BusinessPlanRequest = requestBody;

      // Enhanced validation with detailed logging
      if (!data.businessName && !data.missionStatement) {
        console.error('Missing essential business information', data);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Missing essential business information',
            details: 'Please provide at least a business name or mission statement',
            receivedData: data
          })
        };
      }

      // Generate business plan using OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", 
            content: "You are a professional business plan writer. Generate a clear, structured, and compelling business plan."
          },
          {
            role: "user", 
            content: generateBusinessPlanPrompt(data)
          }
        ],
        max_tokens: 3000,
        temperature: 0.7
      });

      const generatedPlan = response.choices[0].message.content || '';

      return {
        statusCode: 200,
        body: JSON.stringify({ 
          businessPlan: generatedPlan,
          success: true,
          tokens_used: response.usage?.total_tokens 
        }),
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };
    }

  } catch (error) {
    console.error('Error in generate-business-plan function:', error);
    
    // Handle different types of errors
    if (error instanceof OpenAI.APIError) {
      return {
        statusCode: error.status || 500,
        headers,
        body: JSON.stringify({ 
          error: 'OpenAI API Error',
          message: error.message,
          type: error.type
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    };
  }
};

export { handler };
