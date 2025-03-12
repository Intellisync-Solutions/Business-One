export interface ScenarioMetrics {
  revenue: number;
  costs: number;
  marketShare: number;
  customerGrowth: number;
  baselineClients: number;
  operatingExpenses: number;
  profitMargin: number;
  expectedRevenue: number;
  expectedProfit: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  metrics: ScenarioMetrics;
  probability: number;
}

export interface ScenarioAdjustments {
  optimisticMultiplier: number;
  pessimisticMultiplier: number;
}

export interface ScenarioData {
  scenarios: {
    base: Scenario;
    optimistic: Scenario;
    pessimistic: Scenario;
  };
  adjustments: {
    revenue: ScenarioAdjustments;
    costs: ScenarioAdjustments;
    marketShare: ScenarioAdjustments;
    customerGrowth: ScenarioAdjustments;
    baselineClients: ScenarioAdjustments;
    operatingExpenses: ScenarioAdjustments;
    profitMargin: ScenarioAdjustments;
  };
  activeTab: string;
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
