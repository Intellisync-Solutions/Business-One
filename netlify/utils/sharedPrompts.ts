/**
 * Shared Prompts Module
 * 
 * This module imports and re-exports prompt generators from the centralized prompt management system.
 * All prompt generation is now handled by src/utils/prompts/promptManager.ts to ensure consistency.
 * 
 * @deprecated This module is maintained for backward compatibility.
 * New code should import directly from src/utils/prompts/promptManager.ts or src/utils/prompts/specializedPrompts.ts
 */

// Import the interfaces from the frontend
import { AnalysisRequest } from '../../src/utils/analysisPrompts';

// Import the centralized prompt management
import { 
  baseFinancialContext, 
  formatInstructions, 
  generateStartupAnalysisPrompt as centralizedGenerateStartupAnalysisPrompt,
  generatePricingAnalysisPrompt
} from '../../src/utils/prompts/promptManager';

// Re-export the base context and format instructions for backward compatibility
export { baseFinancialContext, formatInstructions };

/**
 * Re-export the centralized prompt generator for startup cost analysis
 */
export const generateStartupAnalysisPrompt = (data: AnalysisRequest): string => {
  return centralizedGenerateStartupAnalysisPrompt(data);
};

// Interfaces for pricing strategy analysis
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

// Keep the interfaces for backward compatibility
// These should eventually be moved to a shared types file

/**
 * Re-export the centralized prompt generator for pricing strategy analysis
 * This maintains backward compatibility while using the centralized implementation
 */
export const generatePricingStrategyPrompt = (
  breakEvenAnalysis: BreakEvenAnalysis, 
  scenarios: PricingScenario[], 
  costStructure: CostStructure, 
  marketData: MarketData
): string => {
  // Format the data for the centralized prompt generator
  const productCost = costStructure.variableCostPerUnit;
  const competitorPrices = [marketData.competitorPrice];
  const targetMargin = costStructure.targetProfitPercentage;
  const marketSegment = 'Standard'; // Default value, should be passed as a parameter in future versions
  
  // Use the centralized prompt generator
  return generatePricingAnalysisPrompt(
    productCost,
    competitorPrices,
    targetMargin,
    marketSegment
  );
}
