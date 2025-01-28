import {useMemo} from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportButton } from "@/components/common/ExportButton"
import { SaveLoadState } from "@/components/common/SaveLoadState"
import { validateForm, commonValidations, ValidationConfig } from "@/utils/validationUtils"
import { DataPersistence } from '@/components/common/DataPersistence'
import { useCalculatorData } from '@/hooks/useCalculatorData'

interface FinancialMetrics {
  revenue: number;
  netIncome: number;
  assets: number;
  liabilities: number;
  cashFlow: number;
  growthRate: number;
}

interface ValuationData {
  metrics: FinancialMetrics;
  activeTab: string;
  errors: { [key: string]: string };
}

export function BusinessValuationCalculator() {
  const [valuationData, setValuationData] = useCalculatorData<ValuationData>('business-valuation', {
    metrics: {
      revenue: 0,
      netIncome: 0,
      assets: 0,
      liabilities: 0,
      cashFlow: 0,
      growthRate: 0
    },
    activeTab: 'metrics',
    errors: {}
  })

  const updateMetrics = (field: keyof FinancialMetrics, value: number) => {
    setValuationData(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [field]: value
      }
    }))
  }

  const handleTabChange = (value: string) => {
    setValuationData(prev => ({
      ...prev,
      activeTab: value
    }))
  }

  const setErrors = (errors: { [key: string]: string }) => {
    setValuationData(prev => ({
      ...prev,
      errors
    }))
  }

  const validationConfig: ValidationConfig = {
    revenue: {
      validation: {
        ...commonValidations.positiveNumber.validation
      }
    },
    netIncome: {
      validation: {
        ...commonValidations.number.validation
      }
    },
    assets: {
      validation: {
        ...commonValidations.positiveNumber.validation
      }
    },
    liabilities: {
      validation: {
        ...commonValidations.positiveNumber.validation
      }
    },
    cashFlow: {
      validation: {
        ...commonValidations.number.validation
      }
    },
    growthRate: {
      validation: {
        ...commonValidations.percentageRange.validation
      }
    }
  }

  const handleInputChange = (field: keyof FinancialMetrics) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0
    updateMetrics(field, value)
    
    // Validate the field
    const fieldErrors = validateForm({ [field]: value }, { [field]: validationConfig[field] })
    setErrors({ 
      ...valuationData.errors, 
      ...Object.fromEntries(
        Object.entries(fieldErrors).map(([key, value]) => [key, value || ''])
      ) 
    })
  }

  // Calculate valuations using different methods
  const valuations = useMemo(() => {
    const { revenue, netIncome, assets, liabilities, cashFlow, growthRate } = valuationData.metrics
    
    // Asset-based valuation
    const assetBasedValue = assets - liabilities
    
    // Market multiple valuation (using revenue multiple)
    const revenueMultiple = 2.0 // Industry average multiple
    const marketValue = revenue * revenueMultiple
    
    // Earnings-based valuation (P/E method)
    const peRatio = 15 // Industry average P/E ratio
    const earningsValue = netIncome * peRatio
    
    // Discounted Cash Flow (DCF) valuation
    const discountRate = 0.10 // 10% discount rate
    const years = 5
    let dcfValue = 0
    
    for (let year = 1; year <= years; year++) {
      const projectedCashFlow = cashFlow * Math.pow(1 + growthRate / 100, year)
      dcfValue += projectedCashFlow / Math.pow(1 + discountRate, year)
    }
    
    // Terminal value
    const terminalValue = (cashFlow * Math.pow(1 + growthRate / 100, years + 1)) / (discountRate - growthRate / 100)
    dcfValue += terminalValue / Math.pow(1 + discountRate, years)
    
    return {
      assetBased: assetBasedValue,
      market: marketValue,
      earnings: earningsValue,
      dcf: dcfValue
    }
  }, [valuationData.metrics])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Valuation Calculator</h2>
        <DataPersistence
          data={valuationData}
          onDataImport={setValuationData}
          dataType="business-valuation"
        />
      </div>

      <div className="flex justify-end gap-2">
        <SaveLoadState
          calculatorType="business-valuation"
          currentState={valuationData}
          onLoadState={setValuationData}
        />
        <ExportButton
          data={{
            metrics: valuationData.metrics,
            valuations,
            summary: {
              averageValuation: (valuations.assetBased + valuations.market + valuations.earnings + valuations.dcf) / 4,
              valuationRange: {
                min: Math.min(valuations.assetBased, valuations.market, valuations.earnings, valuations.dcf),
                max: Math.max(valuations.assetBased, valuations.market, valuations.earnings, valuations.dcf)
              }
            }
          }}
          filename="business_valuation_report"
          title="Business Valuation Report"
          description="Comprehensive business valuation analysis including multiple valuation methods"
        />
      </div>

      <Card className="p-6">
        <Tabs value={valuationData.activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="metrics">Financial Metrics</TabsTrigger>
            <TabsTrigger value="results">Valuation Results</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="revenue">Annual Revenue</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={valuationData.metrics.revenue || ''}
                  onChange={handleInputChange('revenue')}
                  className={valuationData.errors.revenue ? 'border-red-500' : ''}
                />
                {valuationData.errors.revenue && (
                  <p className="text-sm text-red-500">{valuationData.errors.revenue}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="netIncome">Net Income</Label>
                <Input
                  id="netIncome"
                  type="number"
                  value={valuationData.metrics.netIncome || ''}
                  onChange={handleInputChange('netIncome')}
                  className={valuationData.errors.netIncome ? 'border-red-500' : ''}
                />
                {valuationData.errors.netIncome && (
                  <p className="text-sm text-red-500">{valuationData.errors.netIncome}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assets">Total Assets</Label>
                <Input
                  id="assets"
                  type="number"
                  value={valuationData.metrics.assets || ''}
                  onChange={handleInputChange('assets')}
                  className={valuationData.errors.assets ? 'border-red-500' : ''}
                />
                {valuationData.errors.assets && (
                  <p className="text-sm text-red-500">{valuationData.errors.assets}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="liabilities">Total Liabilities</Label>
                <Input
                  id="liabilities"
                  type="number"
                  value={valuationData.metrics.liabilities || ''}
                  onChange={handleInputChange('liabilities')}
                  className={valuationData.errors.liabilities ? 'border-red-500' : ''}
                />
                {valuationData.errors.liabilities && (
                  <p className="text-sm text-red-500">{valuationData.errors.liabilities}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cashFlow">Annual Cash Flow</Label>
                <Input
                  id="cashFlow"
                  type="number"
                  value={valuationData.metrics.cashFlow || ''}
                  onChange={handleInputChange('cashFlow')}
                  className={valuationData.errors.cashFlow ? 'border-red-500' : ''}
                />
                {valuationData.errors.cashFlow && (
                  <p className="text-sm text-red-500">{valuationData.errors.cashFlow}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="growthRate">Growth Rate (%)</Label>
                <Input
                  id="growthRate"
                  type="number"
                  value={valuationData.metrics.growthRate || ''}
                  onChange={handleInputChange('growthRate')}
                  className={valuationData.errors.growthRate ? 'border-red-500' : ''}
                />
                {valuationData.errors.growthRate && (
                  <p className="text-sm text-red-500">{valuationData.errors.growthRate}</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Asset-Based Valuation</h3>
                <p className="text-2xl">${valuations.assetBased.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Based on total assets minus liabilities</p>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-2">Market Multiple Valuation</h3>
                <p className="text-2xl">${valuations.market.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Based on revenue multiple method</p>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-2">Earnings-Based Valuation</h3>
                <p className="text-2xl">${valuations.earnings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Based on P/E ratio method</p>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-2">DCF Valuation</h3>
                <p className="text-2xl">${valuations.dcf.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Based on discounted cash flow analysis</p>
              </Card>

              <Card className="p-4 md:col-span-2">
                <h3 className="font-semibold mb-2">Average Valuation</h3>
                <p className="text-3xl">
                  ${((valuations.assetBased + valuations.market + valuations.earnings + valuations.dcf) / 4).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Valuation Range: ${Math.min(valuations.assetBased, valuations.market, valuations.earnings, valuations.dcf).toLocaleString()} - 
                  ${Math.max(valuations.assetBased, valuations.market, valuations.earnings, valuations.dcf).toLocaleString()}
                </p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
