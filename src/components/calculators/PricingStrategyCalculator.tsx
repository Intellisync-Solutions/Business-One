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
 
  ResponsiveContainer,
  
  Area,
  ReferenceLine,
  ReferenceArea
} from 'recharts'

import { 
  Tooltip,
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from 'lucide-react'
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
import { useToast } from "@/components/ui/use-toast"

interface CostStructure {
  fixedCosts: number;
  variableCostPerUnit: number;
  targetProfitPercentage: number;
}

interface MarketData {
  competitorPrice: number;
  marketSize: number;
  priceElasticity: number | null;
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
  optimalPrice: number;
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
    marketSize: number
  ) => {
    if (marketSize <= 0) return 0;
    // Break-even is where Total Revenue = Total Costs
    // At break-even: Price * Volume = Fixed Costs + (Variable Cost * Volume)
    // Therefore: Price = Variable Cost + (Fixed Costs / Volume)
    return variableCostPerUnit + (fixedCosts / marketSize)
  }

  // Calculate optimal price with target margin
  const calculateOptimalPrice = (
    breakEvenPrice: number,
    targetProfitPercentage: number
  ) => {
    if (breakEvenPrice <= 0 || targetProfitPercentage <= 0) return 0;
    // The formula should be: breakEvenPrice / (1 - targetProfitPercentage/100)
    // This ensures the final price includes the target profit margin
    return breakEvenPrice / (1 - (targetProfitPercentage / 100));
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
      priceElasticity: null
    },
    scenarios: []
  })

  const [activeTab, setActiveTab] = useState('ai-analysis')
  const [scenarioParams, setScenarioParams] = useState<ScenarioParams>({
    minPrice: 0,
    maxPrice: 0,
    numScenarios: 0
  })
  const [scenarios, setScenarios] = useState<PricingScenario[]>([])
  const [breakEvenAnalysis, setBreakEvenAnalysis] = useState<BreakEvenAnalysis | null>(null)
  const [analysisChartData, setAnalysisChartData] = useState<any[]>([])
  const [breakEvenPrice, setBreakEvenPrice] = useState<number | null>(null)
  const [optimalPrice, setOptimalPrice] = useState<number | null>(null)
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

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

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

  // Calculate prices whenever inputs change
  useEffect(() => {
    const calculatePrices = () => {
      // Only calculate if we have valid inputs
      if (
        pricingData.costStructure.fixedCosts > 0 &&
        pricingData.costStructure.variableCostPerUnit > 0 &&
        pricingData.costStructure.targetProfitPercentage > 0 &&
        pricingData.marketData.marketSize > 0
      ) {
        const newBreakEvenPrice = calculateBreakEvenPrice(
          pricingData.costStructure.fixedCosts,
          pricingData.costStructure.variableCostPerUnit,
          pricingData.marketData.marketSize
        );
        
        const newOptimalPrice = calculateOptimalPrice(
          newBreakEvenPrice,
          pricingData.costStructure.targetProfitPercentage
        );

        console.log('Calculating new prices:', {
          breakEven: newBreakEvenPrice,
          optimal: newOptimalPrice,
          inputs: {
            fixedCosts: pricingData.costStructure.fixedCosts,
            variableCosts: pricingData.costStructure.variableCostPerUnit,
            marketSize: pricingData.marketData.marketSize,
            targetProfit: pricingData.costStructure.targetProfitPercentage
          }
        });

        setBreakEvenPrice(newBreakEvenPrice);
        setOptimalPrice(newOptimalPrice);

        // Generate pricing scenarios
        const generatePricingScenarios = () => {
          const { 
            fixedCosts, 
            variableCostPerUnit, 
            targetProfitPercentage 
          } = pricingData.costStructure;
          const { marketSize, priceElasticity } = pricingData.marketData;

          // Calculate scenario parameters
          const minPrice = newBreakEvenPrice * 0.8;
          const maxPrice = newOptimalPrice * 1.5;
          const numScenarios = 10;

          const scenarios: PricingScenario[] = [];

          for (let i = 0; i < numScenarios; i++) {
            // Interpolate price between min and max
            const price = minPrice + (maxPrice - minPrice) * (i / (numScenarios - 1));
            
            // Calculate volume based on price elasticity
            // Simple linear demand curve: volume = marketSize * (1 - priceElasticity * (price - basePrice) / basePrice)
            const basePrice = pricingData.marketData.competitorPrice || newOptimalPrice;
            const priceElasticity = pricingData.marketData.priceElasticity ?? 0; // Default to 0 if null
            const volume = Math.max(0, marketSize * (1 - priceElasticity * (price - basePrice) / basePrice));

            // Calculate financial metrics
            const revenue = price * volume;
            const variableCosts = variableCostPerUnit * volume;
            const totalCosts = fixedCosts + variableCosts;
            const profit = revenue - totalCosts;
            const profitMargin = (profit / revenue) * 100;
            const targetProfit = fixedCosts * (targetProfitPercentage / 100);
            const meetsTargetProfit = profit >= targetProfit;

            scenarios.push({
              price,
              volume,
              revenue,
              variableCosts,
              totalCosts,
              profit,
              targetProfit,
              profitMargin,
              meetsTargetProfit
            });
          }

          // Sort scenarios by profitability
          scenarios.sort((a, b) => b.profit - a.profit);

          // Set scenarios and current best scenario
          setScenarios(scenarios);
          setCurrentScenario(scenarios[0] || defaultScenario);

          // Perform break-even analysis
          const breakEvenAnalysis: BreakEvenAnalysis = {
            point: newBreakEvenPrice,
            optimalPrice: newOptimalPrice,
            optimalPriceRange: {
              min: minPrice,
              max: maxPrice
            },
            marketSensitivity: priceElasticity ?? 0, // Default to 0 if null
          min: scenarios.length > 0 ? scenarios[scenarios.length - 1].price : 0,
          max: scenarios.length > 0 ? scenarios[0].price : 0
          };
          setBreakEvenAnalysis(breakEvenAnalysis);

          // Prepare chart data for visualization
          const chartData = scenarios.map(scenario => ({
            price: scenario.price,
            profit: scenario.profit,
            revenue: scenario.revenue,
            volume: scenario.volume
          }));
          setAnalysisChartData(chartData);
        };

        // Generate scenarios
        generatePricingScenarios();
      }
    };

    // Run calculation
    calculatePrices();
  }, [pricingData]);

  // Function to generate AI analysis
  const generateAiPricingAnalysis = async (priceElasticity: number) => {
    try {
      // Detailed logging of input values
      console.log('AI Analysis Generation - Input Data:', {
        fixedCosts: pricingData.costStructure.fixedCosts,
        variableCostPerUnit: pricingData.costStructure.variableCostPerUnit,
        targetProfitPercentage: pricingData.costStructure.targetProfitPercentage,
        marketSize: pricingData.marketData.marketSize,
        priceElasticity: priceElasticity
      });

      // Validate inputs before generating analysis
      const validationErrors: string[] = [];
      
      if (pricingData.costStructure.fixedCosts <= 0) {
        validationErrors.push("Fixed Costs must be greater than 0");
      }
      if (pricingData.costStructure.variableCostPerUnit <= 0) {
        validationErrors.push("Variable Cost Per Unit must be greater than 0");
      }
      if (pricingData.costStructure.targetProfitPercentage <= 0) {
        validationErrors.push("Target Profit Percentage must be greater than 0");
      }
      if (pricingData.marketData.marketSize <= 0) {
        validationErrors.push("Market Size must be greater than 0");
      }
      if (priceElasticity <= 0) {
        validationErrors.push("Price Elasticity must be greater than 0");
      }

      // If there are validation errors, show a toast and return
      if (validationErrors.length > 0) {
        toast({
          title: "Insufficient Data",
          description: validationErrors.join(". "),
          variant: "destructive"
        });
        return;
      }

      const functionUrl = 'http://localhost:9000/.netlify/functions/analyze-pricing-strategy';
      const response = await fetch(functionUrl, {
        method: 'POST',
        body: JSON.stringify({ 
          breakEvenAnalysis, 
          scenarios,
          costStructure: pricingData.costStructure,
          marketData: {
            ...pricingData.marketData,
            priceElasticity
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Analysis Generation Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      
      console.log('AI Analysis Response:', data);

      // Store the AI analysis in state
      setAiAnalysis(data.analysis || "No detailed analysis available.");

      // Optional: Still keep a toast for immediate feedback
      toast({
        title: "Pricing Strategy Analysis",
        description: "Analysis generated successfully.",
      });

      // Switch to AI Analysis tab
      setActiveTab('ai-analysis');
    } catch (error) {
      console.error('Error generating pricing analysis:', error);
      toast({
        title: "Analysis Error",
        description: "Could not generate pricing strategy analysis.",
        variant: "destructive"
      });
      setAiAnalysis(null);
    }
  };

  // Update the cost structure
  const updateCostStructure = (field: keyof CostStructure, value: number) => {
    setPricingData(prev => ({
      ...prev,
      costStructure: {
        ...prev.costStructure,
        [field]: value
      }
    }));
  }

  // Update market data
  const updateMarketData = (field: keyof MarketData, value: number | null) => {
    setPricingData(prev => ({
      ...prev,
      marketData: {
        ...prev.marketData,
        [field]: value
      }
    }));
  }

  const calculatePricingScenarios = (scenarioParams: ScenarioParams): PricingScenario[] => {
    const scenarios: PricingScenario[] = []
    
    // Validate inputs to prevent invalid calculations
    const validationErrors: string[] = [];
    
    // Ensure all inputs are parsed as numbers and stripped of any leading zeros
    const fixedCosts = Number(pricingData.costStructure.fixedCosts);
    const variableCostPerUnit = Number(pricingData.costStructure.variableCostPerUnit);
    const marketSize = Number(pricingData.marketData.marketSize);
    const competitorPrice = Number(pricingData.marketData.competitorPrice);
    const targetProfitPercentage = Number(pricingData.costStructure.targetProfitPercentage);
    const priceElasticity = pricingData.marketData.priceElasticity;
    
    if (variableCostPerUnit <= 0) {
      validationErrors.push("Variable Cost Per Unit must be greater than 0");
    }
    if (marketSize <= 0) {
      validationErrors.push("Market Size must be greater than 0");
    }
    if (competitorPrice <= 0) {
      validationErrors.push("Competitor Price must be greater than 0");
    }
    if (scenarioParams.minPrice <= 0) {
      validationErrors.push("Minimum Price must be greater than 0");
    }
    if (scenarioParams.maxPrice <= 0) {
      validationErrors.push("Maximum Price must be greater than 0");
    }
    if (scenarioParams.numScenarios <= 0) {
      validationErrors.push("Number of Scenarios must be greater than 0");
    }
    if (scenarioParams.maxPrice <= scenarioParams.minPrice) {
      validationErrors.push("Maximum Price must be greater than Minimum Price");
    }

    // If there are validation errors, show a toast and return empty scenarios
    if (validationErrors.length > 0) {
      toast({
        title: "Scenario Generation Failed",
        description: validationErrors.join(". "),
        variant: "destructive"
      });
      return scenarios;
    }

    // Generate scenarios dynamically based on user-defined parameters
    const priceStep = (scenarioParams.maxPrice - scenarioParams.minPrice) / (scenarioParams.numScenarios - 1)
    
    for (let i = 0; i < scenarioParams.numScenarios; i++) {
      const price = Number((scenarioParams.minPrice + i * priceStep).toFixed(2))
      
      // Calculate demand using our new price elasticity function (0-1 scale)
      const volume = calculateExpectedVolume(
        price,
        marketSize,
        competitorPrice,
        priceElasticity
      );

      // Calculate costs and revenue
      const revenue = Number((price * volume).toFixed(2))
      const variableCosts = Number((volume * variableCostPerUnit).toFixed(2))
      const totalCosts = Number((fixedCosts + variableCosts).toFixed(2))
      const profit = Number((revenue - totalCosts).toFixed(2))
      const targetProfit = Number((revenue * (targetProfitPercentage / 100)).toFixed(2))
      const profitMargin = Number(((profit / revenue) * 100).toFixed(2))

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

  const calculateExpectedVolume = (price: number, marketSize: number, competitorPrice: number, elasticity: number | null) => {
    if (price <= 0 || marketSize <= 0 || competitorPrice <= 0) return 0;
    
    // Calculate price difference percentage
    const priceDiff = (price - competitorPrice) / competitorPrice;
    
    // With elasticity 0-1:
    // - At 0 (no sensitivity): volume reduction is minimal (only 10% max)
    // - At 1 (high sensitivity): volume reduction is substantial (up to 90%)
    const safeElasticity = elasticity ?? 0; // Default to 0 if null
    const maxVolumeReduction = 0.1 + (0.8 * safeElasticity); // Maps 0->0.1, 1->0.9
    
    // Calculate volume reduction based on price difference and elasticity
    const volumeReduction = Math.min(maxVolumeReduction, Math.max(0, priceDiff * safeElasticity));
    
    return Math.floor(marketSize * (1 - volumeReduction));
  };

  const clearCalculator = () => {
    // Reset all state variables to their initial values
    setPricingData({
      costStructure: {
        fixedCosts: 0,
        variableCostPerUnit: 0,
        targetProfitPercentage: 0
      },
      marketData: {
        competitorPrice: 0,
        marketSize: 0,
        priceElasticity: null
      },
      scenarios: []
    });
    setScenarioParams({
      minPrice: 0,
      maxPrice: 0,
      numScenarios: 0
    });
    setScenarios([]);
    setBreakEvenAnalysis(null);
    setAnalysisChartData([]);
    setBreakEvenPrice(null);
    setOptimalPrice(null);
    setCurrentScenario({
      price: 0,
      volume: 0,
      revenue: 0,
      variableCosts: 0,
      totalCosts: 0,
      profit: 0,
      targetProfit: 0,
      profitMargin: 0,
      meetsTargetProfit: false
    });
    setActiveTab('ai-analysis');
    setAiAnalysis(null);
    
    // Show a toast notification
    toast({
      title: "Calculator Reset",
      description: "All input values and calculations have been cleared.",
      variant: "default"
    });
  };

  // Modify the component to use the calculated values
  const currentBreakEvenPrice = breakEvenPrice === null ? null : breakEvenPrice;
  const currentOptimalPrice = optimalPrice === null ? null : optimalPrice;

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Pricing Strategy Calculator</h2>
          <DataPersistence
            data={pricingData}
            onDataImport={setPricingData}
            dataType="pricing-strategy"
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="optimal">Optimal</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="optimal">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Cost Structure</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    Fixed Costs
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>Fixed costs are expenses that remain constant regardless of production volume. Examples include rent, salaries, and insurance.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input 
                    type="number"
                    min="0"
                    step="1"
                    value={pricingData.costStructure.fixedCosts || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                      updateCostStructure('fixedCosts', value);
                    }}
                    placeholder="Enter fixed costs"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    Variable Cost Per Unit
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>Cost that changes directly with the production volume. Includes materials, direct labor, and per-unit packaging costs.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricingData.costStructure.variableCostPerUnit || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                      updateCostStructure('variableCostPerUnit', value);
                    }}
                    placeholder="Enter variable cost"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    Target Profit Percentage
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>Desired profit margin as a percentage of revenue. For example, 20% means you want to earn $20 for every $100 in sales.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={pricingData.costStructure.targetProfitPercentage || ''}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/^0+/, ''); // Remove leading zeros
                      const value = rawValue === '' ? 0 : Math.max(0, Math.min(100, Number(rawValue)));
                      setPricingData(prev => ({
                        ...prev,
                        costStructure: {
                          ...prev.costStructure,
                          targetProfitPercentage: value
                        }
                      }));
                    }}
                    placeholder="Enter target profit %"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={clearCalculator}
                  className="w-full"
                >
                  Clear
                </Button>
                <Button 
                  onClick={() => {
                    // Validate inputs before generating scenarios
                    const isValid = 
                      pricingData.costStructure.fixedCosts > 0 &&
                      pricingData.costStructure.variableCostPerUnit > 0 &&
                      pricingData.costStructure.targetProfitPercentage > 0 &&
                      pricingData.marketData.competitorPrice > 0 &&
                      pricingData.marketData.marketSize > 0 &&
                      pricingData.marketData.priceElasticity !== null;

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
                        pricingData.marketData.marketSize
                      ) * 0.8, 1),
                      maxPrice: calculateBreakEvenPrice(
                        pricingData.costStructure.fixedCosts,
                        pricingData.costStructure.variableCostPerUnit,
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
                      pricingData.marketData.priceElasticity !== null)
                  }
                >
                  Generate Results
                </Button>
              </div>

            </Card>

            <Card className="p-6 mt-4">
              <h3 className="text-xl font-semibold mb-4">Market Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    Competitor Price
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>The current market price for similar products or services.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricingData.marketData.competitorPrice || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                      updateMarketData('competitorPrice', value);
                    }}
                    placeholder="Enter competitor price"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    Market Size
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>Total number of potential units that can be sold in the market.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={pricingData.marketData.marketSize || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                      updateMarketData('marketSize', value);
                    }}
                    placeholder="Enter market size"
                  />
                </div>
                <div>
                  <Label>Price Elasticity</Label>
                  <Input 
                    type="number"
                    value={pricingData.marketData.priceElasticity || ''}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const value = rawValue === '' ? null : Number(rawValue);
                      
                      updateMarketData('priceElasticity', value);
                    }}
                    placeholder="Enter price elasticity (optional)"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={() => {
                    // Ensure null is treated as 0 for AI generation
                    const priceElasticity = pricingData.marketData.priceElasticity ?? 0;
                    generateAiPricingAnalysis(priceElasticity);
                  }}
                  className="w-full md:w-auto"
                >
                  Intellisync Analysis
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Optimal Pricing Strategy</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <span className="text-sm font-medium">Break-even Price</span>
                    <div className="text-lg font-bold mt-1">
                      {currentBreakEvenPrice === null ? 'Not calculated' : `$${currentBreakEvenPrice.toFixed(2)}`}
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Minimum price to cover all costs, with zero profit.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-secondary rounded-lg">
                    <span className="text-sm font-medium">Optimal Price</span>
                    <div className="text-lg font-bold mt-1">
                      {currentOptimalPrice === null ? 'Not calculated' : `$${currentOptimalPrice.toFixed(2)}`}
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground">
                      This price is calculated by analyzing multiple scenarios starting from your break-even point (${currentBreakEvenPrice === null ? 'Not calculated' : `$${currentBreakEvenPrice.toFixed(2)}`}). 
                      It factors in your target profit margin of {pricingData.costStructure.targetProfitPercentage}% and market competitiveness 
                      to find the best balance between profitability and market position.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-secondary rounded-lg">
                    <span className="text-sm font-medium">Expected Volume</span>
                    <div className="text-lg font-bold mt-1">
                      {currentScenario.volume.toLocaleString()} units
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Projected sales volume based on price elasticity ({pricingData.marketData.priceElasticity != null ? pricingData.marketData.priceElasticity.toFixed(2) : 'N/A'}) and total market size ({pricingData.marketData.marketSize.toLocaleString()} units). 
                      This estimate factors in how demand changes relative to your competitor's price (${pricingData.marketData.competitorPrice.toFixed(2)}).
                    </p>
                  </div>
                  
                  <div className="p-4 bg-secondary rounded-lg">
                    <span className="text-sm font-medium">Projected Revenue</span>
                    <div className="text-lg font-bold mt-1">
                      ${currentScenario.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Calculated as optimal price (${currentOptimalPrice === null ? 'Not calculated' : `$${currentOptimalPrice.toFixed(2)}`}) × expected volume ({currentScenario.volume.toLocaleString()} units). 
                      The volume is adjusted based on price elasticity, meaning higher prices will typically capture less than the total market size of {pricingData.marketData.marketSize.toLocaleString()} units.
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
                            <strong>Break-even Price:</strong> {currentBreakEvenPrice === null ? 'Not calculated' : `$${currentBreakEvenPrice.toFixed(2)}`}
                            <span className="text-muted-foreground ml-2">
                              (Minimum price to cover all costs, with zero profit)
                            </span>
                          </li>
                          <li>
                            <strong>Optimal Price:</strong> {currentOptimalPrice === null ? 'Not calculated' : `$${currentOptimalPrice.toFixed(2)}`}
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
                            <strong>Price Elasticity Factor:</strong> {pricingData.marketData.priceElasticity != null ? pricingData.marketData.priceElasticity.toFixed(2) : 'N/A'}
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
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold mb-4">Pricing Scenarios Generation</h3>
                
                {breakEvenAnalysis && (
                  <div className="bg-secondary rounded-lg p-4">
                    <h5 className="font-medium mb-2">Break-Even Analysis</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-foreground"><strong>Break-Even Point:</strong> ${breakEvenAnalysis.point.toFixed(2)}</p>
                        <p className="text-foreground"><strong>Optimal Price:</strong> ${breakEvenAnalysis.optimalPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-foreground"><strong>Optimal Price Range:</strong> ${breakEvenAnalysis.optimalPriceRange.min.toFixed(2)} - 
                        ${breakEvenAnalysis.optimalPriceRange.max.toFixed(2)}</p>
                        <p className="text-foreground"><strong>Market Sensitivity:</strong> {breakEvenAnalysis.marketSensitivity.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Minimum Price</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter minimum price" 
                      value={scenarioParams.minPrice || ''}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/^0+/, ''); // Remove leading zeros
                        const minPrice = rawValue === '' ? 0 : Number(rawValue);
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
                      value={scenarioParams.maxPrice || ''}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/^0+/, ''); // Remove leading zeros
                        const maxPrice = rawValue === '' ? 0 : Number(rawValue);
                        setScenarioParams(prev => ({
                          ...prev, 
                          maxPrice,
                          // Ensure max price is always greater than min price
                          minPrice: maxPrice < prev.minPrice ? Number((maxPrice / 2).toFixed(2)) : prev.minPrice
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
                      value={scenarioParams.numScenarios || ''}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/^0+/, ''); // Remove leading zeros
                        const numScenarios = rawValue === '' ? 2 : Number(rawValue);
                        
                        // Check for out-of-range values and show alert
                        if (numScenarios < 2 || numScenarios > 20) {
                          toast({
                            variant: "destructive",
                            title: "Invalid Number of Scenarios",
                            description: `Number of scenarios must be between 2 and 20. You entered ${numScenarios}.`
                          });
                        }
                        
                        // Always update the state, allowing dynamic modification
                        setScenarioParams(prev => ({
                          ...prev, 
                          numScenarios
                        }));
                      }}
                      min={2}
                      max={20}
                      step={1}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => setScenarios(calculatePricingScenarios(scenarioParams))}
                  className="w-full mt-4"
                >
                  Generate Scenarios
                </Button>

                {scenarios.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4 text-foreground">Generated Scenarios</h4>
                    <div className="bg-background rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-foreground">Price</TableHead>
                            <TableHead className="text-foreground">Volume</TableHead>
                            <TableHead className="text-foreground">Revenue</TableHead>
                            <TableHead className="text-foreground">Profit</TableHead>
                            <TableHead className="text-foreground">Profit Margin</TableHead>
                            <TableHead className="text-foreground">Target Profit Margin</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scenarios.map((scenario, index) => (
                            scenario && (
                              <TableRow 
                                key={index}
                                className="hover:bg-muted/50 transition-colors"
                              >
                                <TableCell className="text-foreground">
                                  ${scenario.price ? scenario.price.toFixed(2) : '0.00'}
                                </TableCell>
                                <TableCell className="text-foreground">
                                  {scenario.volume ? scenario.volume.toLocaleString() : '0'}
                                </TableCell>
                                <TableCell className="text-foreground">
                                  ${scenario.revenue ? scenario.revenue.toLocaleString() : '0'}
                                </TableCell>
                                <TableCell className="text-foreground">
                                  ${scenario.profit ? scenario.profit.toLocaleString() : '0'}
                                </TableCell>
                                <TableCell className="text-foreground">
                                  {scenario.profitMargin ? scenario.profitMargin.toFixed(1) : '0.0'}%
                                </TableCell>
                                <TableCell className="text-foreground">
                                  {scenario.meetsTargetProfit !== undefined ? (
                                    scenario.meetsTargetProfit ? 
                                    <span className="text-green-600">✓</span> : 
                                    <span className="text-yellow-600">✗</span>
                                  ) : (
                                    <span className="text-gray-600">-</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>

              </Card>
          </TabsContent>
          
          <TabsContent value="analysis">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-2xl font-semibold">Pricing Strategy Analysis</h4>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-muted-foreground">Profit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                      <span className="text-sm text-muted-foreground">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                      <span className="text-sm text-muted-foreground">Volume</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border rounded-lg p-4 shadow-sm">
                    <Label className="text-sm text-muted-foreground">Break-Even Point</Label>
                    <div className="mt-1 text-2xl font-semibold">
                      ${breakEvenAnalysis?.point.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-card border rounded-lg p-4 shadow-sm">
                    <Label className="text-sm text-muted-foreground">Optimal Price Range</Label>
                    <div className="mt-1 text-2xl font-semibold">
                      ${breakEvenAnalysis?.optimalPriceRange.min.toFixed(2)} - 
                      ${breakEvenAnalysis?.optimalPriceRange.max.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-card border rounded-lg p-4 shadow-sm">
                    <Label className="text-sm text-muted-foreground">Market Sensitivity</Label>
                    <div className="mt-1 text-2xl font-semibold">
                      {breakEvenAnalysis?.marketSensitivity.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-card border rounded-lg p-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart 
                      data={analysisChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false}
                        stroke="#E5E7EB"
                      />
                      <XAxis 
                        dataKey="price" 
                        label={{ 
                          value: 'Price ($)', 
                          position: 'insideBottom', 
                          offset: -10,
                          style: { fill: '#6B7280', fontSize: 12 }
                        }}
                        tickFormatter={(value) => `$${Number(value).toFixed(2)}`}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <YAxis 
                        yAxisId="left"
                        label={{ 
                          value: 'Value ($)', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fill: '#6B7280', fontSize: 12 }
                        }}
                        tickFormatter={(value) => `$${Number(value).toFixed(2)}`}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        label={{ 
                          value: 'Volume', 
                          angle: 90, 
                          position: 'insideRight',
                          style: { fill: '#6B7280', fontSize: 12 }
                        }}
                        tickFormatter={(value) => Number(value).toFixed(2)}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <ChartTooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value, name) => [
                          name === 'volume' ? Number(value).toFixed(2) : `$${Number(value).toFixed(2)}`,
                          typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : String(name)
                        ]}
                        labelFormatter={(label) => `Price: $${Number(label).toFixed(2)}`}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        fill="#4F46E5"
                        stroke="#4F46E5"
                        fillOpacity={0.1}
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone"
                        dataKey="profit"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ 
                          r: 6, 
                          stroke: '#3B82F6',
                          strokeWidth: 2,
                          fill: '#fff'
                        }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone"
                        dataKey="volume"
                        stroke="#A855F7"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ 
                          r: 6, 
                          stroke: '#A855F7',
                          strokeWidth: 2,
                          fill: '#fff'
                        }}
                      />
                      {breakEvenAnalysis && (
                        <ReferenceLine
                          x={breakEvenAnalysis.point}
                          yAxisId="left"
                          stroke="#EF4444"
                          strokeDasharray="3 3"
                          label={{
                            value: 'Break-Even',
                            position: 'top',
                            fill: '#EF4444',
                            fontSize: 12
                          }}
                        />
                      )}
                      {breakEvenAnalysis && (
                        <ReferenceArea
                          x1={breakEvenAnalysis.optimalPriceRange.min}
                          x2={breakEvenAnalysis.optimalPriceRange.max}
                          fill="#22C55E"
                          fillOpacity={0.1}
                          label={{
                            value: 'Optimal Range',
                            position: 'top',
                            fill: '#22C55E',
                            fontSize: 12
                          }}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscription">
            <SubscriptionRevenueCalculator />
          </TabsContent>

          <TabsContent value="ai-analysis">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">AI-Generated Market Analysis</h3>
              {aiAnalysis && (
                <div className="bg-background rounded-lg p-4">
                  <p className="text-foreground">{aiAnalysis}</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
