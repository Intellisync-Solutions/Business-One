import { useState, useMemo, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportButton } from "@/components/common/ExportButton"
import { SaveLoadState } from "@/components/common/SaveLoadState"
import { validateForm, commonValidations, ValidationConfig } from "@/utils/validationUtils"

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

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validationConfig: ValidationConfig = {
    revenue: commonValidations.currency,
    netIncome: { ...commonValidations.currency, min: undefined }, // Allow negative values
    assets: commonValidations.currency,
    liabilities: commonValidations.currency,
    cashFlow: { ...commonValidations.currency, min: undefined }, // Allow negative values
    growthRate: { ...commonValidations.percentage, min: -100 } // Allow negative growth
  }

  const handleInputChange = useCallback((field: keyof FinancialMetrics) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Only update if the input matches our pattern or is empty
    if (validationConfig[field].pattern?.test(value) || value === '') {
      const newValue = value === '' ? 0 : parseFloat(value)
      const newMetrics = { ...metrics, [field]: newValue }
      
      // Validate the field before updating
      const validationResults = validateForm<FinancialMetrics>(newMetrics, { [field]: validationConfig[field] })
      
      setMetrics(newMetrics)
      setErrors(prev => {
        const newErrors = { ...prev }
        if (validationResults[field]) {
          newErrors[field] = validationResults[field]
        } else {
          delete newErrors[field]
        }
        return newErrors
      })
    }
  }, [metrics, validationConfig])

  const validateAllFields = useCallback((metricsToValidate: FinancialMetrics) => {
    const validationResults = validateForm<FinancialMetrics>(metricsToValidate, validationConfig)
    // Convert the validation results to our error state type
    const errors: { [key: string]: string } = {}
    Object.entries(validationResults).forEach(([key, value]) => {
      if (value) {
        errors[key] = value
      }
    })
    return errors
  }, [validationConfig])

  const handleStateLoad = useCallback((state: any) => {
    const newMetrics = state.metrics
    setMetrics(newMetrics)
    // Validate all fields when loading state
    const newErrors = validateAllFields(newMetrics)
    setErrors(newErrors)
  }, [validationConfig, validateAllFields])

  const valuations = useMemo(() => {
    // Validate all fields
    const formErrors = validateAllFields(metrics)
    
    // If there are any errors, return zero values
    if (Object.keys(formErrors).length > 0) {
      return {
        assetBased: 0,
        market: 0,
        earnings: 0,
        dcf: 0
      }
    }

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
  }, [metrics, validateAllFields])

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
          onLoadState={handleStateLoad}
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
            <Label htmlFor="revenue" className={errors.revenue ? "text-destructive" : ""}>
              Annual Revenue ($)
            </Label>
            <Input
              id="revenue"
              type="text"
              value={metrics.revenue || ''}
              onChange={handleInputChange('revenue')}
              placeholder="Enter annual revenue"
              className={errors.revenue ? "border-destructive" : ""}
            />
            {errors.revenue && (
              <p className="text-sm text-destructive mt-1">{errors.revenue}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="netIncome" className={errors.netIncome ? "text-destructive" : ""}>
              Net Income ($)
            </Label>
            <Input
              id="netIncome"
              type="text"
              value={metrics.netIncome || ''}
              onChange={handleInputChange('netIncome')}
              placeholder="Enter net income"
              className={errors.netIncome ? "border-destructive" : ""}
            />
            {errors.netIncome && (
              <p className="text-sm text-destructive mt-1">{errors.netIncome}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="assets" className={errors.assets ? "text-destructive" : ""}>
              Total Assets ($)
            </Label>
            <Input
              id="assets"
              type="text"
              value={metrics.assets || ''}
              onChange={handleInputChange('assets')}
              placeholder="Enter total assets"
              className={errors.assets ? "border-destructive" : ""}
            />
            {errors.assets && (
              <p className="text-sm text-destructive mt-1">{errors.assets}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="liabilities" className={errors.liabilities ? "text-destructive" : ""}>
              Total Liabilities ($)
            </Label>
            <Input
              id="liabilities"
              type="text"
              value={metrics.liabilities || ''}
              onChange={handleInputChange('liabilities')}
              placeholder="Enter total liabilities"
              className={errors.liabilities ? "border-destructive" : ""}
            />
            {errors.liabilities && (
              <p className="text-sm text-destructive mt-1">{errors.liabilities}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="cashFlow" className={errors.cashFlow ? "text-destructive" : ""}>
              Annual Cash Flow ($)
            </Label>
            <Input
              id="cashFlow"
              type="text"
              value={metrics.cashFlow || ''}
              onChange={handleInputChange('cashFlow')}
              placeholder="Enter annual cash flow"
              className={errors.cashFlow ? "border-destructive" : ""}
            />
            {errors.cashFlow && (
              <p className="text-sm text-destructive mt-1">{errors.cashFlow}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="growthRate" className={errors.growthRate ? "text-destructive" : ""}>
              Expected Growth Rate (%)
            </Label>
            <Input
              id="growthRate"
              type="text"
              value={metrics.growthRate || ''}
              onChange={handleInputChange('growthRate')}
              placeholder="Enter expected growth rate"
              className={errors.growthRate ? "border-destructive" : ""}
            />
            {errors.growthRate && (
              <p className="text-sm text-destructive mt-1">{errors.growthRate}</p>
            )}
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
