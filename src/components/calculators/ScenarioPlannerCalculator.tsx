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
import { ExportButton } from "@/components/common/ExportButton"
import { SaveLoadState } from "@/components/common/SaveLoadState"
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

interface ScenarioData {
  scenarios: {
    base: Scenario;
    optimistic: Scenario;
    pessimistic: Scenario;
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

export function ScenarioPlannerCalculator() {
  const [scenarioData, setScenarioData] = useState<ScenarioData>({
    scenarios: {
      base: initialBaseScenario,
      optimistic: initialOptimisticScenario,
      pessimistic: initialPessimisticScenario
    },
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
      updatedScenarios[type] = {
        ...updatedScenarios[type],
        metrics: {
          ...updatedScenarios[type].metrics,
          [field]: value
        }
      }
      return { 
        ...prev, 
        scenarios: updatedScenarios,
        [type]: updatedScenarios[type]
      }
    })
  }

  const updateProbability = (
    type: 'base' | 'optimistic' | 'pessimistic',
    value: number
  ) => {
    setScenarioData((prev) => ({
      ...prev,
      scenarios: {
        ...prev.scenarios,
        [type]: {
          ...prev.scenarios[type],
          probability: value
        }
      },
      [type]: {
        ...prev.scenarios[type],
        probability: value
      }
    }))
  }

  const handleTabChange = (value: string) => {
    setScenarioData((prev) => ({
      ...prev,
      activeTab: value
    }))
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

      <div className="flex justify-end gap-2">
        <SaveLoadState
          calculatorType="scenario-planner"
          currentState={scenarioData}
          onLoadState={(state) => {
            setScenarioData(state)
          }}
        />
        <ExportButton
          data={{
            scenarios: [scenarioData.scenarios.base, scenarioData.scenarios.optimistic, scenarioData.scenarios.pessimistic].map(scenario => ({
              ...scenario,
              expectedValue: scenario.probability * scenario.metrics.revenue
            })),
            metrics,
            summary: {
              totalProbability: [scenarioData.scenarios.base, scenarioData.scenarios.optimistic, scenarioData.scenarios.pessimistic].reduce((sum, s) => sum + s.probability, 0),
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
          chartType="bar"
          chartData={revenueComparisonData}
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
              updateProbability
            )}
          </TabsContent>
          <TabsContent value="pessimistic">
            {renderScenarioInputs(
              scenarioData.scenarios.pessimistic,
              'pessimistic',
              updateMetrics,
              updateProbability
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
  updateProbability: (type: 'base' | 'optimistic' | 'pessimistic', value: number) => void
) {
  return (
    <div className="space-y-4">
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
    </div>
  )
}
