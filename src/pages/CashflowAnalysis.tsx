import { motion } from 'framer-motion'
import CashFlowAnalyzer from '@/components/financial/CashFlowAnalyzer'
import { useState } from 'react'
import type { CashFlowData } from '@/types/cashflow'

const defaultCashFlowData: CashFlowData = {
  productSales: [],
  serviceIncome: [],
  subscriptionRevenue: [],
  licensingRoyalties: [],
  otherRevenue: {
    affiliateIncome: 0,
    advertisingRevenue: 0,
    grantsAndDonations: 0
  },
  fixedExpenses: {
    rent: 0,
    salaries: 0,
    insurance: 0,
    utilities: 0,
    softwareSubscriptions: 0,
    custom: []
  },
  variableExpenses: {
    cogs: 0,
    marketing: 0,
    salesCommissions: 0,
    supplies: 0,
    custom: []
  },
  oneTimeExpenses: {
    startupCosts: 0,
    capitalExpenditures: 0,
    legalAndLicensing: 0,
    custom: []
  },
  financialObligations: {
    loanRepayments: 0,
    interestPayments: 0,
    taxes: 0,
    custom: []
  },
  growthParameters: {
    revenueGrowthRate: 0,
    expenseGrowthRate: 0,
    accountsReceivableDays: 30,
    accountsPayableDays: 30,
    corporateTaxRate: 0.21, // Default corporate tax rate (can be adjusted)
    revenueGrowthModel: "linear", // Default growth model
    expenseGrowthModel: "linear" // Default growth model
  }
}

const CashflowAnalysis = () => {
  const [cashflowData, setCashflowData] = useState<CashFlowData>(defaultCashFlowData)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8"
    >
      <h1 className="text-3xl font-bold mb-6">Cashflow Analysis</h1>
      <CashFlowAnalyzer 
        data={cashflowData} 
        onDataChange={setCashflowData} 
      />
    </motion.div>
  )
}

export default CashflowAnalysis
