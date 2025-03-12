/**
 * Shared Prompts Module
 * 
 * This module imports and re-exports prompt generators from the enhanced prompt management system.
 * All prompt generation is now handled by src/utils/prompts/enhancedPromptManager.ts to ensure consistency.
 * 
 * @deprecated This module is maintained for backward compatibility.
 * New code should import directly from src/utils/prompts/enhancedPromptManager.ts
 */

// Import the interfaces from the frontend
import { AnalysisRequest } from '../../src/utils/analysisPrompts';

// Import the enhanced prompt management system
import { 
  generateEnhancedStartupAnalysisPrompt,
  generateEnhancedPricingStrategyPrompt,
  generateEnhancedBreakEvenAnalysisPrompt,
  generateEnhancedRatioAnalysisPrompt,
  generateEnhancedBusinessValuationPrompt,
  generateEnhancedCashFlowAnalysisPrompt,
  generateEnhancedInvestmentAnalysisPrompt
} from '../../src/utils/prompts/enhancedPromptManager';

/**
 * Re-export the enhanced prompt generators for backward compatibility
 */

// Startup cost analysis prompt generator
export const generateStartupAnalysisPrompt = (data: AnalysisRequest): string => {
  return generateEnhancedStartupAnalysisPrompt(data);
};

// Break-even analysis prompt generator
export const generateBreakEvenAnalysisPrompt = (data: any): string => {
  // Extract the data needed for the enhanced prompt generator
  const breakEvenData = {
    fixedCosts: data.fixedCosts,
    variableCostPerUnit: data.variableCostPerUnit,
    sellingPricePerUnit: data.sellingPricePerUnit,
    mode: data.mode || 'standard',
    targetUnits: data.targetUnits,
    targetProfit: data.targetProfit,
    targetProfitPercentage: data.targetProfitPercentage
  };
  
  const breakEvenResult = {
    breakEvenUnits: data.breakEvenUnits,
    breakEvenPrice: data.breakEvenPrice,
    totalRevenueAtBreakEven: data.totalRevenueAtBreakEven,
    contributionMargin: data.contributionMargin,
    profitMargin: data.profitMargin,
    requiredPrice: data.requiredPrice,
    targetProfitAmount: data.targetProfitAmount
  };
  
  return generateEnhancedBreakEvenAnalysisPrompt(breakEvenData, breakEvenResult);
};

// Financial ratio analysis prompt generator
export const generateRatioAnalysisPrompt = (data: any): string => {
  // Ensure correct parameter structure for the enhanced prompt generator
  const { categoryName, ratio, value, allRatios } = data;
  return generateEnhancedRatioAnalysisPrompt(categoryName, ratio, value, allRatios);
};

// Business valuation prompt generator
export const generateBusinessValuationPrompt = (data: any): string => {
  // Ensure correct parameter structure for the enhanced prompt generator
  return generateEnhancedBusinessValuationPrompt(data);
};

// Cash flow analysis prompt generator
export const generateCashFlowAnalysisPrompt = (data: any): string => {
  // Ensure correct parameter structure for the enhanced prompt generator
  const { operatingCashFlow, investingCashFlow, financingCashFlow, netCashFlow, cashFlowRatio, previousPeriodData } = data;
  return generateEnhancedCashFlowAnalysisPrompt(
    operatingCashFlow,
    investingCashFlow,
    financingCashFlow,
    netCashFlow,
    cashFlowRatio,
    previousPeriodData
  );
};

// Investment analysis prompt generator
export const generateInvestmentAnalysisPrompt = (data: any): string => {
  // Ensure correct parameter structure for the enhanced prompt generator
  return generateEnhancedInvestmentAnalysisPrompt(data);
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
 * Re-export the enhanced prompt generator for pricing strategy analysis
 * This maintains backward compatibility while using the enhanced implementation
 */
export const generatePricingStrategyPrompt = (
  breakEvenAnalysis: BreakEvenAnalysis, 
  scenarios: PricingScenario[], 
  costStructure: CostStructure, 
  marketData: MarketData
): string => {
  // Use the enhanced prompt generator directly
  return generateEnhancedPricingStrategyPrompt(
    breakEvenAnalysis,
    scenarios,
    costStructure,
    marketData
  );
}
