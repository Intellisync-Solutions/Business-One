import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { CashFlowData } from '@/types/cashflow'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line
} from 'recharts'
import { formatCurrency } from '@/utils/currency'
import { generateCashFlowProjections } from '@/utils/cashFlowCalculations'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from 'react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const RATIO_COLORS = {
  liquidity: {
    currentRatio: '#8884d8',
    quickRatio: '#82ca9d',
    workingCapital: '#ffc658'
  },
  profitability: {
    grossProfitMargin: '#8884d8',
    netProfitMargin: '#82ca9d',
    roa: '#ffc658',
    roe: '#ff7300'
  },
  efficiency: {
    inventoryTurnover: '#8884d8',
    receivableTurnover: '#82ca9d'
  },
  leverage: {
    debtToEquity: '#8884d8',
    interestCoverage: '#82ca9d'
  },
  cashflow: {
    operatingCashFlow: '#8884d8',
    ebitdaMargin: '#82ca9d'
  },
  marketValue: {
    priceEarnings: '#8884d8',
    priceToBook: '#82ca9d'
  },
  operating: {
    operatingMargin: '#8884d8',
    assetUtilization: '#82ca9d'
  }
}

const Dashboard = () => {
  const [cashFlowData] = useLocalStorage<CashFlowData | null>('cashFlowData', null)
  const [selectedPeriod, setSelectedPeriod] = useState('1')
  const [selectedRatioCategory, setSelectedRatioCategory] = useState('liquidity')
  const projections = cashFlowData ? generateCashFlowProjections(cashFlowData) : []

  // Calculate total revenue breakdown
  const revenueBreakdown = cashFlowData ? [
    {
      name: 'Product Sales',
      value: cashFlowData.productSales.reduce((acc, item) => 
        acc + (item.unitsSold * item.pricePerUnit), 0)
    },
    {
      name: 'Services',
      value: cashFlowData.serviceIncome.reduce((acc, item) => 
        acc + (item.rateOrPrice * item.expectedVolumePerMonth), 0)
    },
    {
      name: 'Subscriptions',
      value: cashFlowData.subscriptionRevenue.reduce((acc, item) => 
        acc + (item.monthlyFee * item.subscribers), 0)
    },
    {
      name: 'Licensing',
      value: cashFlowData.licensingRoyalties.reduce((acc, item) => 
        acc + (item.royaltyRate * item.expectedVolume), 0)
    },
    {
      name: 'Other Revenue',
      value: Object.values(cashFlowData.otherRevenue).reduce((a, b) => a + b, 0)
    }
  ] : []

  // Calculate expense breakdown
  const expenseBreakdown = cashFlowData ? [
    {
      name: 'Fixed Expenses',
      value: Object.values(cashFlowData.fixedExpenses).reduce((a, b) => 
        typeof b === 'number' ? a + b : a, 0)
    },
    {
      name: 'Variable Expenses',
      value: Object.values(cashFlowData.variableExpenses).reduce((a, b) => 
        typeof b === 'number' ? a + b : a, 0)
    },
    {
      name: 'One-time Expenses',
      value: Object.values(cashFlowData.oneTimeExpenses).reduce((a, b) => 
        typeof b === 'number' ? a + b : a, 0)
    },
    {
      name: 'Financial Obligations',
      value: Object.values(cashFlowData.financialObligations).reduce((a, b) => 
        typeof b === 'number' ? a + b : a, 0)
    }
  ] : []

  // Calculate ratios for each month
  const ratioData = projections.slice(0, parseInt(selectedPeriod) * 12).map((projection, index) => {
    const month = `Month ${index + 1}`
    const data: any = { month }

    // Liquidity Ratios
    data.currentRatio = projection.currentAssets / projection.currentLiabilities
    data.quickRatio = (projection.currentAssets - projection.inventory) / projection.currentLiabilities
    data.workingCapital = projection.currentAssets - projection.currentLiabilities

    // Profitability Ratios
    data.grossProfitMargin = ((projection.revenue - projection.costOfGoodsSold) / projection.revenue) * 100
    data.netProfitMargin = ((projection.revenue - projection.totalExpenses) / projection.revenue) * 100
    data.roa = ((projection.revenue - projection.totalExpenses) / projection.totalAssets) * 100
    data.roe = ((projection.revenue - projection.totalExpenses) / projection.shareholderEquity) * 100

    // Efficiency Ratios
    data.inventoryTurnover = projection.costOfGoodsSold / ((projection.beginningInventory + projection.endingInventory) / 2)
    data.receivableTurnover = projection.revenue / ((projection.beginningReceivables + projection.endingReceivables) / 2)

    // Leverage Ratios
    data.debtToEquity = projection.totalLiabilities / projection.shareholderEquity
    data.interestCoverage = projection.ebit / projection.interestExpense

    // Cash Flow Ratios
    data.operatingCashFlow = projection.operatingCashFlow / projection.currentLiabilities
    data.ebitdaMargin = (projection.ebitda / projection.revenue) * 100

    // Market Value Ratios
    data.priceEarnings = projection.stockPrice / (projection.netIncome / projection.outstandingShares)
    data.priceToBook = projection.stockPrice / (projection.shareholderEquity / projection.outstandingShares)

    // Operating Performance Ratios
    data.operatingMargin = (projection.operatingIncome / projection.revenue) * 100
    data.assetUtilization = projection.revenue / projection.totalAssets

    return data
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-6"
    >
      <h1 className="text-3xl font-bold">Financial Dashboard</h1>

      {!cashFlowData ? (
        <div className="text-center py-10">
          <h2 className="text-xl text-gray-600">No financial data available</h2>
          <p className="text-gray-500 mt-2">Please add data in the Cash Flow Analysis section</p>
        </div>
      ) : (
        <>
          {/* Cash Flow Projections Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cash Flow Projections</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1"
                    stroke="#0088FE" 
                    fill="#0088FE" 
                    fillOpacity={0.6}
                    name="Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stackId="2"
                    stroke="#FF8042" 
                    fill="#FF8042" 
                    fillOpacity={0.6}
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Revenue Breakdown</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Expense Breakdown */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Expense Breakdown</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" fill="#8884d8">
                      {expenseBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Key Metrics */}
            <Card className="p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Key Financial Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm text-blue-600 font-medium">Total Revenue (Monthly)</h3>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(revenueBreakdown.reduce((acc, item) => acc + item.value, 0))}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="text-sm text-red-600 font-medium">Total Expenses (Monthly)</h3>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(expenseBreakdown.reduce((acc, item) => acc + item.value, 0))}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm text-green-600 font-medium">Net Cash Flow (Monthly)</h3>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(
                      revenueBreakdown.reduce((acc, item) => acc + item.value, 0) -
                      expenseBreakdown.reduce((acc, item) => acc + item.value, 0)
                    )}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="text-sm text-purple-600 font-medium">Growth Rate</h3>
                  <p className="text-2xl font-bold mt-2">
                    {cashFlowData.growthParameters.revenueGrowthRate}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Ratio Trends Section */}
          <div className="mt-8">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Financial Ratio Trends</h2>
                <div className="flex gap-4">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Year</SelectItem>
                      <SelectItem value="2">2 Years</SelectItem>
                      <SelectItem value="3">3 Years</SelectItem>
                      <SelectItem value="4">4 Years</SelectItem>
                      <SelectItem value="5">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                  <Tabs value={selectedRatioCategory} onValueChange={setSelectedRatioCategory}>
                    <TabsList>
                      <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
                      <TabsTrigger value="profitability">Profitability</TabsTrigger>
                      <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
                      <TabsTrigger value="leverage">Leverage</TabsTrigger>
                      <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                      <TabsTrigger value="marketValue">Market Value</TabsTrigger>
                      <TabsTrigger value="operating">Operating</TabsTrigger>
                    </TabsList>
                    <TabsContent value="liquidity">
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={ratioData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Object.entries(RATIO_COLORS.liquidity).map(([key, color]) => (
                              <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                stroke={color}
                                activeDot={{ r: 8 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    <TabsContent value="profitability">
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={ratioData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Object.entries(RATIO_COLORS.profitability).map(([key, color]) => (
                              <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                stroke={color}
                                activeDot={{ r: 8 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    <TabsContent value="efficiency">
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={ratioData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Object.entries(RATIO_COLORS.efficiency).map(([key, color]) => (
                              <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                stroke={color}
                                activeDot={{ r: 8 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    <TabsContent value="leverage">
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={ratioData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Object.entries(RATIO_COLORS.leverage).map(([key, color]) => (
                              <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                stroke={color}
                                activeDot={{ r: 8 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    <TabsContent value="cashflow">
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={ratioData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Object.entries(RATIO_COLORS.cashflow).map(([key, color]) => (
                              <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                stroke={color}
                                activeDot={{ r: 8 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    <TabsContent value="marketValue">
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={ratioData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Object.entries(RATIO_COLORS.marketValue).map(([key, color]) => (
                              <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                stroke={color}
                                activeDot={{ r: 8 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    <TabsContent value="operating">
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={ratioData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Object.entries(RATIO_COLORS.operating).map(([key, color]) => (
                              <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                stroke={color}
                                activeDot={{ r: 8 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </motion.div>
  )
}

export default Dashboard
