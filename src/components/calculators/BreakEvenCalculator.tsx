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
  const [data, setData] = useState<BreakEvenData>({
    fixedCosts: 0,
    variableCostPerUnit: 0,
    sellingPricePerUnit: 0,
    targetUnits: 0,
    targetProfit: 0,
    targetProfitPercentage: 0,
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
    } = data
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
      const totalRevenue = units * (data.sellingPricePerUnit || (result.requiredPrice || 0))
      const totalCosts = data.fixedCosts + (units * data.variableCostPerUnit)
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
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleModeChange = (mode: CalculationMode) => {
    setData(prev => ({ ...prev, mode }))
  }

  const enhancedChartData = breakEvenPoints.map(point => ({
    name: `Units: ${point.units}`,
    'Total Revenue': point.revenue,
    'Total Cost': point.costs,
    'Profit/Loss': point.revenue - point.costs
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <SaveLoadState
          calculatorType="break-even"
          currentState={{
            fixedCosts: data.fixedCosts,
            variableCosts: data.variableCostPerUnit,
            sellingPrice: data.sellingPricePerUnit,
            targetUnits: data.targetUnits,
            targetProfit: data.targetProfit,
            targetProfitPercentage: data.targetProfitPercentage,
            profitInputMode: data.profitInputMode,
            mode: data.mode
          }}
          onLoadState={(state) => {
            setData(prev => ({ ...prev, 
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
                value={data.fixedCosts || ''}
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
                value={data.variableCostPerUnit || ''}
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
                value={data.sellingPricePerUnit || ''}
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
              <Select value={data.mode} onValueChange={handleModeChange}>
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

            {data.mode === 'findPrice' && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="targetUnits">Target Units</Label>
                </div>
                <Input
                  id="targetUnits"
                  type="number"
                  value={data.targetUnits || ''}
                  onChange={handleInputChange('targetUnits')}
                  placeholder="Enter target units"
                />
              </div>
            )}

            {data.mode === 'profitTarget' && (
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
                    value={data.profitInputMode} 
                    onValueChange={(value: 'fixed' | 'percentage') => 
                      setData(prev => ({ ...prev, profitInputMode: value }))
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

                {data.profitInputMode === 'fixed' ? (
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
                      value={data.targetProfit || ''}
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
                      value={data.targetProfitPercentage || ''}
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
                  <h3 className="font-semibold text-lg mb-2">Results</h3>
                  {result.breakEvenUnits && (
                    <p>Break-Even Units: {Math.ceil(result.breakEvenUnits)} units</p>
                  )}
                  {result.breakEvenPrice && (
                    <p>Break-Even Price: ${result.breakEvenPrice.toFixed(2)}</p>
                  )}
                  {result.totalRevenueAtBreakEven && (
                    <p>Total Revenue at Break-Even: ${result.totalRevenueAtBreakEven.toFixed(2)}</p>
                  )}
                  {result.contributionMargin && (
                    <p>Contribution Margin per Unit: ${result.contributionMargin.toFixed(2)}</p>
                  )}
                  {result.profitMargin && (
                    <p>Profit Margin: {result.profitMargin.toFixed(2)}%</p>
                  )}
                  {result.requiredPrice && (
                    <p>Required Price: ${result.requiredPrice.toFixed(2)}</p>
                  )}
                  {result.targetProfitAmount && (
                    <p>Target Profit Amount: ${result.targetProfitAmount.toFixed(2)}</p>
                  )}
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
