import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { ExportButton } from "@/components/common/ExportButton"
import { SaveLoadState } from "@/components/common/SaveLoadState"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ScenarioMetrics {
  revenue: number;
  costs: number;
  marketShare: number;
  customerGrowth: number;
  operatingExpenses: number;
  profitMargin: number;
  expectedRevenue: number;
  expectedProfit: number;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  metrics: ScenarioMetrics;
  probability: number;
}

export function ScenarioPlannerCalculator() {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 'base',
      name: 'Base Case',
      description: 'Expected business performance under normal conditions',
      metrics: {
        revenue: 0,
        costs: 0,
        marketShare: 0,
        customerGrowth: 0,
        operatingExpenses: 0,
        profitMargin: 0,
        expectedRevenue: 0,
        expectedProfit: 0
      },
      probability: 60
    },
    {
      id: 'optimistic',
      name: 'Optimistic',
      description: 'Best-case scenario with favorable market conditions',
      metrics: {
        revenue: 0,
        costs: 0,
        marketShare: 0,
        customerGrowth: 0,
        operatingExpenses: 0,
        profitMargin: 0,
        expectedRevenue: 0,
        expectedProfit: 0
      },
      probability: 20
    },
    {
      id: 'pessimistic',
      name: 'Pessimistic',
      description: 'Worst-case scenario with challenging conditions',
      metrics: {
        revenue: 0,
        costs: 0,
        marketShare: 0,
        customerGrowth: 0,
        operatingExpenses: 0,
        profitMargin: 0,
        expectedRevenue: 0,
        expectedProfit: 0
      },
      probability: 20
    }
  ])

  const [activeScenario, setActiveScenario] = useState<string>('base')

  const updateScenarioMetric = (scenarioId: string, metric: keyof ScenarioMetrics, value: number) => {
    setScenarios(scenarios.map(scenario => 
      scenario.id === scenarioId
        ? {
            ...scenario,
            metrics: {
              ...scenario.metrics,
              [metric]: value
            }
          }
        : scenario
    ))
  }

  const updateScenarioProbability = (scenarioId: string, probability: number) => {
    // Adjust other probabilities proportionally
    const currentScenario = scenarios.find(s => s.id === scenarioId)
    const oldProbability = currentScenario?.probability || 0
    const difference = probability - oldProbability
    
    const otherScenarios = scenarios.filter(s => s.id !== scenarioId)
    const totalOtherProbability = otherScenarios.reduce((sum, s) => sum + s.probability, 0)
    
    setScenarios(scenarios.map(scenario => {
      if (scenario.id === scenarioId) {
        return { ...scenario, probability }
      }
      const adjustmentFactor = totalOtherProbability ? (scenario.probability / totalOtherProbability) : 1
      return {
        ...scenario,
        probability: Math.max(0, scenario.probability - (difference * adjustmentFactor))
      }
    }))
  }

  const calculateMetrics = () => {
    const expectedRevenue = scenarios.reduce((sum, scenario) => 
      sum + (scenario.metrics.revenue * (scenario.probability / 100)), 0
    )

    const expectedProfit = scenarios.reduce((sum, scenario) => 
      sum + ((scenario.metrics.revenue - scenario.metrics.costs - scenario.metrics.operatingExpenses) 
      * (scenario.probability / 100)), 0
    )

    const marketShareRange = {
      min: Math.min(...scenarios.map(s => s.metrics.marketShare)),
      max: Math.max(...scenarios.map(s => s.metrics.marketShare))
    }

    const customerGrowthRange = {
      min: Math.min(...scenarios.map(s => s.metrics.customerGrowth)),
      max: Math.max(...scenarios.map(s => s.metrics.customerGrowth))
    }

    return {
      expectedRevenue,
      expectedProfit,
      marketShareRange,
      customerGrowthRange
    }
  }

  const metrics = calculateMetrics()
  
  const chartData = [
    {
      name: 'Revenue',
      'Base Case': scenarios.find(s => s.id === 'base')?.metrics.revenue || 0,
      'Optimistic': scenarios.find(s => s.id === 'optimistic')?.metrics.revenue || 0,
      'Pessimistic': scenarios.find(s => s.id === 'pessimistic')?.metrics.revenue || 0
    },
    {
      name: 'Market Share',
      'Base Case': scenarios.find(s => s.id === 'base')?.metrics.marketShare || 0,
      'Optimistic': scenarios.find(s => s.id === 'optimistic')?.metrics.marketShare || 0,
      'Pessimistic': scenarios.find(s => s.id === 'pessimistic')?.metrics.marketShare || 0
    },
    {
      name: 'Customer Growth',
      'Base Case': scenarios.find(s => s.id === 'base')?.metrics.customerGrowth || 0,
      'Optimistic': scenarios.find(s => s.id === 'optimistic')?.metrics.customerGrowth || 0,
      'Pessimistic': scenarios.find(s => s.id === 'pessimistic')?.metrics.customerGrowth || 0
    },
    {
      name: 'Profit Margin',
      'Base Case': scenarios.find(s => s.id === 'base')?.metrics.profitMargin || 0,
      'Optimistic': scenarios.find(s => s.id === 'optimistic')?.metrics.profitMargin || 0,
      'Pessimistic': scenarios.find(s => s.id === 'pessimistic')?.metrics.profitMargin || 0
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <SaveLoadState
          calculatorType="scenario-planner"
          currentState={{
            scenarios,
            metrics,
            activeScenario
          }}
          onLoadState={(state) => {
            setScenarios(state.scenarios)
            setActiveScenario(state.activeScenario)
          }}
        />
        <ExportButton
          data={{
            scenarios: scenarios.map(scenario => ({
              ...scenario,
              expectedValue: scenario.probability * scenario.metrics.revenue
            })),
            metrics,
            summary: {
              totalProbability: scenarios.reduce((sum, s) => sum + s.probability, 0),
              expectedRevenue: metrics.expectedRevenue,
              expectedProfit: metrics.expectedProfit,
              riskMetrics: {
                volatility: 0,
                downside: 0,
                upside: 0
              }
            }
          }}
          filename="scenario-analysis"
          title="Business Scenario Analysis"
          description="Comprehensive analysis of business scenarios and their potential outcomes"
          chartType="radar"
          chartData={chartData}
        />
      </div>
      <Tabs value={activeScenario} onValueChange={setActiveScenario}>
        <TabsList className="w-full">
          {scenarios.map(scenario => (
            <TabsTrigger key={scenario.id} value={scenario.id} className="flex-1">
              {scenario.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {scenarios.map(scenario => (
          <TabsContent key={scenario.id} value={scenario.id}>
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">{scenario.name}</h3>
                  <p className="text-muted-foreground">{scenario.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="revenue">Revenue ($)</Label>
                    <Input
                      id="revenue"
                      type="number"
                      value={scenario.metrics.revenue || ''}
                      onChange={e => updateScenarioMetric(scenario.id, 'revenue', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="costs">Direct Costs ($)</Label>
                    <Input
                      id="costs"
                      type="number"
                      value={scenario.metrics.costs || ''}
                      onChange={e => updateScenarioMetric(scenario.id, 'costs', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="marketShare">Market Share (%)</Label>
                    <Input
                      id="marketShare"
                      type="number"
                      value={scenario.metrics.marketShare || ''}
                      onChange={e => updateScenarioMetric(scenario.id, 'marketShare', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerGrowth">Customer Growth (%)</Label>
                    <Input
                      id="customerGrowth"
                      type="number"
                      value={scenario.metrics.customerGrowth || ''}
                      onChange={e => updateScenarioMetric(scenario.id, 'customerGrowth', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="operatingExpenses">Operating Expenses ($)</Label>
                    <Input
                      id="operatingExpenses"
                      type="number"
                      value={scenario.metrics.operatingExpenses || ''}
                      onChange={e => updateScenarioMetric(scenario.id, 'operatingExpenses', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="profitMargin">Profit Margin (%)</Label>
                    <Input
                      id="profitMargin"
                      type="number"
                      value={scenario.metrics.profitMargin || ''}
                      onChange={e => updateScenarioMetric(scenario.id, 'profitMargin', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="probability">Probability (%)</Label>
                    <Input
                      id="probability"
                      type="number"
                      value={scenario.probability || ''}
                      onChange={e => updateScenarioProbability(scenario.id, parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Scenario Analysis</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Expected Outcomes</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Expected Revenue:</span>
                  <span className="font-semibold">${metrics.expectedRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Profit:</span>
                  <span className="font-semibold">${metrics.expectedProfit.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Range Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Market Share Range:</span>
                  <span className="font-semibold">
                    {metrics.marketShareRange.min}% - {metrics.marketShareRange.max}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Customer Growth Range:</span>
                  <span className="font-semibold">
                    {metrics.customerGrowthRange.min}% - {metrics.customerGrowthRange.max}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Base Case" name="Base Case" fill="#8884d8" />
                <Bar dataKey="Optimistic" name="Optimistic" fill="#82ca9d" />
                <Bar dataKey="Pessimistic" name="Pessimistic" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                <Radar dataKey="Base Case" name="Base Case" fill="#8884d8" />
                <Radar dataKey="Optimistic" name="Optimistic" fill="#82ca9d" />
                <Radar dataKey="Pessimistic" name="Pessimistic" fill="#ffc658" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  )
}
