import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ExportButton } from "@/components/common/ExportButton"
import { SaveLoadState } from "@/components/common/SaveLoadState"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataPersistence } from '@/components/common/DataPersistence'
import { useLocalStorage } from '@/hooks/useLocalStorage'

type CalculationMode = 'standard' | 'findPrice' | 'findUnits' | 'profitTarget'

interface BreakEvenData {
  fixedCosts: number
  variableCostPerUnit: number
  sellingPricePerUnit: number
  targetUnits?: number
  targetProfit?: number
  targetProfitPercentage?: number
  profitInputMode: 'fixed' | 'percentage'
  mode: CalculationMode
}

interface CalculationResult {
  breakEvenUnits?: number
  breakEvenPrice?: number
  totalRevenueAtBreakEven?: number
  contributionMargin?: number
  profitMargin?: number
  requiredPrice?: number
  targetProfitAmount?: number
}

export function BreakEvenCalculator() {
  const [breakEvenData, setBreakEvenData] = useLocalStorage<BreakEvenData>('break-even-analysis', {
    fixedCosts: 0,
    variableCostPerUnit: 0,
    sellingPricePerUnit: 0,
    profitInputMode: 'fixed',
    mode: 'standard'
  })

  const [result, setResult] = useState<CalculationResult | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [breakEvenPoints, setBreakEvenPoints] = useState<any[]>([])

  const calculateBreakEven = () => {
    const { 
      fixedCosts, 
      variableCostPerUnit, 
      sellingPricePerUnit, 
      targetUnits, 
      targetProfit, 
      targetProfitPercentage,
      profitInputMode,
      mode 
    } = breakEvenData
    let result: CalculationResult = {}

    switch (mode) {
      case 'standard':
        if (sellingPricePerUnit <= variableCostPerUnit) {
          alert("Selling price must be greater than variable cost per unit")
          return
        }
        const contributionMargin = sellingPricePerUnit - variableCostPerUnit
        const breakEvenUnits = fixedCosts / contributionMargin
        result = {
          breakEvenUnits,
          totalRevenueAtBreakEven: breakEvenUnits * sellingPricePerUnit,
          contributionMargin
        }
        break

      case 'findPrice':
        if (!targetUnits || targetUnits <= 0) {
          alert("Please enter target units")
          return
        }
        const requiredPrice = (fixedCosts / targetUnits) + variableCostPerUnit
        result = {
          requiredPrice,
          breakEvenUnits: targetUnits,
          contributionMargin: requiredPrice - variableCostPerUnit
        }
        break

      case 'findUnits':
        if (sellingPricePerUnit <= variableCostPerUnit) {
          alert("Selling price must be greater than variable cost per unit")
          return
        }
        const margin = sellingPricePerUnit - variableCostPerUnit
        const units = fixedCosts / margin
        result = {
          breakEvenUnits: units,
          contributionMargin: margin,
          totalRevenueAtBreakEven: units * sellingPricePerUnit
        }
        break

      case 'profitTarget':
        if (profitInputMode === 'fixed') {
          if (!targetProfit || targetProfit < 0) {
            alert("Please enter target profit")
            return
          }
        } else {
          if (!targetProfitPercentage || targetProfitPercentage < 0 || targetProfitPercentage > 100) {
            alert("Please enter a valid profit percentage (0-100)")
            return
          }
        }
        
        if (sellingPricePerUnit <= variableCostPerUnit) {
          alert("Selling price must be greater than variable cost per unit")
          return
        }

        const profitMargin = sellingPricePerUnit - variableCostPerUnit
        let targetProfitAmount: number

        if (profitInputMode === 'percentage') {
          const profitPercent = targetProfitPercentage! / 100
          targetProfitAmount = (fixedCosts / (1 - profitPercent)) - fixedCosts
        } else {
          targetProfitAmount = targetProfit!
        }

        const unitsForProfit = (fixedCosts + targetProfitAmount) / profitMargin
        const totalRevenue = unitsForProfit * sellingPricePerUnit
        const actualProfitPercentage = (targetProfitAmount / totalRevenue) * 100

        result = {
          breakEvenUnits: unitsForProfit,
          contributionMargin: profitMargin,
          totalRevenueAtBreakEven: totalRevenue,
          profitMargin: actualProfitPercentage,
          targetProfitAmount: targetProfitAmount
        }
        break;
    }

    setResult(result)
    generateChartData(result)
  }

  const generateChartData = (result: CalculationResult) => {
    const chartPoints = []
    const maxUnits = result.breakEvenUnits ? Math.ceil(result.breakEvenUnits * 2) : 0
    
    for (let units = 0; units <= maxUnits; units += Math.ceil(maxUnits / 10)) {
      const totalRevenue = units * (breakEvenData.sellingPricePerUnit || (result.requiredPrice || 0))
      const totalCosts = breakEvenData.fixedCosts + (units * breakEvenData.variableCostPerUnit)
      const profit = totalRevenue - totalCosts
      
      chartPoints.push({
        units,
        revenue: totalRevenue,
        costs: totalCosts,
        profit
      })
    }
    
    setChartData(chartPoints)
    setBreakEvenPoints(chartPoints)
  }

  const handleInputChange = (field: keyof BreakEvenData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value) || 0
    setBreakEvenData(prev => ({ ...prev, [field]: value }))
  }

  const handleModeChange = (mode: CalculationMode) => {
    setBreakEvenData(prev => ({ ...prev, mode }))
  }

  const enhancedChartData = breakEvenPoints.map(point => ({
    name: `Units: ${point.units}`,
    'Total Revenue': point.revenue,
    'Total Cost': point.costs,
    'Profit/Loss': point.revenue - point.costs
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Break-Even Calculator</h2>
        <DataPersistence
          data={breakEvenData}
          onDataImport={setBreakEvenData}
          dataType="break-even-analysis"
        />
      </div>
      <div className="flex justify-end gap-2">
        <SaveLoadState
          calculatorType="break-even"
          currentState={{
            fixedCosts: breakEvenData.fixedCosts,
            variableCosts: breakEvenData.variableCostPerUnit,
            sellingPrice: breakEvenData.sellingPricePerUnit,
            targetUnits: breakEvenData.targetUnits,
            targetProfit: breakEvenData.targetProfit,
            targetProfitPercentage: breakEvenData.targetProfitPercentage,
            profitInputMode: breakEvenData.profitInputMode,
            mode: breakEvenData.mode
          }}
          onLoadState={(state) => {
            setBreakEvenData(prev => ({ ...prev, 
              fixedCosts: state.fixedCosts,
              variableCostPerUnit: state.variableCosts,
              sellingPricePerUnit: state.sellingPrice,
              targetUnits: state.targetUnits,
              targetProfit: state.targetProfit,
              targetProfitPercentage: state.targetProfitPercentage,
              profitInputMode: state.profitInputMode,
              mode: state.mode
            }))
          }}
        />
        <ExportButton
          data={breakEvenPoints}
          filename="break-even-analysis"
          title="Break-Even Analysis"
          description="Analysis of costs, revenue, and break-even points"
          chartType="line"
          chartData={enhancedChartData}
        />
      </div>
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="fixedCosts">Fixed Costs</Label>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Fixed costs are expenses that remain constant regardless of production volume.<br/>Examples: rent, salaries, insurance, etc.</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <Input
                id="fixedCosts"
                type="number"
                value={breakEvenData.fixedCosts || ''}
                onChange={handleInputChange('fixedCosts')}
                placeholder="Enter total fixed costs"
              />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="variableCost">Variable Cost per Unit</Label>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Variable costs change with production volume.<br/>Examples: raw materials, direct labor, packaging.</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <Input
                id="variableCost"
                type="number"
                value={breakEvenData.variableCostPerUnit || ''}
                onChange={handleInputChange('variableCostPerUnit')}
                placeholder="Enter variable cost per unit"
              />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="sellingPrice">Selling Price per Unit</Label>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The price at which each unit is sold to customers.<br/>Should be higher than variable cost per unit.</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <Input
                id="sellingPrice"
                type="number"
                value={breakEvenData.sellingPricePerUnit || ''}
                onChange={handleInputChange('sellingPricePerUnit')}
                placeholder="Enter selling price per unit"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="mode">Calculation Mode</Label>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p className="font-semibold">Choose your calculation mode:</p>
                      <ul className="list-disc pl-4 mt-2 space-y-2">
                        <li><span className="font-medium">Standard Analysis:</span> Calculate break-even point when you know all costs and selling price</li>
                        <li><span className="font-medium">Find Selling Price:</span> Calculate minimum selling price needed for a target number of units</li>
                        <li><span className="font-medium">Find Break-Even Units:</span> Calculate units needed to break even at a specific price point</li>
                        <li><span className="font-medium">Target Profit:</span> Calculate units needed to achieve a specific profit goal</li>
                      </ul>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <Select value={breakEvenData.mode} onValueChange={handleModeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Break-Even Analysis</SelectItem>
                  <SelectItem value="findPrice">Find Selling Price</SelectItem>
                  <SelectItem value="findUnits">Find Break-Even Units</SelectItem>
                  <SelectItem value="profitTarget">Find Units for Target Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {breakEvenData.mode === 'findPrice' && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="targetUnits">Target Units</Label>
                </div>
                <Input
                  id="targetUnits"
                  type="number"
                  value={breakEvenData.targetUnits || ''}
                  onChange={handleInputChange('targetUnits')}
                  placeholder="Enter target units"
                />
              </div>
            )}

            {breakEvenData.mode === 'profitTarget' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label htmlFor="profitInputMode">Profit Target Type</Label>
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Choose how to specify your profit target:<br/>
                          - Fixed Amount: Set a specific dollar amount as target<br/>
                          - Percentage: Set a target profit margin percentage</p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </div>
                  <Select 
                    value={breakEvenData.profitInputMode} 
                    onValueChange={(value: 'fixed' | 'percentage') => 
                      setBreakEvenData(prev => ({ ...prev, profitInputMode: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {breakEvenData.profitInputMode === 'fixed' ? (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor="targetProfit">Target Profit Amount</Label>
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enter your desired profit amount in dollars</p>
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="targetProfit"
                      type="number"
                      value={breakEvenData.targetProfit || ''}
                      onChange={handleInputChange('targetProfit')}
                      placeholder="Enter target profit amount"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor="targetProfitPercentage">Target Profit Percentage</Label>
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enter your desired profit margin as a percentage (0-100)<br/>
                            Example: 60 for a 60% profit margin</p>
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="targetProfitPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={breakEvenData.targetProfitPercentage || ''}
                      onChange={handleInputChange('targetProfitPercentage')}
                      placeholder="Enter target profit percentage"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="pt-4">
              <Button onClick={calculateBreakEven} className="w-full">Calculate</Button>
              <div className="mt-2 text-sm text-muted-foreground">
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      <span>What is Break-Even Analysis?</span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Break-even analysis helps you determine the point where total revenue equals total costs (fixed + variable).<br/><br/>
                      At this point, there is no profit or loss. Any sales above this point generate profit, while sales below result in a loss.<br/><br/>
                      Formula: Break-Even Units = Fixed Costs ÷ (Selling Price - Variable Cost per Unit)</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {result && (
              <>
                <div className="p-4 bg-secondary rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Results</h3>
                  <div className="space-y-3">
                    {result.breakEvenUnits && (
                      <div>
                        <span className="text-sm font-medium">Break-Even Units</span>
                        <div className="text-lg font-bold">{Math.ceil(result.breakEvenUnits).toLocaleString()} units</div>
                      </div>
                    )}
                    {result.breakEvenPrice && (
                      <div>
                        <span className="text-sm font-medium">Break-Even Price</span>
                        <div className="text-lg font-bold">${result.breakEvenPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    )}
                    {result.totalRevenueAtBreakEven && (
                      <div>
                        <span className="text-sm font-medium">Total Revenue at Break-Even</span>
                        <div className="text-lg font-bold">${result.totalRevenueAtBreakEven.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    )}
                    {result.contributionMargin && (
                      <div>
                        <span className="text-sm font-medium">Contribution Margin per Unit</span>
                        <div className="text-lg font-bold">${result.contributionMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    )}
                    {result.profitMargin && (
                      <div>
                        <span className="text-sm font-medium">Profit Margin</span>
                        <div className="text-lg font-bold">{result.profitMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</div>
                      </div>
                    )}
                    {result.requiredPrice && (
                      <div>
                        <span className="text-sm font-medium">Required Price</span>
                        <div className="text-lg font-bold">${result.requiredPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    )}
                    {result.targetProfitAmount && (
                      <div>
                        <span className="text-sm font-medium">Target Profit Amount</span>
                        <div className="text-lg font-bold">${result.targetProfitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {chartData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Break-Even Chart</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="units" 
                  label={{ value: 'Units', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis 
                  label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  name="Total Revenue" 
                />
                <Line 
                  type="monotone" 
                  dataKey="costs" 
                  stroke="#ef4444" 
                  name="Total Costs" 
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3b82f6" 
                  name="Profit/Loss" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  )
}
