import { useState, useEffect } from "react"
import { PageHeader } from "@/components/PageHeader"
import { ScenarioPlannerCalculator } from "@/components/calculators/ScenarioPlannerCalculator"
import ScenarioAnalysis from "@/components/analysis/ScenarioAnalysis"
import { Card } from "@/components/ui/card"
import { ScenarioData } from "@/types/scenario"

// Create a component that will extract scenario data from the ScenarioPlannerCalculator
export default function ScenarioPlanner() {
  // Create state to store the scenario data
  const [scenarioData, setScenarioData] = useState({
    scenarios: {
      base: {
        id: 'base',
        name: 'Base Case',
        description: 'Expected business performance under normal conditions',
        metrics: {
          revenue: 1000,
          costs: 500,
          marketShare: 10,
          customerGrowth: 5,
          baselineClients: 100,
          operatingExpenses: 200,
          profitMargin: 30,
          expectedRevenue: 1000,
          expectedProfit: 300
        },
        probability: 60
      },
      optimistic: {
        id: 'optimistic',
        name: 'Optimistic',
        description: 'Better than expected performance',
        metrics: {
          revenue: 1200,
          costs: 500,
          marketShare: 15,
          customerGrowth: 10,
          baselineClients: 100,
          operatingExpenses: 200,
          profitMargin: 42,
          expectedRevenue: 1200,
          expectedProfit: 500
        },
        probability: 20
      },
      pessimistic: {
        id: 'pessimistic',
        name: 'Pessimistic',
        description: 'Worse than expected performance',
        metrics: {
          revenue: 800,
          costs: 500,
          marketShare: 5,
          customerGrowth: 2,
          baselineClients: 100,
          operatingExpenses: 200,
          profitMargin: 12,
          expectedRevenue: 800,
          expectedProfit: 100
        },
        probability: 20
      }
    },
    metrics: {
      expectedRevenue: 1000,
      expectedProfit: 300,
      marketShareRange: {
        min: 5,
        max: 15
      },
      customerGrowthRange: {
        min: 2,
        max: 10
      }
    }
  });

  // Log when scenarioData changes in the parent component
  useEffect(() => {
    console.log('ScenarioPlanner: scenarioData updated:', {
      hasScenarios: !!scenarioData?.scenarios,
      hasMetrics: !!scenarioData?.metrics,
      baseScenario: scenarioData?.scenarios?.base,
      baseMetrics: scenarioData?.scenarios?.base?.metrics,
      expectedRevenue: scenarioData?.metrics?.expectedRevenue,
      expectedProfit: scenarioData?.metrics?.expectedProfit
    });
  }, [scenarioData]);

  // Function to handle data changes from ScenarioPlannerCalculator
  const handleDataChange = (data: ScenarioData) => {
    console.log('ScenarioPlanner: Received data from calculator:', data);
    setScenarioData(data);
  };
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Scenario Planner"
        description="Model different business scenarios and analyze their potential outcomes"
      />
      
      {/* The main calculator component */}
      <div className="mt-6">
        <ScenarioPlannerCalculator onDataChange={handleDataChange} />
      </div>
      
      {/* AI-Powered Analysis Section */}
      <div className="mt-8">
        <Card className="p-4 bg-blue-50">
          <h3 className="text-lg font-semibold mb-2">AI-Powered Scenario Analysis</h3>
          <p className="text-sm text-blue-700 mb-4">
            Generate in-depth analysis of your business scenarios using GPT-4o-mini. 
            The analysis includes risk assessment, opportunity analysis, and strategic recommendations.
          </p>
        </Card>
        <div className="mt-4">
          <ScenarioAnalysis scenarioData={scenarioData} />
        </div>
      </div>
    </div>
  )
}
