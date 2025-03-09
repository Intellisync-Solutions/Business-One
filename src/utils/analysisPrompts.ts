/**
 * Financial Analysis Data Interfaces
 * These interfaces define the structure of financial data used across the application
 * for analysis and AI prompt generation.
 */

interface CostBreakdown {
  fixed: number;
  variable: number;
  total: number;
}

export interface CostTotals {
  oneTime: CostBreakdown;
  monthly: CostBreakdown;
  inventory: CostBreakdown;
}

export interface FinancialMetrics {
  totalStartupCost: number;
  monthlyOperatingCost: number;
  recommendedCashReserve: number;
  totalInitialCapital: number;
}

export interface AnalysisRequest {
  costs: CostTotals;
  metrics: FinancialMetrics;
}

// Re-export prompt generation functions from the centralized promptManager
export { 
  generateStartupAnalysisPrompt,
  generateRatioAnalysisPrompt,
  generatePricingAnalysisPrompt,
  generateFinancialHealthAnalysisPrompt
} from './prompts/promptManager';

// This file now serves as a central export point for both data interfaces and prompt functions
