import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportButton } from "@/components/common/ExportButton"
import { SaveLoadState } from "@/components/common/SaveLoadState"

interface FinancialMetrics {
  revenue: number;
  netIncome: number;
  assets: number;
  liabilities: number;
  cashFlow: number;
  growthRate: number;
}

export function BusinessValuationCalculator() {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    revenue: 0,
    netIncome: 0,
    assets: 0,
    liabilities: 0,
    cashFlow: 0,
    growthRate: 0
  })

  const calculateValuations = () => {
    // Asset-based valuation
    const assetBasedValue = metrics.assets - metrics.liabilities;

    // Market multiple valuation (using revenue multiple)
    const revenueMultiple = 2.0; // Industry average multiple
    const marketValue = metrics.revenue * revenueMultiple;

    // Earnings-based valuation (using P/E ratio)
    const peRatio = 15; // Industry average P/E ratio
    const earningsValue = metrics.netIncome * peRatio;

    // Discounted Cash Flow (DCF) valuation
    const discountRate = 0.10; // 10% discount rate
    const years = 5;
    let dcfValue = 0;
    
    for (let i = 1; i <= years; i++) {
      const projectedCashFlow = metrics.cashFlow * Math.pow(1 + metrics.growthRate / 100, i);
      dcfValue += projectedCashFlow / Math.pow(1 + discountRate, i);
    }

    // Terminal value
    const terminalValue = (metrics.cashFlow * Math.pow(1 + metrics.growthRate / 100, years + 1)) / 
                         (discountRate - metrics.growthRate / 100);
    dcfValue += terminalValue / Math.pow(1 + discountRate, years);

    return {
      assetBased: assetBasedValue,
      market: marketValue,
      earnings: earningsValue,
      dcf: dcfValue
    }
  }

  const valuations = calculateValuations()

  const chartData = [
    {
      name: 'Valuation Methods',
      'Asset-Based': valuations.assetBased,
      'Market Multiple': valuations.market,
      'Earnings-Based': valuations.earnings,
      'DCF': valuations.dcf
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <SaveLoadState
          calculatorType="business-valuation"
          currentState={{
            metrics,
            valuations
          }}
          onLoadState={(state) => {
            setMetrics(state.metrics)
          }}
        />
        <ExportButton
          data={{
            metrics,
            valuations,
            suggestedRange: {
              min: Math.min(valuations.assetBased, valuations.market, valuations.earnings, valuations.dcf),
              max: Math.max(valuations.assetBased, valuations.market, valuations.earnings, valuations.dcf),
              average: (valuations.assetBased + valuations.market + valuations.earnings + valuations.dcf) / 4
            }
          }}
          filename="business-valuation"
          title="Business Valuation Analysis"
          description="Comprehensive business valuation using multiple methods"
          chartType="bar"
          chartData={chartData}
        />
      </div>
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Financial Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="revenue">Annual Revenue ($)</Label>
            <Input
              id="revenue"
              type="number"
              value={metrics.revenue || ''}
              onChange={e => setMetrics({...metrics, revenue: parseFloat(e.target.value) || 0})}
              placeholder="Enter annual revenue"
            />
          </div>
          
          <div>
            <Label htmlFor="netIncome">Net Income ($)</Label>
            <Input
              id="netIncome"
              type="number"
              value={metrics.netIncome || ''}
              onChange={e => setMetrics({...metrics, netIncome: parseFloat(e.target.value) || 0})}
              placeholder="Enter net income"
            />
          </div>
          
          <div>
            <Label htmlFor="assets">Total Assets ($)</Label>
            <Input
              id="assets"
              type="number"
              value={metrics.assets || ''}
              onChange={e => setMetrics({...metrics, assets: parseFloat(e.target.value) || 0})}
              placeholder="Enter total assets"
            />
          </div>
          
          <div>
            <Label htmlFor="liabilities">Total Liabilities ($)</Label>
            <Input
              id="liabilities"
              type="number"
              value={metrics.liabilities || ''}
              onChange={e => setMetrics({...metrics, liabilities: parseFloat(e.target.value) || 0})}
              placeholder="Enter total liabilities"
            />
          </div>
          
          <div>
            <Label htmlFor="cashFlow">Annual Cash Flow ($)</Label>
            <Input
              id="cashFlow"
              type="number"
              value={metrics.cashFlow || ''}
              onChange={e => setMetrics({...metrics, cashFlow: parseFloat(e.target.value) || 0})}
              placeholder="Enter annual cash flow"
            />
          </div>
          
          <div>
            <Label htmlFor="growthRate">Expected Growth Rate (%)</Label>
            <Input
              id="growthRate"
              type="number"
              value={metrics.growthRate || ''}
              onChange={e => setMetrics({...metrics, growthRate: parseFloat(e.target.value) || 0})}
              placeholder="Enter expected growth rate"
            />
          </div>
        </div>
      </Card>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="methods">Valuation Methods</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Valuation Summary</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <span>Suggested Value Range:</span>
                <span className="font-semibold">
                  ${Math.min(valuations.assetBased, valuations.market, valuations.earnings, valuations.dcf).toFixed(2)} - 
                  ${Math.max(valuations.assetBased, valuations.market, valuations.earnings, valuations.dcf).toFixed(2)}
                </span>
                
                <span>Average Valuation:</span>
                <span className="font-semibold">
                  ${((valuations.assetBased + valuations.market + valuations.earnings + valuations.dcf) / 4).toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Detailed Valuation Results</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <span>Asset-Based Valuation:</span>
                <span className="font-semibold">${valuations.assetBased.toFixed(2)}</span>
                
                <span>Market Multiple Valuation:</span>
                <span className="font-semibold">${valuations.market.toFixed(2)}</span>
                
                <span>Earnings-Based Valuation:</span>
                <span className="font-semibold">${valuations.earnings.toFixed(2)}</span>
                
                <span>DCF Valuation:</span>
                <span className="font-semibold">${valuations.dcf.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="methods">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Valuation Methods Explained</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Asset-Based Valuation</h4>
                <p className="text-sm text-muted-foreground">
                  Calculates business value based on total assets minus total liabilities.
                  Best suited for asset-heavy businesses.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold">Market Multiple Valuation</h4>
                <p className="text-sm text-muted-foreground">
                  Uses industry revenue multiples to estimate value.
                  Current multiple used: 2.0x revenue.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold">Earnings-Based Valuation</h4>
                <p className="text-sm text-muted-foreground">
                  Based on price-to-earnings (P/E) ratio.
                  Current P/E ratio used: 15x earnings.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold">Discounted Cash Flow (DCF)</h4>
                <p className="text-sm text-muted-foreground">
                  Projects future cash flows and discounts them to present value.
                  Uses 10% discount rate and {metrics.growthRate}% growth rate.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
            <div className="space-y-4">
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-semibold mb-2">Valuation Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Based on the multiple valuation methods, we recommend considering a value range of 
                  ${Math.min(valuations.assetBased, valuations.market, valuations.earnings, valuations.dcf).toFixed(2)} to 
                  ${Math.max(valuations.assetBased, valuations.market, valuations.earnings, valuations.dcf).toFixed(2)}.
                </p>
              </div>
              
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-semibold mb-2">Key Value Drivers</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                  <li>Strong cash flow generation: ${metrics.cashFlow.toFixed(2)} annually</li>
                  <li>Projected growth rate: {metrics.growthRate}%</li>
                  <li>Net asset value: ${(metrics.assets - metrics.liabilities).toFixed(2)}</li>
                  <li>Annual revenue: ${metrics.revenue.toFixed(2)}</li>
                </ul>
              </div>
              
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-semibold mb-2">Considerations</h4>
                <p className="text-sm text-muted-foreground">
                  The final valuation should consider industry conditions, market sentiment, and company-specific factors.
                  Consider seeking professional advice for a more detailed analysis.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
