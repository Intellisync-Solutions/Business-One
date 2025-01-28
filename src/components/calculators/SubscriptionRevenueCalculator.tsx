import React, { useState, useMemo } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  Legend 
} from 'recharts'

interface SubscriptionMetrics {
  monthlySubscriptionPrice: number
  customerAcquisitionCost: number
  customerRetentionRate: number
  monthlyOperatingCosts: number
  initialCustomerBase: number
}

interface RevenueProjection {
  month: number
  customers: number
  monthlyRevenue: number
  cumulativeRevenue: number
  netProfit: number
}

export function SubscriptionRevenueCalculator() {
  const [metrics, setMetrics] = useState<SubscriptionMetrics>({
    monthlySubscriptionPrice: 0,
    customerAcquisitionCost: 0,
    customerRetentionRate: 0.9, // Default 90% retention
    monthlyOperatingCosts: 0,
    initialCustomerBase: 0
  })

  const projectedRevenue = useMemo(() => {
    const projections: RevenueProjection[] = []
    let currentCustomers = metrics.initialCustomerBase
    let cumulativeRevenue = 0

    for (let month = 1; month <= 12; month++) {
      const monthlyRevenue = currentCustomers * metrics.monthlySubscriptionPrice
      const customerAcquisitionExpense = metrics.customerAcquisitionCost * (currentCustomers * 0.2) // Assuming 20% new customer growth
      const netProfit = monthlyRevenue - customerAcquisitionExpense - metrics.monthlyOperatingCosts

      cumulativeRevenue += monthlyRevenue
      
      projections.push({
        month,
        customers: Math.round(currentCustomers),
        monthlyRevenue: Math.round(monthlyRevenue),
        cumulativeRevenue: Math.round(cumulativeRevenue),
        netProfit: Math.round(netProfit)
      })

      // Calculate next month's customers with retention and growth
      currentCustomers = currentCustomers * metrics.customerRetentionRate + (currentCustomers * 0.2)
    }

    return projections
  }, [metrics])

  const handleInputChange = (field: keyof SubscriptionMetrics) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0
    setMetrics(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-xl font-semibold mb-4">Subscription Revenue Projection</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="monthlySubscriptionPrice">Monthly Subscription Price ($)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  The recurring monthly fee charged to each subscriber
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="monthlySubscriptionPrice"
            type="number"
            value={metrics.monthlySubscriptionPrice || ''}
            onChange={handleInputChange('monthlySubscriptionPrice')}
            placeholder="Enter monthly price"
          />
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="initialCustomerBase">Initial Customer Base</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Number of subscribers at the start of your projection
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="initialCustomerBase"
            type="number"
            value={metrics.initialCustomerBase || ''}
            onChange={handleInputChange('initialCustomerBase')}
            placeholder="Enter initial customers"
          />
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="customerRetentionRate">Customer Retention Rate (%)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Percentage of customers who continue their subscription each month
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="customerRetentionRate"
            type="number"
            min="0"
            max="100"
            value={(metrics.customerRetentionRate * 100) || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0
              setMetrics(prev => ({ ...prev, customerRetentionRate: value / 100 }))
            }}
            placeholder="Enter retention rate"
          />
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="customerAcquisitionCost">Customer Acquisition Cost ($)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Average cost to acquire a new customer (marketing, sales, etc.)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="customerAcquisitionCost"
            type="number"
            value={metrics.customerAcquisitionCost || ''}
            onChange={handleInputChange('customerAcquisitionCost')}
            placeholder="Enter acquisition cost"
          />
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="monthlyOperatingCosts">Monthly Operating Costs ($)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Recurring monthly expenses to maintain the service
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="monthlyOperatingCosts"
            type="number"
            value={metrics.monthlyOperatingCosts || ''}
            onChange={handleInputChange('monthlyOperatingCosts')}
            placeholder="Enter monthly costs"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button 
          variant="outline"
          onClick={() => {
            // Reset to default values
            setMetrics({
              monthlySubscriptionPrice: 0,
              customerAcquisitionCost: 0,
              customerRetentionRate: 0.9,
              monthlyOperatingCosts: 0,
              initialCustomerBase: 0
            })
          }}
        >
          Reset Calculation
        </Button>
        <Button 
          onClick={() => {
            // Export projection as CSV
            const csvContent = [
              "Month,Customers,Monthly Revenue,Cumulative Revenue,Net Profit",
              ...projectedRevenue.map(proj => 
                `${proj.month},${proj.customers},${proj.monthlyRevenue},${proj.cumulativeRevenue},${proj.netProfit}`
              )
            ].join("\n")

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement("a")
            const url = URL.createObjectURL(blob)
            link.setAttribute("href", url)
            link.setAttribute("download", "subscription_revenue_projection.csv")
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }}
        >
          Export Projection
        </Button>
      </div>

      <div className="mt-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart 
            data={projectedRevenue}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }} // Increased bottom margin
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              label={{ 
                value: 'Months', 
                position: 'insideBottom', 
                offset: 1, // Increased offset
                fontWeight: 'bold' 
              }} 
            />
            <YAxis 
              label={{ 
                value: 'Amount ($)', 
                angle: -90, 
                position: 'insideLeft', 
                offset: 0,
                fontWeight: 'bold' 
              }} 
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <ChartTooltip 
              formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
              labelFormatter={(label) => `Month ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="monthlyRevenue" 
              stroke="#8884d8" 
              name="Monthly Revenue" 
            />
            <Line 
              type="monotone" 
              dataKey="cumulativeRevenue" 
              stroke="#82ca9d" 
              name="Cumulative Revenue" 
            />
            <Line 
              type="monotone" 
              dataKey="netProfit" 
              stroke="#ffc658" 
              name="Net Profit" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Month</th>
              <th className="p-2 text-right">Customers</th>
              <th className="p-2 text-right">Monthly Revenue</th>
              <th className="p-2 text-right">Cumulative Revenue</th>
              <th className="p-2 text-right">Net Profit</th>
            </tr>
          </thead>
          <tbody>
            {projectedRevenue.map((projection) => (
              <tr key={projection.month} className="border-b">
                <td className="p-2">{projection.month}</td>
                <td className="p-2 text-right">{projection.customers.toLocaleString()}</td>
                <td className="p-2 text-right">${projection.monthlyRevenue.toLocaleString()}</td>
                <td className="p-2 text-right">${projection.cumulativeRevenue.toLocaleString()}</td>
                <td className="p-2 text-right">${projection.netProfit.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default SubscriptionRevenueCalculator
