import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SubscriptionRevenueCalculator from "./SubscriptionRevenueCalculator"
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
 
  ResponsiveContainer,
 
  Bar
} from 'recharts'
import { ExportButton } from "@/components/common/ExportButton"
import { SaveLoadState } from "@/components/common/SaveLoadState"
import { 
  TooltipProvider, 
 
} from "@/components/ui/tooltip"

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { DataPersistence } from '@/components/common/DataPersistence'
import { useCalculatorData } from '@/hooks/useCalculatorData'
import { Button } from "@/components/ui/button"
import { LineChart } from 'recharts';
import { useToast } from "@/components/ui/use-toast"

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

interface PricingData {
  costStructure: CostStructure
  marketData: MarketData
  scenarios: PricingScenario[]
}

interface ScenarioParams {
  minPrice: number;
  maxPrice: number;
  numScenarios: number;
}

interface BreakEvenAnalysis {
  point: number;
  optimalPriceRange: {
    min: number;
    max: number;
  };
  marketSensitivity: number;
  min: number;
  max: number;
}

export function PricingStrategyCalculator() {
  // Calculate break-even price
  const calculateBreakEvenPrice = (
    fixedCosts: number, 
    variableCostPerUnit: number, 
    targetProfitPercentage: number,
    marketSize: number
  ) => {
    const unitFixedCost = fixedCosts / marketSize
    const totalUnitCost = unitFixedCost + variableCostPerUnit
    
    // Add target profit margin
    return totalUnitCost / (1 - targetProfitPercentage / 100)
  }

  const [pricingData, setPricingData] = useCalculatorData<PricingData>('pricing-strategy', {
    costStructure: {
      fixedCosts: 0,
      variableCostPerUnit: 0,
      targetProfitPercentage: 0
    },
    marketData: {
      competitorPrice: 0,
      marketSize: 0,
      priceElasticity: 0
    },
    scenarios: []
  })

  const [activeTab, setActiveTab] = useState('optimal')
  const [scenarioParams, setScenarioParams] = useState<ScenarioParams>({
    minPrice: 0,
    maxPrice: 0,
    numScenarios: 0
  })
  const [scenarios, setScenarios] = useState<PricingScenario[]>([])
  const [breakEvenAnalysis, setBreakEvenAnalysis] = useState<BreakEvenAnalysis>({
    point: 0,
    optimalPriceRange: {
      min: 0,
      max: 0
    },
    marketSensitivity: 0,
    min: 0,
    max: 0
  })
  const [analysisChartData, setAnalysisChartData] = useState<any[]>([])
  const [breakEvenPrice, setBreakEvenPrice] = useState<number | null>(null)
  const [currentScenario, setCurrentScenario] = useState<PricingScenario>({
    price: 0,
    volume: 0,
    revenue: 0,
    variableCosts: 0,
    totalCosts: 0,
    profit: 0,
    targetProfit: 0,
    profitMargin: 0,
    meetsTargetProfit: false
  })

  const { toast } = useToast();

  // Define a default scenario to use when no scenarios are generated
  const defaultScenario: PricingScenario = {
    price: 0,
    volume: 0,
    revenue: 0,
    variableCosts: 0,
    totalCosts: 0,
    profit: 0,
    targetProfit: 0,
    profitMargin: 0,
    meetsTargetProfit: false
  }

  // Update the cost structure
  const updateCostStructure = (field: keyof CostStructure, value: number) => {
    setPricingData(prev => ({
      ...prev,
      costStructure: {
        ...prev.costStructure,
        [field]: value
      }
    }))
  }

  // Update market data
  const updateMarketData = (field: keyof MarketData, value: number) => {
    setPricingData(prev => ({
      ...prev,
      marketData: {
        ...prev.marketData,
        [field]: value
      }
    }))
  }

  const calculatePricingScenarios = (scenarioParams: ScenarioParams): PricingScenario[] => {
    const scenarios: PricingScenario[] = []
    
    // Validate inputs to prevent invalid calculations
    if (
      pricingData.costStructure.variableCostPerUnit <= 0 || 
      pricingData.marketData.marketSize <= 0 || 
      pricingData.marketData.competitorPrice <= 0 ||
      scenarioParams.minPrice <= 0 ||
      scenarioParams.maxPrice <= 0 ||
      scenarioParams.numScenarios <= 0
    ) {
      return scenarios; // Return empty array instead of an object
    }

    // Generate scenarios dynamically based on user-defined parameters
    const priceStep = (scenarioParams.maxPrice - scenarioParams.minPrice) / (scenarioParams.numScenarios - 1)
    
    for (let i = 0; i < scenarioParams.numScenarios; i++) {
      const price = scenarioParams.minPrice + i * priceStep
      
      // Calculate demand using price elasticity
      const priceRatio = price / pricingData.marketData.competitorPrice
      const elasticityEffect = Math.pow(priceRatio, -pricingData.marketData.priceElasticity)
      const volume = Math.min(
        pricingData.marketData.marketSize, 
        pricingData.marketData.marketSize * elasticityEffect
      )

      // Calculate costs and revenue
      const variableCosts = volume * pricingData.costStructure.variableCostPerUnit
      const totalCosts = pricingData.costStructure.fixedCosts + variableCosts
      const revenue = price * volume
      const profit = revenue - totalCosts
      const targetProfit = pricingData.costStructure.fixedCosts * 
        (1 + pricingData.costStructure.targetProfitPercentage / 100)
      const profitMargin = (profit / revenue) * 100

      const scenario: PricingScenario = {
        price,
        volume,
        revenue,
        variableCosts,
        totalCosts,
        profit,
        targetProfit,
        profitMargin,
        meetsTargetProfit: profit >= targetProfit
      }

      scenarios.push(scenario)
    }

    return scenarios
  }

  const findOptimalScenario = (scenarios: PricingScenario[]): PricingScenario | undefined => {
    if (scenarios.length === 0) return undefined;

    return scenarios.reduce((best, current) => {
      // Prioritize scenarios that meet target profit margin
      if (current.meetsTargetProfit && !best.meetsTargetProfit) return current
      if (!current.meetsTargetProfit && best.meetsTargetProfit) return best

      // If both meet or don't meet target margin, choose the one with highest profit
      return current.profit > best.profit ? current : best
    }, scenarios[0])
  }

  const calculateBreakEvenAnalysis = (scenarios: PricingScenario[]): BreakEvenAnalysis => {
    const breakEvenPrice = calculateBreakEvenPrice(
      pricingData.costStructure.fixedCosts,
      pricingData.costStructure.variableCostPerUnit,
      pricingData.costStructure.targetProfitPercentage,
      pricingData.marketData.marketSize
    )

    return {
      point: breakEvenPrice,
      optimalPriceRange: scenarios.length > 0 ? {
        min: scenarios[0].price,
        max: scenarios[scenarios.length - 1].price
      } : { min: 0, max: 0 },
      marketSensitivity: pricingData.marketData.priceElasticity,
      min: scenarios.length > 0 ? scenarios[0].price : 0,
      max: scenarios.length > 0 ? scenarios[scenarios.length - 1].price : 0
    }
  }

  useEffect(() => {
    if (
      pricingData.costStructure.fixedCosts > 0 &&
      pricingData.costStructure.variableCostPerUnit > 0 &&
      pricingData.marketData.competitorPrice > 0 &&
      pricingData.marketData.marketSize > 0 &&
      pricingData.marketData.priceElasticity > 0 &&
      scenarioParams.minPrice > 0 &&
      scenarioParams.maxPrice > 0 &&
      scenarioParams.numScenarios > 0
    ) {
      try {
        const scenarios = calculatePricingScenarios(scenarioParams)
        
        // Update state with calculated values
        setScenarios(scenarios)
        
        // Generate chart data
        setAnalysisChartData(scenarios.map(scenario => ({
          price: scenario.price,
          revenue: scenario.revenue,
          profit: scenario.profit,
          volume: scenario.volume
        })))
        
        // Optional: Additional processing of optimal scenario
        if (scenarios.length > 0) {
          const optimalScenario = findOptimalScenario(scenarios)
          const breakEvenAnalysis = calculateBreakEvenAnalysis(scenarios)
          
          setCurrentScenario(optimalScenario ?? defaultScenario)
          setBreakEvenAnalysis(breakEvenAnalysis)
          setBreakEvenPrice(breakEvenAnalysis.point)
        }
      } catch (error) {
        console.error('Error calculating pricing scenarios:', error)
        toast({
          title: 'Calculation Error',
          description: 'Unable to generate pricing scenarios.',
          variant: 'destructive'
        })
      }
    }
  }, [
    pricingData.costStructure.fixedCosts,
    pricingData.costStructure.variableCostPerUnit,
    pricingData.costStructure.targetProfitPercentage,
    pricingData.marketData.competitorPrice,
    pricingData.marketData.marketSize,
    pricingData.marketData.priceElasticity,
    scenarioParams.minPrice,
    scenarioParams.maxPrice,
    scenarioParams.numScenarios
  ])

  // Modify the component to use the calculated values
  const currentBreakEvenPrice = breakEvenPrice || 0

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Pricing Strategy Calculator</h2>
          <DataPersistence
            data={pricingData}
            onDataImport={setPricingData}
            dataType="pricing-strategy"
          />
        </div>
        
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analysisChartData.length > 0 ? analysisChartData : [{ price: 0, profit: 0, volume: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="price" label={{ value: 'Price', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Value', angle: -90, position: 'insideLeft' }} />
              <ChartTooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
              <Line type="monotone" dataKey="volume" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-end gap-2">
          <SaveLoadState
            calculatorType="pricing-strategy"
            currentState={{
              costStructure: pricingData.costStructure,
              marketData: pricingData.marketData,
              scenarios: scenarios,
              optimalScenario: currentScenario
            }}
            onLoadState={(state) => {
              setPricingData({
                costStructure: state.costStructure,
                marketData: state.marketData,
                scenarios: []
              })
              setScenarioParams({
                minPrice: 0,
                maxPrice: 0,
                numScenarios: 0
              })
            }}
            data={{
              costStructure: pricingData.costStructure,
              marketData: pricingData.marketData,
              scenarios: scenarios,
              optimalScenario: currentScenario,
              recommendation: currentScenario.price > pricingData.marketData.competitorPrice 
                ? 'Premium pricing strategy recommended' 
                : 'Competitive pricing strategy recommended',
              targetProfitMargin: `${pricingData.costStructure.targetProfitPercentage}%`
            }}
          />
          <ExportButton
            data={{
              costStructure: pricingData.costStructure,
              marketData: pricingData.marketData,
              scenarios: scenarios,
              optimalScenario: currentScenario,
              recommendation: currentScenario.price > pricingData.marketData.competitorPrice 
                ? 'Premium pricing strategy recommended' 
                : 'Competitive pricing strategy recommended',
              targetProfitMargin: `${pricingData.costStructure.targetProfitPercentage}%`
            }}
            filename="pricing-strategy"
            title="Pricing Strategy Analysis"
            description="Comprehensive pricing analysis and recommendations"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="optimal">Optimal</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="optimal">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Cost Structure</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Fixed Costs</Label>
                  <Input 
                    type="number" 
                    value={pricingData.costStructure.fixedCosts} 
                    onChange={(e) => updateCostStructure('fixedCosts', Number(e.target.value))}
                    placeholder="Enter fixed costs"
                  />
                </div>
                <div>
                  <Label>Variable Cost Per Unit</Label>
                  <Input 
                    type="number" 
                    value={pricingData.costStructure.variableCostPerUnit} 
                    onChange={(e) => updateCostStructure('variableCostPerUnit', Number(e.target.value))}
                    placeholder="Enter variable cost per unit"
                  />
                </div>
                <div>
                  <Label>Target Profit Percentage</Label>
                  <Input 
                    type="number" 
                    value={pricingData.costStructure.targetProfitPercentage} 
                    onChange={(e) => updateCostStructure('targetProfitPercentage', Number(e.target.value))}
                    placeholder="Enter target profit %"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={() => {
                    // Validate inputs before generating scenarios
                    const isValid = 
                      pricingData.costStructure.fixedCosts > 0 &&
                      pricingData.costStructure.variableCostPerUnit > 0 &&
                      pricingData.costStructure.targetProfitPercentage > 0 &&
                      pricingData.marketData.competitorPrice > 0 &&
                      pricingData.marketData.marketSize > 0 &&
                      pricingData.marketData.priceElasticity > 0;

                    if (!isValid) {
                      toast({
                        title: "Incomplete Data",
                        description: "Please fill in all required fields with valid values.",
                        variant: "destructive"
                      });
                      return;
                    }

                    // Generate scenarios
                    const scenarioParams: ScenarioParams = {
                      minPrice: Math.max(calculateBreakEvenPrice(
                        pricingData.costStructure.fixedCosts,
                        pricingData.costStructure.variableCostPerUnit,
                        pricingData.costStructure.targetProfitPercentage,
                        pricingData.marketData.marketSize
                      ) * 0.8, 1),
                      maxPrice: calculateBreakEvenPrice(
                        pricingData.costStructure.fixedCosts,
                        pricingData.costStructure.variableCostPerUnit,
                        pricingData.costStructure.targetProfitPercentage,
                        pricingData.marketData.marketSize
                      ) * 1.5,
                      numScenarios: 10
                    };

                    const generatedScenarios = calculatePricingScenarios(scenarioParams);

                    setScenarios(generatedScenarios);
                    setCurrentScenario(findOptimalScenario(generatedScenarios) ?? defaultScenario);
                    setAnalysisChartData(
                      generatedScenarios.map(scenario => ({
                        price: scenario.price,
                        revenue: scenario.revenue,
                        profit: scenario.profit,
                        volume: scenario.volume
                      }))
                    );

                    toast({
                      title: "Scenarios Generated",
                      description: "Pricing scenarios have been successfully calculated.",
                      variant: "default"
                    });
                  }}
                  disabled={
                    !(pricingData.costStructure.fixedCosts > 0 &&
                      pricingData.costStructure.variableCostPerUnit > 0 &&
                      pricingData.costStructure.targetProfitPercentage > 0 &&
                      pricingData.marketData.competitorPrice > 0 &&
                      pricingData.marketData.marketSize > 0 &&
                      pricingData.marketData.priceElasticity > 0)
                  }
                >
                  Generate Results
                </Button>
              </div>

            </Card>

            <Card className="p-6 mt-4">
              <h3 className="text-xl font-semibold mb-4">Market Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-4">
                  <div>
                    <Label>Competitor Price</Label>
                    <Input
                      type="number"
                      value={pricingData.marketData.competitorPrice}
                      onChange={(e) => updateMarketData('competitorPrice', Number(e.target.value))}
                      placeholder="Enter competitor price"
                    />
                  </div>
                  <div>
                    <Label>Market Size</Label>
                    <Input
                      type="number"
                      value={pricingData.marketData.marketSize}
                      onChange={(e) => updateMarketData('marketSize', Number(e.target.value))}
                      placeholder="Enter market size"
                    />
                  </div>
                  <div>
                    <Label>Price Elasticity</Label>
                    <Input
                      type="number"
                      value={pricingData.marketData.priceElasticity}
                      onChange={(e) => updateMarketData('priceElasticity', Number(e.target.value))}
                      placeholder="Enter price elasticity"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Optimal Pricing Strategy</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <span className="text-sm font-medium">Optimal Price</span>
                    <div className="text-lg font-bold mt-1">
                      ${currentScenario.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground">
                      This price is calculated by analyzing multiple scenarios around your break-even point (${currentBreakEvenPrice.toFixed(2)}) 
                      while considering your target profit margin of {pricingData.costStructure.targetProfitPercentage}% and market competitiveness. 
                      It represents the best balance between profitability and market position.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-secondary rounded-lg">
                    <span className="text-sm font-medium">Expected Volume</span>
                    <div className="text-lg font-bold mt-1">
                      {currentScenario.volume.toLocaleString()} units
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Projected sales volume based on price elasticity ({pricingData.marketData.priceElasticity.toFixed(2)}) and total market size ({pricingData.marketData.marketSize.toLocaleString()} units). 
                      This estimate factors in how demand changes relative to your competitor's price (${pricingData.marketData.competitorPrice.toFixed(2)}).
                    </p>
                  </div>
                  
                  <div className="p-4 bg-secondary rounded-lg">
                    <span className="text-sm font-medium">Projected Revenue</span>
                    <div className="text-lg font-bold mt-1">
                      ${currentScenario.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Total revenue calculated as optimal price × expected volume. 
                      This projection considers both pricing strategy and market response, 
                      representing your estimated total sales before costs.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-secondary rounded-lg">
                    <span className="text-sm font-medium">Projected Profit</span>
                    <div className="text-lg font-bold mt-1">
                      ${currentScenario.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Net profit after deducting total costs (${currentScenario.totalCosts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) 
                      from revenue. This includes both fixed costs (${pricingData.costStructure.fixedCosts.toLocaleString()}) and 
                      variable costs per unit (${pricingData.costStructure.variableCostPerUnit.toFixed(2)}), achieving a 
                      profit margin of {currentScenario.profitMargin.toFixed(1)}%.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <Card className="p-6">
                    <h4 className="text-lg font-semibold">How to Interpret This Result</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Pricing Strategy Breakdown</h5>
                        <ul className="list-disc list-inside text-sm space-y-2">
                          <li>
                            <strong>Base Price:</strong> ${currentBreakEvenPrice.toFixed(2)} 
                            <span className="text-muted-foreground ml-2">
                              (Includes target profit margin of {pricingData.costStructure.targetProfitPercentage}%)
                            </span>
                          </li>
                          <li>
                            <strong>Pricing Strategy:</strong> 
                            {currentScenario.price > pricingData.marketData.competitorPrice ? 
                              'Premium Pricing' : 'Competitive Pricing'}
                            <span className="text-muted-foreground ml-2">
                              {currentScenario.price > pricingData.marketData.competitorPrice ? 
                                `${((currentScenario.price/pricingData.marketData.competitorPrice - 1) * 100).toFixed(1)}% above competitor price` : 
                                `${((1 - currentScenario.price/pricingData.marketData.competitorPrice) * 100).toFixed(1)}% below competitor price`}
                            </span>
                          </li>
                          <li>
                            <strong>Price Elasticity Factor:</strong> {pricingData.marketData.priceElasticity.toFixed(2)}
                            <span className="text-muted-foreground ml-2">
                              (Market sensitivity to price changes)
                            </span>
                          </li>
                          <li>
                            <strong>Competitor Price:</strong> 
                            ${pricingData.marketData.competitorPrice.toFixed(2)}
                          </li>
                        </ul>

                        {!currentScenario.meetsTargetProfit && 
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                            <strong>Note:</strong> This scenario doesn't fully meet your target profit margin. 
                            Consider reviewing your cost structure or adjusting your target margin.
                          </div>
                        }
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Financial Metrics</h5>
                        <ul className="list-disc list-inside text-sm space-y-2">
                          <li>
                            <strong>Total Costs:</strong> ${currentScenario.totalCosts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="text-muted-foreground ml-2">
                              (Fixed + Variable Costs)
                            </span>
                          </li>
                          <li>
                            <strong>Achieved Profit Margin:</strong> {currentScenario.profitMargin.toFixed(1)}%
                            <span className="text-muted-foreground ml-2">
                              (Target: {pricingData.costStructure.targetProfitPercentage}%)
                            </span>
                          </li>
                          <li>
                            <strong>Expected Sales Volume:</strong> {currentScenario.volume.toLocaleString()} units
                            <span className="text-muted-foreground ml-2">
                              (Based on market size and price elasticity)
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="scenarios">
            <Card className="p-6 space-y-4">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Pricing Scenarios Generation</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Minimum Price</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter minimum price" 
                      value={scenarioParams.minPrice}
                      onChange={(e) => {
                        const minPrice = Number(e.target.value)
                        setScenarioParams(prev => ({
                          ...prev, 
                          minPrice,
                          // Auto-adjust max price if needed
                          maxPrice: minPrice > prev.maxPrice ? minPrice * 2 : prev.maxPrice
                        }))
                      }}
                      min={0}
                      step={0.01}
                    />
                  </div>
                  <div>
                    <Label>Maximum Price</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter maximum price" 
                      value={scenarioParams.maxPrice}
                      onChange={(e) => {
                        const maxPrice = Number(e.target.value)
                        setScenarioParams(prev => ({
                          ...prev, 
                          maxPrice,
                          // Ensure max price is always greater than min price
                          minPrice: maxPrice < prev.minPrice ? maxPrice / 2 : prev.minPrice
                        }))
                      }}
                      min={0}
                      step={0.01}
                    />
                  </div>
                  <div>
                    <Label>Number of Scenarios</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter number of scenarios" 
                      value={scenarioParams.numScenarios}
                      onChange={(e) => setScenarioParams(prev => ({
                        ...prev, 
                        numScenarios: Math.max(2, Math.min(20, Number(e.target.value)))
                      }))}
                      min={2}
                      max={20}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => setScenarios(calculatePricingScenarios(scenarioParams))}
                  className="w-full"
                >
                  Generate Scenarios
                </Button>
              </div>

              {scenarios.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4">Generated Scenarios</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Price</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Profit Margin</TableHead>
                        <TableHead>Meets Target</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scenarios.map((scenario, index) => (
                        <TableRow 
                          key={index} 
                          className={scenario.meetsTargetProfit ? 'bg-green-50' : 'bg-yellow-50'}
                        >
                          <TableCell>${scenario.price.toFixed(2)}</TableCell>
                          <TableCell>{scenario.volume.toLocaleString()}</TableCell>
                          <TableCell>${scenario.revenue.toLocaleString()}</TableCell>
                          <TableCell>${scenario.profit.toLocaleString()}</TableCell>
                          <TableCell>{scenario.profitMargin.toFixed(1)}%</TableCell>
                          <TableCell>
                            {scenario.meetsTargetProfit ? '✓' : '✗'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="analysis">
            <Card className="p-6 space-y-4">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Pricing Strategy Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Breakeven Point</Label>
                    <div className="bg-muted p-3 rounded-md">
                      ${breakEvenAnalysis.point.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <Label>Optimal Price Range</Label>
                    <div className="bg-muted p-3 rounded-md">
                      ${breakEvenAnalysis.optimalPriceRange.min.toFixed(2)} - 
                      ${breakEvenAnalysis.optimalPriceRange.max.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <Label>Market Sensitivity</Label>
                    <div className="bg-muted p-3 rounded-md">
                      {breakEvenAnalysis.marketSensitivity.toFixed(2)}
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart 
                    data={analysisChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="price" 
                      label={{ value: 'Price ($)', position: 'insideBottom', offset: -10 }} 
                    />
                    <YAxis 
                      label={{ value: 'Profit ($)', angle: -90, position: 'insideLeft' }} 
                    />
                    <ChartTooltip 
                      formatter={(value, name) => [
                        `$${Number(value).toFixed(2)}`, 
                        name === 'profit' ? 'Profit' : 
                        name === 'revenue' ? 'Revenue' : name
                      ]}
                      labelFormatter={(label) => `Price: $${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Bar 
                      type="monotone" 
                      dataKey="revenue" 
                      fill="#82ca9d" 
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscription">
            <SubscriptionRevenueCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
