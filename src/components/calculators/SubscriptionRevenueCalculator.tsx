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
  monthlyPlatformCosts: number
  monthlyPerClientCosts: number
  initialCustomerBase: number
  monthlyGrowthRate: number
}

interface RevenueProjection {
  month: number
  customers: number
  newCustomers: number
  potentialNewCustomers: number
  monthlyRevenue: number
  cumulativeRevenue: number
  operatingCosts: number
  acquisitionCosts: number
  netProfit: number
  cumulativeProfit: number
}

export function SubscriptionRevenueCalculator() {
  const [metrics, setMetrics] = useState<SubscriptionMetrics>({
    monthlySubscriptionPrice: 0,
    customerAcquisitionCost: 0,
    customerRetentionRate: 0,
    monthlyPlatformCosts: 0,
    monthlyPerClientCosts: 0,
    initialCustomerBase: 0,
    monthlyGrowthRate: 0
  })

  const projectedRevenue = useMemo(() => {
    const projections: RevenueProjection[] = []
    let totalCustomers = metrics.initialCustomerBase
    let cumulativeRevenue = 0
    let cumulativeProfit = 0

    for (let month = 1; month <= 12; month++) {
      // Calculate new customers using current total as base:
      // currentTotalClients * monthlyGrowthRate * customerRetention = newClients
      const growthContribution = Math.round(
        totalCustomers * 
        (metrics.monthlyGrowthRate / 100) * 
        (metrics.customerRetentionRate / 100)
      )
      
      // Calculate acquisition cost for potential new customers before retention
      const potentialNewCustomers = Math.round(totalCustomers * (metrics.monthlyGrowthRate / 100))
      const acquisitionCosts = metrics.customerAcquisitionCost * potentialNewCustomers
      
      // Add new retained customers to total
      totalCustomers = totalCustomers + growthContribution
      
      // Example with:
      // - 10 initial clients
      // - 5% monthly growth
      // - 90% retention
      // Month 1:
      // - Potential new: 10 * 5% = 0.5 ≈ 1 (for acquisition cost)
      // - Growth contribution: 10 * 5% * 90% = 0.45 ≈ 0
      // - Total: 10 + 0 = 10
      // Month 2:
      // - Base is now 10
      // - Potential new: 10 * 5% = 0.5 ≈ 1 (for acquisition cost)
      // - Growth contribution: 10 * 5% * 90% = 0.45 ≈ 0
      // - Total: 10 + 0 = 10
      
      // Calculate revenue and costs:
      // totalClientsByMonth * monthlySubscription - customerAcquisitionCost - monthlyPlatformCost - monthlyCostPerClient = netProfit
      
      // Monthly revenue from total customers
      const monthlyRevenue = totalCustomers * metrics.monthlySubscriptionPrice
      
      // Calculate platform and per-client costs
      const platformCosts = metrics.monthlyPlatformCosts
      const perClientCosts = totalCustomers * metrics.monthlyPerClientCosts
      
      // Calculate net profit following the exact formula
      const monthlyNetProfit = monthlyRevenue - acquisitionCosts - platformCosts - perClientCosts
      
      // Update cumulative totals
      cumulativeRevenue += monthlyRevenue
      cumulativeProfit += monthlyNetProfit
      
      // Store this month's projections
      projections.push({
        month,
        customers: totalCustomers,
        newCustomers: growthContribution,
        potentialNewCustomers: potentialNewCustomers,
        monthlyRevenue: Math.round(monthlyRevenue),
        cumulativeRevenue: Math.round(cumulativeRevenue),
        operatingCosts: Math.round(platformCosts + perClientCosts),
        acquisitionCosts: Math.round(acquisitionCosts),
        netProfit: Math.round(monthlyNetProfit),
        cumulativeProfit: Math.round(cumulativeProfit)
      })
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
            value={(metrics.customerRetentionRate) || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0
              setMetrics(prev => ({ ...prev, customerRetentionRate: value }))
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
            <Label htmlFor="monthlyPlatformCosts">Monthly Platform Costs ($)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Fixed monthly costs to maintain the platform (servers, infrastructure, etc.)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="monthlyPlatformCosts"
            type="number"
            value={metrics.monthlyPlatformCosts || ''}
            onChange={handleInputChange('monthlyPlatformCosts')}
            placeholder="Enter platform costs"
          />
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="monthlyPerClientCosts">Monthly Cost Per Client ($)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Variable costs per client per month (support, resources, etc.)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="monthlyPerClientCosts"
            type="number"
            value={metrics.monthlyPerClientCosts || ''}
            onChange={handleInputChange('monthlyPerClientCosts')}
            placeholder="Enter per-client costs"
          />
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="monthlyGrowthRate">Monthly Growth Rate (%)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Expected monthly customer growth rate as a percentage
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="monthlyGrowthRate"
            type="number"
            min="0"
            max="100"
            value={metrics.monthlyGrowthRate || ''}
            onChange={handleInputChange('monthlyGrowthRate')}
            placeholder="Enter growth rate"
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
              customerRetentionRate: 0,
              monthlyPlatformCosts: 0,
              monthlyPerClientCosts: 0,
              initialCustomerBase: 0,
              monthlyGrowthRate: 0
            })
          }}
        >
          Reset Calculation
        </Button>
        <Button 
          onClick={() => {
            // Export projection as CSV
            const csvContent = [
              "Month,Total Customers,New Customers,Potential New Customers,Monthly Revenue,Operating Costs,Acquisition Costs,Net Profit,Cumulative Profit",
              ...projectedRevenue.map(proj => 
                `${proj.month},${proj.customers},${proj.newCustomers},${proj.potentialNewCustomers},${proj.monthlyRevenue},${proj.operatingCosts},${proj.acquisitionCosts},${proj.netProfit},${proj.cumulativeProfit}`
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
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              label={{ 
                value: 'Months', 
                position: 'insideBottom', 
                offset: 1,
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
              formatter={(value: number, name: string) => {
                // Format customer numbers without currency
                if (name === 'Total Customers' || name === 'New Customers' || name === 'Potential New Customers') {
                  return [`${value.toLocaleString()} customers`, name]
                }
                
                // Format monetary values with currency and 2 decimal places
                if (name === 'Monthly Revenue' || name === 'Monthly Net Profit' || name === 'Cumulative Profit' || 
                    name === 'Operating Costs' || name === 'Acquisition Costs') {
                  return [`$${value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}`, name]
                }
                
                return [value.toLocaleString(), name]
              }}
              labelFormatter={(label) => `Month ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="customers" 
              stroke="#4B5563" 
              name="Total Customers"
            />
            <Line 
              type="monotone" 
              dataKey="newCustomers" 
              stroke="#9CA3AF" 
              name="New Customers"
            />
            <Line 
              type="monotone" 
              dataKey="potentialNewCustomers" 
              stroke="#F7DC6F" 
              name="Potential New Customers"
            />
            <Line 
              type="monotone" 
              dataKey="monthlyRevenue" 
              stroke="#8884d8" 
              name="Monthly Revenue"
            />
            <Line 
              type="monotone" 
              dataKey="netProfit" 
              stroke="#82ca9d" 
              name="Monthly Net Profit"
            />
            <Line 
              type="monotone" 
              dataKey="cumulativeProfit" 
              stroke="#ffc658" 
              name="Cumulative Profit"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Month</th>
              <th className="p-2 text-right">Total Customers</th>
              <th className="p-2 text-right">New Customers</th>
              <th className="p-2 text-right">Potential New Customers</th>
              <th className="p-2 text-right">Monthly Revenue</th>
              <th className="p-2 text-right">Operating Costs</th>
              <th className="p-2 text-right">Acquisition Costs</th>
              <th className="p-2 text-right">Net Profit</th>
              <th className="p-2 text-right">Cumulative Profit</th>
            </tr>
          </thead>
          <tbody>
            {projectedRevenue.map((proj) => (
              <tr key={proj.month} className="border-b">
                <td className="p-2">{proj.month}</td>
                <td className="p-2 text-right">{proj.customers.toLocaleString()}</td>
                <td className="p-2 text-right">{proj.newCustomers.toLocaleString()}</td>
                <td className="p-2 text-right">{proj.potentialNewCustomers.toLocaleString()}</td>
                <td className="p-2 text-right">${proj.monthlyRevenue.toLocaleString()}</td>
                <td className="p-2 text-right">${proj.operatingCosts.toLocaleString()}</td>
                <td className="p-2 text-right">${proj.acquisitionCosts.toLocaleString()}</td>
                <td className="p-2 text-right">${proj.netProfit.toLocaleString()}</td>
                <td className="p-2 text-right">${proj.cumulativeProfit.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default SubscriptionRevenueCalculator
