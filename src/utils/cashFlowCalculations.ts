import type { 
  CashFlowData, 
  CashFlowProjection,
  ProductSales,
  ServiceIncome,
  SubscriptionRevenue,
  LicensingRoyalties
} from '@/types/cashflow'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function calculateMonthlyProductRevenue(
  products: ProductSales[],
  month: string,
  monthIndex: number,
  growthRate: number
): number {
  return products.reduce((total, product) => {
    const seasonalFactor = product.seasonality[month] || 1
    const monthlyGrowth = Math.pow(1 + growthRate, monthIndex / 12)
    return total + (
      product.unitsSold * 
      product.pricePerUnit * 
      seasonalFactor * 
      monthlyGrowth
    )
  }, 0)
}

export function calculateMonthlyServiceRevenue(
  services: ServiceIncome[],
  monthIndex: number,
  growthRate: number
): number {
  return services.reduce((total, service) => {
    const monthlyGrowth = Math.pow(1 + growthRate, monthIndex / 12)
    return total + (
      service.rateOrPrice * 
      service.expectedVolumePerMonth * 
      monthlyGrowth
    )
  }, 0)
}

export function calculateMonthlySubscriptionRevenue(
  subscriptions: SubscriptionRevenue[],
  monthIndex: number,
  growthRate: number
): number {
  return subscriptions.reduce((total, subscription) => {
    const retentionRate = Math.pow(1 - subscription.churnRate, monthIndex)
    const monthlyGrowth = Math.pow(1 + growthRate, monthIndex / 12)
    return total + (
      subscription.monthlyFee * 
      subscription.subscribers * 
      retentionRate * 
      monthlyGrowth
    )
  }, 0)
}

export function calculateMonthlyLicensingRevenue(
  licensing: LicensingRoyalties[],
  monthIndex: number,
  growthRate: number
): number {
  return licensing.reduce((total, license) => {
    const monthlyGrowth = Math.pow(1 + growthRate, monthIndex / 12)
    return total + (
      license.royaltyRate * 
      license.expectedVolume * 
      monthlyGrowth
    )
  }, 0)
}

export function calculateMonthlyOtherRevenue(
  otherRevenue: { 
    affiliateIncome: number; 
    advertisingRevenue: number; 
    grantsAndDonations: number 
  },
  monthIndex: number,
  growthRate: number
): number {
  const monthlyGrowth = Math.pow(1 + growthRate, monthIndex / 12)
  return (
    otherRevenue.affiliateIncome + 
    otherRevenue.advertisingRevenue + 
    otherRevenue.grantsAndDonations
  ) * monthlyGrowth
}

export function calculateMonthlyExpenses(
  data: CashFlowData,
  monthIndex: number
): number {
  const { 
    fixedExpenses, 
    variableExpenses, 
    financialObligations,
    oneTimeExpenses,
    growthParameters 
  } = data

  // Calculate monthly growth factor
  const monthlyGrowth = Math.pow(
    1 + growthParameters.expenseGrowthRate, 
    monthIndex / 12
  )

  // Fixed expenses with growth
  const monthlyFixedExpenses = (
    fixedExpenses.rent +
    fixedExpenses.salaries +
    fixedExpenses.insurance +
    fixedExpenses.utilities +
    fixedExpenses.softwareSubscriptions
  ) * monthlyGrowth

  // Variable expenses with growth
  const monthlyVariableExpenses = (
    variableExpenses.cogs +
    variableExpenses.marketing +
    variableExpenses.salesCommissions +
    variableExpenses.supplies
  ) * monthlyGrowth

  // Financial obligations with growth
  const monthlyObligations = (
    financialObligations.loanRepayments +
    financialObligations.interestPayments +
    financialObligations.taxes
  ) * monthlyGrowth

  // One-time expenses (only in first month)
  const monthlyOneTimeExpenses = monthIndex === 0 ? (
    oneTimeExpenses.startupCosts +
    oneTimeExpenses.capitalExpenditures +
    oneTimeExpenses.legalAndLicensing
  ) : 0

  return (
    monthlyFixedExpenses +
    monthlyVariableExpenses +
    monthlyObligations +
    monthlyOneTimeExpenses
  )
}

