export interface ProductSales {
  unitsSold: number;
  pricePerUnit: number;
  productionCostPerUnit: number;
  seasonality: Record<string, number>; // Monthly factors (e.g., { "January": 1.2, "February": 0.8 })
}

export interface ServiceIncome {
  serviceType: string;
  rateOrPrice: number;
  expectedVolumePerMonth: number;
}

export interface SubscriptionRevenue {
  pricingTier: string;
  monthlyFee: number;
  subscribers: number;
  churnRate: number;
}

export interface LicensingRoyalties {
  agreementName: string;
  royaltyRate: number;
  expectedVolume: number;
}

export interface OtherRevenue {
  affiliateIncome: number;
  advertisingRevenue: number;
  grantsAndDonations: number;
}

export interface CustomExpense {
  name: string;
  amount: number;
  description?: string;
}

export interface FixedExpenses {
  rent: number;
  salaries: number;
  insurance: number;
  utilities: number;
  softwareSubscriptions: number;
  custom: CustomExpense[];
}

export interface VariableExpenses {
  cogs: number;
  marketing: number;
  salesCommissions: number;
  supplies: number;
  custom: CustomExpense[];
}

export interface OneTimeExpenses {
  startupCosts: number;
  capitalExpenditures: number;
  legalAndLicensing: number;
  custom: CustomExpense[];
}

export interface FinancialObligations {
  loanRepayments: number;
  interestPayments: number;
  taxes: number;
  custom: CustomExpense[];
}

export interface GrowthParameters {
  revenueGrowthRate: number;
  expenseGrowthRate: number;
  accountsReceivableDays: number;
  accountsPayableDays: number;
  corporateTaxRate: number;
  revenueGrowthModel: "linear" | "exponential" | "seasonal";
  expenseGrowthModel: "linear" | "exponential" | "fixed";
  inventoryTurnoverDays?: number;
}

export interface CashFlowData {
  productSales: ProductSales[];
  serviceIncome: ServiceIncome[];
  subscriptionRevenue: SubscriptionRevenue[];
  licensingRoyalties: LicensingRoyalties[];
  otherRevenue: OtherRevenue;
  fixedExpenses: FixedExpenses;
  variableExpenses: VariableExpenses;
  oneTimeExpenses: OneTimeExpenses;
  financialObligations: FinancialObligations;
  growthParameters: GrowthParameters;
}

export interface CashFlowProjection {
  month: string;
  revenue: number;
  expenses: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  
  // Added properties for financial ratios
  currentAssets: number;
  currentLiabilities: number;
  inventory: number;
  costOfGoodsSold: number;
  totalExpenses: number;
  totalAssets: number;
  shareholderEquity: number;
  beginningInventory: number;
  endingInventory: number;
  beginningReceivables: number;
  endingReceivables: number;
  totalLiabilities: number;
  ebit: number;
  interestExpense: number;
  operatingCashFlow: number;
  ebitda: number;
  stockPrice: number;
  netIncome: number;
  outstandingShares: number;
  operatingIncome: number;
}
