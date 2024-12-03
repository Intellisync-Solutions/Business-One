import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Valuation Results</h3>
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
          
          <div className="mt-6 p-4 bg-secondary rounded-lg">
            <h4 className="font-semibold mb-2">Suggested Value Range</h4>
            <p>${Math.min(valuations.assetBased, valuations.market, valuations.earnings, valuations.dcf).toFixed(2)} - 
               ${Math.max(valuations.assetBased, valuations.market, valuations.earnings, valuations.dcf).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-2">
              This range represents different valuation methods. The actual value may vary based on industry specifics,
              market conditions, and other factors.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
