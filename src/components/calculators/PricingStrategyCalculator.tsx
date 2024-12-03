import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { ExportButton } from "@/components/common/ExportButton"
import { SaveLoadState } from "@/components/common/SaveLoadState"

interface CostStructure {
  fixedCosts: number;
  variableCostPerUnit: number;
  targetProfit: number;
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
  totalCosts: number;
  profit: number;
}

export function PricingStrategyCalculator() {
  const [costs, setCosts] = useState<CostStructure>({
    fixedCosts: 0,
    variableCostPerUnit: 0,
    targetProfit: 0
  })

  const [market, setMarket] = useState<MarketData>({
    competitorPrice: 0,
    marketSize: 0,
    priceElasticity: 1.5 // Default elasticity
  })

  const calculatePricingScenarios = () => {
    const scenarios: PricingScenario[] = []
    const basePrice = costs.variableCostPerUnit * 2 // Starting point
    
    // Generate scenarios for different price points
    for (let i = -50; i <= 50; i += 10) {
      const price = basePrice * (1 + i / 100)
      
      // Calculate volume based on price elasticity
      const priceRatio = price / market.competitorPrice
      const elasticityEffect = Math.pow(priceRatio, -market.priceElasticity)
      const volume = market.marketSize * elasticityEffect
      
      // Calculate financials
      const revenue = price * volume
      const totalCosts = costs.fixedCosts + (costs.variableCostPerUnit * volume)
      const profit = revenue - totalCosts
      
      scenarios.push({
        price,
        volume,
        revenue,
        totalCosts,
        profit
      })
    }
    
    return scenarios
  }

  const scenarios = calculatePricingScenarios()
  const optimalScenario = scenarios.reduce((prev, current) => 
    (current.profit > prev.profit) ? current : prev
  )

  const chartData = scenarios.map(s => ({
    price: s.price.toFixed(2),
    revenue: s.revenue,
    profit: s.profit,
    volume: s.volume
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <SaveLoadState
          calculatorType="pricing-strategy"
          currentState={{
            costs,
            market,
            scenarios: calculatePricingScenarios(),
            optimalScenario
          }}
          onLoadState={(state) => {
            setCosts(state.costs)
            setMarket(state.market)
          }}
        />
        <ExportButton
          data={{
            costs,
            market,
            scenarios: calculatePricingScenarios(),
            optimalScenario,
            recommendation: optimalScenario.price > market.competitorPrice 
              ? 'Premium pricing strategy recommended' 
              : 'Competitive pricing strategy recommended'
          }}
          filename="pricing-strategy"
          title="Pricing Strategy Analysis"
          description="Comprehensive pricing analysis and recommendations"
        />
      </div>
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Cost Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="fixedCosts">Fixed Costs ($)</Label>
            <Input
              id="fixedCosts"
              type="number"
              value={costs.fixedCosts || ''}
              onChange={e => setCosts({...costs, fixedCosts: parseFloat(e.target.value) || 0})}
              placeholder="Enter fixed costs"
            />
          </div>
          
          <div>
            <Label htmlFor="variableCosts">Variable Cost per Unit ($)</Label>
            <Input
              id="variableCosts"
              type="number"
              value={costs.variableCostPerUnit || ''}
              onChange={e => setCosts({...costs, variableCostPerUnit: parseFloat(e.target.value) || 0})}
              placeholder="Enter variable cost per unit"
            />
          </div>
          
          <div>
            <Label htmlFor="targetProfit">Target Profit ($)</Label>
            <Input
              id="targetProfit"
              type="number"
              value={costs.targetProfit || ''}
              onChange={e => setCosts({...costs, targetProfit: parseFloat(e.target.value) || 0})}
              placeholder="Enter target profit"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Market Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="competitorPrice">Competitor Price ($)</Label>
            <Input
              id="competitorPrice"
              type="number"
              value={market.competitorPrice || ''}
              onChange={e => setMarket({...market, competitorPrice: parseFloat(e.target.value) || 0})}
              placeholder="Enter competitor price"
            />
          </div>
          
          <div>
            <Label htmlFor="marketSize">Market Size (units)</Label>
            <Input
              id="marketSize"
              type="number"
              value={market.marketSize || ''}
              onChange={e => setMarket({...market, marketSize: parseFloat(e.target.value) || 0})}
              placeholder="Enter market size"
            />
          </div>
          
          <div>
            <Label htmlFor="priceElasticity">Price Elasticity</Label>
            <Input
              id="priceElasticity"
              type="number"
              value={market.priceElasticity || ''}
              onChange={e => setMarket({...market, priceElasticity: parseFloat(e.target.value) || 0})}
              placeholder="Enter price elasticity"
            />
          </div>
        </div>
      </Card>

      <Tabs defaultValue="optimal" className="w-full">
        <TabsList>
          <TabsTrigger value="optimal">Optimal Price</TabsTrigger>
          <TabsTrigger value="analysis">Price Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="optimal">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Optimal Pricing Strategy</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">Optimal Price</span>
                  <div className="text-lg font-bold mt-1">
                    ${optimalScenario.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="p-4 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">Expected Volume</span>
                  <div className="text-lg font-bold mt-1">
                    {optimalScenario.volume.toLocaleString()} units
                  </div>
                </div>
                
                <div className="p-4 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">Projected Revenue</span>
                  <div className="text-lg font-bold mt-1">
                    ${optimalScenario.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="p-4 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">Projected Profit</span>
                  <div className="text-lg font-bold mt-1">
                    ${optimalScenario.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-semibold mb-2">Price Positioning</h4>
                <div className="text-lg font-bold mb-2">
                  {optimalScenario.price > market.competitorPrice ? 
                    'Premium Pricing Strategy' : 
                    'Competitive Pricing Strategy'}
                </div>
                <p className="text-sm">
                  Based on your cost structure and market conditions, this price point
                  maximizes profitability while considering market dynamics.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Price Analysis</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="price" label={{ value: 'Price ($)', position: 'bottom' }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue ($)" />
                  <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit ($)" />
                  <Line type="monotone" dataKey="volume" stroke="#ffc658" name="Volume (units)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
