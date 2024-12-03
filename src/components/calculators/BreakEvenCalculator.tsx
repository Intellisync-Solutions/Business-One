import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ExportButton } from "@/components/common/ExportButton"
import { SaveLoadState } from "@/components/common/SaveLoadState"

interface BreakEvenData {
  fixedCosts: number
  variableCostPerUnit: number
  sellingPricePerUnit: number
  units: number
}

export function BreakEvenCalculator() {
  const [data, setData] = useState<BreakEvenData>({
    fixedCosts: 0,
    variableCostPerUnit: 0,
    sellingPricePerUnit: 0,
    units: 0
  })

  const [breakEvenPoint, setBreakEvenPoint] = useState<number | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [breakEvenPoints, setBreakEvenPoints] = useState<any[]>([])

  const calculateBreakEven = () => {
    const { fixedCosts, variableCostPerUnit, sellingPricePerUnit } = data
    const contributionMargin = sellingPricePerUnit - variableCostPerUnit
    
    if (contributionMargin <= 0) {
      alert("Price per unit must be greater than variable cost per unit")
      return
    }

    const breakEvenUnits = fixedCosts / contributionMargin
    setBreakEvenPoint(breakEvenUnits)

    // Generate chart data
    const chartPoints = []
    const maxUnits = Math.ceil(breakEvenUnits * 2)
    
    for (let units = 0; units <= maxUnits; units += Math.ceil(maxUnits / 10)) {
      const totalRevenue = units * sellingPricePerUnit
      const totalCosts = fixedCosts + (units * variableCostPerUnit)
      const profit = totalRevenue - totalCosts
      
      chartPoints.push({
        units,
        revenue: totalRevenue,
        costs: totalCosts,
        profit
      })
    }
    
    setChartData(chartPoints)
    setBreakEvenPoints(chartPoints.map(point => ({
      units: point.units,
      revenue: point.revenue,
      totalCost: point.costs,
      profit: point.profit
    })))
  }

  const handleInputChange = (field: keyof BreakEvenData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value) || 0
    setData(prev => ({ ...prev, [field]: value }))
  }

  const calculateResults = () => {
    const { fixedCosts, variableCostPerUnit, sellingPricePerUnit } = data
    const contributionMargin = sellingPricePerUnit - variableCostPerUnit
    const breakEvenUnits = fixedCosts / contributionMargin
    const totalRevenueAtBreakEven = breakEvenUnits * sellingPricePerUnit

    return {
      breakEvenUnits,
      totalRevenueAtBreakEven,
      contributionMargin
    }
  }

  const enhancedChartData = breakEvenPoints.map(point => ({
    name: `Units: ${point.units}`,
    'Total Revenue': point.revenue,
    'Total Cost': point.totalCost,
    'Profit/Loss': point.revenue - point.totalCost
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
            breakEvenPoints
          }}
          onLoadState={(state) => {
            setData(prev => ({ ...prev, 
              fixedCosts: state.fixedCosts,
              variableCostPerUnit: state.variableCosts,
              sellingPricePerUnit: state.sellingPrice
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
              <Label htmlFor="fixedCosts">Fixed Costs</Label>
              <Input
                id="fixedCosts"
                type="number"
                value={data.fixedCosts || ''}
                onChange={handleInputChange('fixedCosts')}
                placeholder="Enter total fixed costs"
              />
            </div>
            
            <div>
              <Label htmlFor="variableCost">Variable Cost per Unit</Label>
              <Input
                id="variableCost"
                type="number"
                value={data.variableCostPerUnit || ''}
                onChange={handleInputChange('variableCostPerUnit')}
                placeholder="Enter variable cost per unit"
              />
            </div>
            
            <div>
              <Label htmlFor="sellingPrice">Selling Price per Unit</Label>
              <Input
                id="sellingPrice"
                type="number"
                value={data.sellingPricePerUnit || ''}
                onChange={handleInputChange('sellingPricePerUnit')}
                placeholder="Enter selling price per unit"
              />
            </div>
            
            <Button 
              onClick={calculateBreakEven}
              className="w-full"
            >
              Calculate Break-Even Point
            </Button>
          </div>

          <div className="space-y-4">
            {breakEvenPoint !== null && (
              <>
                <div className="p-4 bg-secondary rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Break-Even Analysis Results</h3>
                  <p>Break-Even Point: {Math.ceil(breakEvenPoint)} units</p>
                  <p>Total Revenue at Break-Even: ${(breakEvenPoint * data.sellingPricePerUnit).toFixed(2)}</p>
                  <p>Contribution Margin per Unit: ${(data.sellingPricePerUnit - data.variableCostPerUnit).toFixed(2)}</p>
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