export function generateCashFlowProjections(
  data: CashFlowData
): CashFlowProjection[] {
  const projections: CashFlowProjection[] = []
  let cumulativeCashFlow = 0
  const numberOfMonths = 60 // 5 years of projections

  // Generate projections for 5 years
  for (let yearIndex = 0; yearIndex < numberOfMonths / 12; yearIndex++) {
    MONTHS.forEach((month, monthIndex) => {
      const overallMonthIndex = yearIndex * 12 + monthIndex

      // Stop if we've reached the total number of months
      if (overallMonthIndex >= numberOfMonths) return

      // Calculate total revenue for the month
      const productRevenue = calculateMonthlyProductRevenue(
        data.productSales,
        month,
        overallMonthIndex,
        data.growthParameters.revenueGrowthRate
      )
      
      const serviceRevenue = calculateMonthlyServiceRevenue(
        data.serviceIncome,
        overallMonthIndex,
        data.growthParameters.revenueGrowthRate
      )
      
      const subscriptionRevenue = calculateMonthlySubscriptionRevenue(
        data.subscriptionRevenue,
        overallMonthIndex,
        data.growthParameters.revenueGrowthRate
      )
      
      const licensingRevenue = calculateMonthlyLicensingRevenue(
        data.licensingRoyalties,
        overallMonthIndex,
        data.growthParameters.revenueGrowthRate
      )
      
      const otherRevenue = calculateMonthlyOtherRevenue(
        data.otherRevenue,
        overallMonthIndex,
        data.growthParameters.revenueGrowthRate
      )

      const totalRevenue = 
        productRevenue + 
        serviceRevenue + 
        subscriptionRevenue + 
        licensingRevenue + 
        otherRevenue

      // Calculate total expenses for the month
      const totalExpenses = calculateMonthlyExpenses(data, overallMonthIndex)

      // Calculate net cash flow
      const netCashFlow = totalRevenue - totalExpenses
      cumulativeCashFlow += netCashFlow

      // Format the month with year
      const monthLabel = `${month} ${yearIndex + 1}`

      projections.push({
        month: monthLabel,
        revenue: totalRevenue,
        expenses: totalExpenses,
        netCashFlow,
        cumulativeCashFlow,
        currentAssets: 0,
        currentLiabilities: 0,
        inventory: 0,
        costOfGoodsSold: 0,
        totalExpenses: totalExpenses,
        totalAssets: 0,
        shareholderEquity: 0,
        beginningInventory: 0,
        endingInventory: 0,
        beginningReceivables: 0,
        endingReceivables: 0,
        totalLiabilities: 0,
        ebit: 0,
        interestExpense: 0,
        operatingCashFlow: netCashFlow,
        ebitda: 0,
        stockPrice: 0,
        netIncome: netCashFlow,
        outstandingShares: 0,
        operatingIncome: 0
      })
    })
  }

  return projections
}

export function calculateFinancialMetrics(projections: CashFlowProjection[]) {
  const totalRevenue = projections.reduce((sum, p) => sum + p.revenue, 0)
  const totalExpenses = projections.reduce((sum, p) => sum + p.expenses, 0)
  const netCashFlow = totalRevenue - totalExpenses
  const averageMonthlyRevenue = totalRevenue / projections.length
  const averageMonthlyExpenses = totalExpenses / projections.length
  const revenueToExpenseRatio = totalRevenue / totalExpenses
  const cashFlowMargin = (netCashFlow / totalRevenue) * 100

  return {
    totalRevenue,
    totalExpenses,
    netCashFlow,
    averageMonthlyRevenue,
    averageMonthlyExpenses,
    revenueToExpenseRatio,
    cashFlowMargin
  }
}
