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
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Tooltip as UITooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { AlertCircle } from "lucide-react"
import { DataPersistence } from '@/components/common/DataPersistence'

interface ScenarioMetrics {
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

interface Scenario {
  id: string;
  name: string;
  description: string;
  metrics: ScenarioMetrics;
  probability: number;
}

interface ScenarioAdjustments {
  optimisticMultiplier: number; // e.g., 1.2 means 20% increase for optimistic
  pessimisticMultiplier: number; // e.g., 0.8 means 20% decrease for pessimistic
}

interface ScenarioData {
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

const initialBaseScenario: Scenario = {
  id: 'base',
  name: 'Base Case',
  description: 'Expected business performance under normal conditions',
  metrics: {
    revenue: 0,
    costs: 0,
    marketShare: 0,
    customerGrowth: 0,
    baselineClients: 0,
    operatingExpenses: 0,
    profitMargin: 0,
    expectedRevenue: 0,
    expectedProfit: 0
  },
  probability: 60
}

const initialOptimisticScenario: Scenario = {
  id: 'optimistic',
  name: 'Optimistic Case',
  description: 'Potential business performance under highly favorable conditions',
  metrics: {
    revenue: 0,
    costs: 0,
    marketShare: 0,
    customerGrowth: 0,
    baselineClients: 0,
    operatingExpenses: 0,
    profitMargin: 0,
    expectedRevenue: 0,
    expectedProfit: 0
  },
  probability: 25
}

const initialPessimisticScenario: Scenario = {
  id: 'pessimistic',
  name: 'Pessimistic Case',
  description: 'Potential business performance under challenging conditions',
  metrics: {
    revenue: 0,
    costs: 0,
    marketShare: 0,
    customerGrowth: 0,
    baselineClients: 0,
    operatingExpenses: 0,
    profitMargin: 0,
    expectedRevenue: 0,
    expectedProfit: 0
  },
  probability: 15
}

const initialAdjustments = {
  revenue: { optimisticMultiplier: 1.2, pessimisticMultiplier: 0.8 },
  costs: { optimisticMultiplier: 0.9, pessimisticMultiplier: 1.15 },
  marketShare: { optimisticMultiplier: 1.25, pessimisticMultiplier: 0.75 },
  customerGrowth: { optimisticMultiplier: 1.3, pessimisticMultiplier: 0.7 },
  baselineClients: { optimisticMultiplier: 1, pessimisticMultiplier: 1 }, // Typically unchanged
  operatingExpenses: { optimisticMultiplier: 0.95, pessimisticMultiplier: 1.1 },
  profitMargin: { optimisticMultiplier: 1.25, pessimisticMultiplier: 0.7 }
}

export function ScenarioPlannerCalculator() {
  const [scenarioData, setScenarioData] = useState<ScenarioData>({
    scenarios: {
      base: initialBaseScenario,
      optimistic: initialOptimisticScenario,
      pessimistic: initialPessimisticScenario
    },
    adjustments: initialAdjustments,
    activeTab: 'base',
    metrics: {
      expectedRevenue: 0,
      expectedProfit: 0,
      marketShareRange: {
        min: 0,
        max: 0
      },
      customerGrowthRange: {
        min: 0,
        max: 0
      }
    }
  })

  const updateMetrics = (
    type: 'base' | 'optimistic' | 'pessimistic', 
    field: keyof ScenarioMetrics, 
    value: number
  ) => {
    setScenarioData((prev) => {
      const updatedScenarios = { ...prev.scenarios }
      
      // Always update the current scenario
      updatedScenarios[type] = {
        ...updatedScenarios[type],
        metrics: {
          ...updatedScenarios[type].metrics,
          [field]: value
        }
      }
      
      // Auto-adjust other scenarios only when the base case is updated
      if (type === 'base' && field in prev.adjustments) {
        // Update optimistic scenario based on base value and optimistic multiplier
        const optimisticValue = value * prev.adjustments[field as keyof typeof prev.adjustments].optimisticMultiplier
        updatedScenarios.optimistic = {
          ...updatedScenarios.optimistic,
          metrics: {
            ...updatedScenarios.optimistic.metrics,
            [field]: optimisticValue
          }
        }
        
        // Update pessimistic scenario based on base value and pessimistic multiplier
        const pessimisticValue = value * prev.adjustments[field as keyof typeof prev.adjustments].pessimisticMultiplier
        updatedScenarios.pessimistic = {
          ...updatedScenarios.pessimistic,
          metrics: {
            ...updatedScenarios.pessimistic.metrics,
            [field]: pessimisticValue
          }
        }
      }
      
      return { 
        ...prev, 
        scenarios: updatedScenarios
      }
    })
  }

  const updateProbability = (
    type: 'base' | 'optimistic' | 'pessimistic',
    value: number
  ) => {
    setScenarioData((prev) => {
      // Calculate total probability across all scenarios excluding current one
      const otherScenarioTypes = ['base', 'optimistic', 'pessimistic'].filter(t => t !== type) as Array<'base' | 'optimistic' | 'pessimistic'>
      const otherProbabilitiesTotal = otherScenarioTypes.reduce((sum, t) => sum + prev.scenarios[t].probability, 0)
      
      // Ensure the new value doesn't make total exceed 100%
      const adjustedValue = Math.min(value, 100 - otherProbabilitiesTotal)
      
      return {
        ...prev,
        scenarios: {
          ...prev.scenarios,
          [type]: {
            ...prev.scenarios[type],
            probability: adjustedValue
          }
        }
      }
    })
  }

  const handleTabChange = (value: string) => {
    setScenarioData((prev) => ({
      ...prev,
      activeTab: value
    }))
  }
  
  const updateAdjustment = (
    field: keyof ScenarioData['adjustments'],
    scenarioType: 'optimistic' | 'pessimistic',
    value: number
  ) => {
    setScenarioData((prev) => {
      const updatedAdjustments = { ...prev.adjustments }
      
      // Update the specific adjustment multiplier
      updatedAdjustments[field] = {
        ...updatedAdjustments[field],
        [scenarioType === 'optimistic' ? 'optimisticMultiplier' : 'pessimisticMultiplier']: value
      }
      
      // Apply the new adjustment to recalculate the scenario metrics
      const baseMetric = prev.scenarios.base.metrics[field as keyof ScenarioMetrics]
      
      // Only update if there's a valid base value
      if (typeof baseMetric === 'number' && !isNaN(baseMetric)) {
        const updatedScenarios = { ...prev.scenarios }
        
        if (scenarioType === 'optimistic') {
          updatedScenarios.optimistic = {
            ...updatedScenarios.optimistic,
            metrics: {
              ...updatedScenarios.optimistic.metrics,
              [field]: baseMetric * value
            }
          }
        } else { // pessimistic
          updatedScenarios.pessimistic = {
            ...updatedScenarios.pessimistic,
            metrics: {
              ...updatedScenarios.pessimistic.metrics,
              [field]: baseMetric * value
            }
          }
        }
        
        return {
          ...prev,
          adjustments: updatedAdjustments,
          scenarios: updatedScenarios
        }
      }
      
      return {
        ...prev,
        adjustments: updatedAdjustments
      }
    })
  }

  const calculateMetrics = () => {
    const expectedRevenue = [scenarioData.scenarios.base, scenarioData.scenarios.optimistic, scenarioData.scenarios.pessimistic].reduce((sum, scenario) => 
      sum + (scenario.metrics.revenue * (scenario.probability / 100)), 0
    )

    const expectedProfit = [scenarioData.scenarios.base, scenarioData.scenarios.optimistic, scenarioData.scenarios.pessimistic].reduce((sum, scenario) => 
      sum + ((scenario.metrics.revenue - scenario.metrics.costs - scenario.metrics.operatingExpenses) 
      * (scenario.probability / 100)), 0
    )

    const marketShareRange = {
      min: Math.min(...[scenarioData.scenarios.base, scenarioData.scenarios.optimistic, scenarioData.scenarios.pessimistic].map(s => s.metrics.marketShare)),
      max: Math.max(...[scenarioData.scenarios.base, scenarioData.scenarios.optimistic, scenarioData.scenarios.pessimistic].map(s => s.metrics.marketShare))
    }

    const customerGrowthRange = {
      min: Math.min(...[scenarioData.scenarios.base, scenarioData.scenarios.optimistic, scenarioData.scenarios.pessimistic].map(s => s.metrics.customerGrowth)),
      max: Math.max(...[scenarioData.scenarios.base, scenarioData.scenarios.optimistic, scenarioData.scenarios.pessimistic].map(s => s.metrics.customerGrowth))
    }

    return {
      expectedRevenue,
      expectedProfit,
      marketShareRange,
      customerGrowthRange
    }
  }

  const metrics = calculateMetrics()

  const revenueComparisonData = [
    {
      metric: 'Revenue ($)',
      Base: scenarioData.scenarios.base.metrics.revenue,
      Optimistic: scenarioData.scenarios.optimistic.metrics.revenue,
      Pessimistic: scenarioData.scenarios.pessimistic.metrics.revenue
    }
  ]

  const percentageMetricsData = [
    {
      metric: 'Market Share (%)',
      Base: scenarioData.scenarios.base.metrics.marketShare,
      Optimistic: scenarioData.scenarios.optimistic.metrics.marketShare,
      Pessimistic: scenarioData.scenarios.pessimistic.metrics.marketShare
    },
    {
      metric: 'Customer Growth (%)',
      Base: scenarioData.scenarios.base.metrics.customerGrowth,
      Optimistic: scenarioData.scenarios.optimistic.metrics.customerGrowth,
      Pessimistic: scenarioData.scenarios.pessimistic.metrics.customerGrowth
    },
    {
      metric: 'Profit Margin (%)',
      Base: scenarioData.scenarios.base.metrics.profitMargin,
      Optimistic: scenarioData.scenarios.optimistic.metrics.profitMargin,
      Pessimistic: scenarioData.scenarios.pessimistic.metrics.profitMargin
    }
  ]

  const stackedRevenueData = [
    {
      name: 'Base Case',
      Revenue: scenarioData.scenarios.base.metrics.revenue,
      DirectCosts: scenarioData.scenarios.base.metrics.costs,
      OperatingExpenses: scenarioData.scenarios.base.metrics.operatingExpenses,
      NetProfit: scenarioData.scenarios.base.metrics.revenue - scenarioData.scenarios.base.metrics.costs - scenarioData.scenarios.base.metrics.operatingExpenses
    },
    {
      name: 'Optimistic',
      Revenue: scenarioData.scenarios.optimistic.metrics.revenue,
      DirectCosts: scenarioData.scenarios.optimistic.metrics.costs,
      OperatingExpenses: scenarioData.scenarios.optimistic.metrics.operatingExpenses,
      NetProfit: scenarioData.scenarios.optimistic.metrics.revenue - scenarioData.scenarios.optimistic.metrics.costs - scenarioData.scenarios.optimistic.metrics.operatingExpenses
    },
    {
      name: 'Pessimistic',
      Revenue: scenarioData.scenarios.pessimistic.metrics.revenue,
      DirectCosts: scenarioData.scenarios.pessimistic.metrics.costs,
      OperatingExpenses: scenarioData.scenarios.pessimistic.metrics.operatingExpenses,
      NetProfit: scenarioData.scenarios.pessimistic.metrics.revenue - scenarioData.scenarios.pessimistic.metrics.costs - scenarioData.scenarios.pessimistic.metrics.operatingExpenses
    }
  ]

  const customerGrowthData = [
    {
      name: 'Base Case',
      BaselineClients: scenarioData.scenarios.base.metrics.baselineClients,
      CustomerGrowth: scenarioData.scenarios.base.metrics.customerGrowth,
      TotalClients: scenarioData.scenarios.base.metrics.baselineClients * (1 + scenarioData.scenarios.base.metrics.customerGrowth / 100)
    },
    {
      name: 'Optimistic',
      BaselineClients: scenarioData.scenarios.optimistic.metrics.baselineClients,
      CustomerGrowth: scenarioData.scenarios.optimistic.metrics.customerGrowth,
      TotalClients: scenarioData.scenarios.optimistic.metrics.baselineClients * (1 + scenarioData.scenarios.optimistic.metrics.customerGrowth / 100)
    },
    {
      name: 'Pessimistic',
      BaselineClients: scenarioData.scenarios.pessimistic.metrics.baselineClients,
      CustomerGrowth: scenarioData.scenarios.pessimistic.metrics.customerGrowth,
      TotalClients: scenarioData.scenarios.pessimistic.metrics.baselineClients * (1 + scenarioData.scenarios.pessimistic.metrics.customerGrowth / 100)
    }
  ]

  const probabilityData = [
    { name: 'Base Case', value: scenarioData.scenarios.base.probability },
    { name: 'Optimistic', value: scenarioData.scenarios.optimistic.probability },
    { name: 'Pessimistic', value: scenarioData.scenarios.pessimistic.probability }
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Scenario Planner</h2>
        <DataPersistence
          data={scenarioData}
          onDataImport={setScenarioData}
          dataType="scenario-planner"
        />
      </div>

      <Card className="p-6 space-y-4">
        <Tabs 
          value={scenarioData.activeTab} 
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="base">Base Case</TabsTrigger>
            <TabsTrigger value="optimistic">Optimistic</TabsTrigger>
            <TabsTrigger value="pessimistic">Pessimistic</TabsTrigger>
          </TabsList>
          <TabsContent value="base">
            {renderScenarioInputs(
              scenarioData.scenarios.base,
              'base',
              updateMetrics,
              updateProbability
            )}
          </TabsContent>
          <TabsContent value="optimistic">
            {renderScenarioInputs(
              scenarioData.scenarios.optimistic,
              'optimistic',
              updateMetrics,
              updateProbability,
              scenarioData.adjustments,
              updateAdjustment
            )}
          </TabsContent>
          <TabsContent value="pessimistic">
            {renderScenarioInputs(
              scenarioData.scenarios.pessimistic,
              'pessimistic',
              updateMetrics,
              updateProbability,
              scenarioData.adjustments,
              updateAdjustment
            )}
          </TabsContent>
        </Tabs>
        <h3 className="text-xl font-semibold mb-4">Scenario Analysis</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary rounded-lg">
              <h4 className="font-medium mb-4">Expected Outcomes</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium">Expected Revenue</span>
                  <div className="text-lg font-bold mt-1">
                    ${metrics.expectedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Expected Profit</span>
                  <div className="text-lg font-bold mt-1">
                    ${metrics.expectedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-secondary rounded-lg">
              <h4 className="font-medium mb-4">Range Analysis</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium">Market Share Range</span>
                  <div className="text-lg font-bold mt-1">
                    {metrics.marketShareRange.min.toLocaleString()}% - {metrics.marketShareRange.max.toLocaleString()}%
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Customer Growth Range</span>
                  <div className="text-lg font-bold mt-1">
                    {metrics.customerGrowthRange.min.toLocaleString()}% - {metrics.customerGrowthRange.max.toLocaleString()}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-secondary rounded-lg">
            <h4 className="font-medium mb-4">Scenario Comparison</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[scenarioData.scenarios.base, scenarioData.scenarios.optimistic, scenarioData.scenarios.pessimistic].map(scenario => (
                <div key={scenario.id} className="space-y-2">
                  <div className="font-medium">{scenario.name}</div>
                  <div className="text-sm text-muted-foreground">Probability: {scenario.probability}%</div>
                  <div className="text-lg font-bold">
                    ${scenario.metrics.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Comparison Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Revenue Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={revenueComparisonData}
              layout="vertical"
              margin={{ left: 80, right: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal />
              <XAxis type="number" />
              <YAxis 
                dataKey="metric" 
                type="category" 
                width={120} 
                tickFormatter={(value) => value}
              />
              <Tooltip 
                formatter={(value, name) => [
                  value.toLocaleString('en-US', { 
                    style: 'currency', 
                    currency: 'USD', 
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 0 
                  }), 
                  name === 'Base' ? 'Base Case' : 
                  name === 'Optimistic' ? 'Optimistic' : 
                  'Pessimistic'
                ]}
              />
              <Legend 
                formatter={(value) => 
                  value === 'Base' ? 'Base Case' : 
                  value === 'Optimistic' ? 'Optimistic' : 
                  'Pessimistic'
                }
              />
              <Bar dataKey="Base" fill="#8884d8" barSize={20} />
              <Bar dataKey="Optimistic" fill="#82ca9d" barSize={20} />
              <Bar dataKey="Pessimistic" fill="#ff7300" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Percentage Metrics Comparison Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Percentage Metrics Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={percentageMetricsData}
              layout="vertical"
              margin={{ left: 80, right: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal />
              <XAxis type="number" />
              <YAxis 
                dataKey="metric" 
                type="category" 
                width={120} 
                tickFormatter={(value) => value}
              />
              <Tooltip 
                formatter={(value, name) => [
                  `${(value as number).toFixed(2)}%`, 
                  name === 'Base' ? 'Base Case' : 
                  name === 'Optimistic' ? 'Optimistic' : 
                  'Pessimistic'
                ]}
              />
              <Legend 
                formatter={(value) => 
                  value === 'Base' ? 'Base Case' : 
                  value === 'Optimistic' ? 'Optimistic' : 
                  'Pessimistic'
                }
              />
              <Bar dataKey="Base" fill="#8884d8" barSize={20} />
              <Bar dataKey="Optimistic" fill="#82ca9d" barSize={20} />
              <Bar dataKey="Pessimistic" fill="#ff7300" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stacked Bar Chart for Revenue Breakdown */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Revenue and Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stackedRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Revenue" stackId="a" fill="#8884d8" />
              <Bar dataKey="DirectCosts" stackId="a" fill="#82ca9d" />
              <Bar dataKey="OperatingExpenses" stackId="a" fill="#ffc658" />
              <Bar dataKey="NetProfit" stackId="a" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Line Chart for Customer Growth */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Customer Growth Projection</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={customerGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="BaselineClients" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="CustomerGrowth" stroke="#82ca9d" />
              <Line type="monotone" dataKey="TotalClients" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart for Probability Distribution */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Scenario Probability Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={probabilityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {probabilityData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={['#8884d8', '#82ca9d', '#ff7300'][index % 3]} 
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

function renderScenarioInputs(
  scenario: Scenario, 
  scenarioType: 'base' | 'optimistic' | 'pessimistic',
  updateMetrics: (type: 'base' | 'optimistic' | 'pessimistic', field: keyof ScenarioMetrics, value: number) => void,
  updateProbability: (type: 'base' | 'optimistic' | 'pessimistic', value: number) => void,
  adjustments?: ScenarioData['adjustments'],
  updateAdjustment?: (field: keyof ScenarioData['adjustments'], scenarioType: 'optimistic' | 'pessimistic', value: number) => void
) {
  // Different rendering for base case vs. other scenarios
  if (scenarioType === 'base') {
    // Base case gets full input fields
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <p className="text-sm text-gray-500 italic mb-2">
            Base case values are used to automatically calculate optimistic and pessimistic scenarios using multipliers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <TooltipProvider delayDuration={0}>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="baselineClients">Baseline Clients <AlertCircle className="inline-block w-4 h-4" /></Label>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Number of clients at the start of the business. This could be 0 or an existing client base.
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
            <Input
              id="baselineClients"
              type="number"
              min="0"
              value={scenario.metrics.baselineClients || ''}
              onChange={e => updateMetrics(scenarioType, 'baselineClients', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <TooltipProvider delayDuration={0}>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="revenue">Revenue ($) <AlertCircle className="inline-block w-4 h-4" /></Label>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Total expected annual income generated from sales of products or services before expenses are deducted.
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
            <Input
              id="revenue"
              type="number"
              value={scenario.metrics.revenue || ''}
              onChange={e => updateMetrics(scenarioType, 'revenue', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <TooltipProvider delayDuration={0}>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="costs">Direct Costs ($) <AlertCircle className="inline-block w-4 h-4" /></Label>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Total of all expected expenses directly tied to producing goods or services, such as raw materials and direct labor.
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
            <Input
              id="costs"
              type="number"
              value={scenario.metrics.costs || ''}
              onChange={e => updateMetrics(scenarioType, 'costs', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <TooltipProvider delayDuration={0}>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="marketShare">Market Share (%) <AlertCircle className="inline-block w-4 h-4" /></Label>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Percentage of total market sales captured by your business in a specific market segment.
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
            <Input
              id="marketShare"
              type="number"
              value={scenario.metrics.marketShare || ''}
              onChange={e => updateMetrics(scenarioType, 'marketShare', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div>
          <TooltipProvider delayDuration={0}>
            <UITooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="customerGrowth">Customer Growth (%) <AlertCircle className="inline-block w-4 h-4" /></Label>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Rate of increase in the number of customers over a specific period.
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
          <Input
            id="customerGrowth"
            type="number"
            value={scenario.metrics.customerGrowth || ''}
            onChange={e => updateMetrics(scenarioType, 'customerGrowth', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <TooltipProvider delayDuration={0}>
            <UITooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="operatingExpenses">Operating Expenses ($) <AlertCircle className="inline-block w-4 h-4" /></Label>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Regular costs required to run the business, such as rent, utilities, salaries, and administrative expenses.
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
          <Input
            id="operatingExpenses"
            type="number"
            value={scenario.metrics.operatingExpenses || ''}
            onChange={e => updateMetrics(scenarioType, 'operatingExpenses', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <TooltipProvider delayDuration={0}>
            <UITooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="profitMargin">Profit Margin (%) <AlertCircle className="inline-block w-4 h-4" /></Label>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Percentage of revenue that translates into profit after all expenses are deducted.
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
          <Input
            id="profitMargin"
            type="number"
            value={scenario.metrics.profitMargin || ''}
            onChange={e => updateMetrics(scenarioType, 'profitMargin', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <TooltipProvider delayDuration={0}>
            <UITooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="probability">Probability (%) <AlertCircle className="inline-block w-4 h-4" /></Label>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Estimated likelihood of this scenario occurring. Total probability across scenarios must not exceed 100%.
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
          <Input
            id="probability"
            type="number"
            value={scenario.probability || ''}
            onChange={e => updateProbability(scenarioType, parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    );
  } else {
    // Optimistic and Pessimistic scenarios show read-only values with adjustment controls
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <p className="text-sm text-gray-500 italic mb-2">
            {scenarioType === 'optimistic' ? 
              'Optimistic scenario values are automatically calculated from the base case using multipliers.' : 
              'Pessimistic scenario values are automatically calculated from the base case using multipliers.'}
          </p>
        </div>
        
        {/* Display the current metrics as read-only with their multipliers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adjustments && updateAdjustment && ['revenue', 'costs', 'marketShare', 'customerGrowth', 'operatingExpenses', 'profitMargin'].map((field) => (
            <div key={field} className="border p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <TooltipProvider delayDuration={0}>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Label className="capitalize flex items-center">
                        {field} 
                        <AlertCircle className="ml-2 w-4 h-4 text-gray-500" />
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      {(() => {
                        const multiplierType = scenarioType === 'optimistic' ? 'optimisticMultiplier' : 'pessimisticMultiplier';
                        const multiplierValue = adjustments[field as keyof typeof adjustments][multiplierType];
                        const scenarioDescription = scenarioType === 'optimistic' 
                          ? 'a more favorable outcome' 
                          : 'a more challenging scenario';
                        
                        const tooltipMap: Record<string, string> = {
                          revenue: `Represents the potential change in total income. A multiplier above 1 indicates ${scenarioDescription} with increased revenue.`,
                          costs: `Reflects potential variations in direct expenses. ${scenarioType === 'optimistic' ? 'Lower costs' : 'Higher costs'} impact overall profitability.`,
                          marketShare: `Indicates the projected change in market penetration. ${scenarioType === 'optimistic' ? 'Increased' : 'Decreased'} market share reflects business performance.`,
                          customerGrowth: `Shows the expected rate of customer acquisition. ${scenarioType === 'optimistic' ? 'Accelerated' : 'Slowed'} growth impacts long-term potential.`,
                          operatingExpenses: `Represents ongoing business expenses. ${scenarioType === 'optimistic' ? 'Reduced' : 'Increased'} expenses affect operational efficiency.`,
                          profitMargin: `Reflects the percentage of revenue retained as profit. ${scenarioType === 'optimistic' ? 'Higher' : 'Lower'} margins indicate financial health.`
                        };

                        return `Current Multiplier: ${multiplierValue.toFixed(2)}x\n\n${tooltipMap[field] || 'Metric adjustment for this scenario.'}\n\nAdjust the multiplier to fine-tune the scenario's projection.`;
                      })()}
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
                <span className="text-sm font-medium">
                  {scenario.metrics[field as keyof ScenarioMetrics]?.toFixed(2) || '0.00'}
                </span>
              </div>
              
              <div className="mt-2">
                <TooltipProvider delayDuration={0}>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Label className="text-xs text-gray-500 flex items-center">
                        Multiplier 
                        <AlertCircle className="ml-2 w-3 h-3 text-gray-400" />
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      Multipliers allow you to adjust scenario metrics dynamically:
                      <ul className="list-disc list-inside mt-2">
                        <li>Values between 0.1 and 5 are allowed</li>
                        <li>1.0 represents the base case scenario</li>
                        <li>{'>'} 1.0 increases the metric value</li>
                        <li>{'<'} 1.0 decreases the metric value</li>
                      </ul>
                      Experiment to model different business scenarios.
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
                <Input 
                  type="number" 
                  step="0.05"
                  min="0.1" 
                  max="5"
                  value={adjustments[field as keyof typeof adjustments][scenarioType === 'optimistic' ? 'optimisticMultiplier' : 'pessimisticMultiplier']}
                  onChange={(e) => updateAdjustment(
                    field as keyof ScenarioData['adjustments'], 
                    scenarioType as 'optimistic' | 'pessimistic', 
                    parseFloat(e.target.value) || 1
                  )}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <TooltipProvider delayDuration={0}>
            <UITooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="probability" className="flex items-center">
                  Probability (%) 
                  <AlertCircle className="ml-2 w-4 h-4 text-gray-500" />
                </Label>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p>Represents the estimated likelihood of this scenario occurring.</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Total probability across all scenarios must not exceed 100%</li>
                  <li>Use this to weight the potential impact of different scenarios</li>
                  <li>More realistic scenarios typically have higher probabilities</li>
                </ul>
                Adjust carefully to maintain a balanced scenario analysis.
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
          <Input
            id="probability"
            type="number"
            value={scenario.probability || ''}
            onChange={e => updateProbability(scenarioType, parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    );
  }
}
