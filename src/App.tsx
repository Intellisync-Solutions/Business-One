import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import BusinessPlan from './pages/BusinessPlan'
import FinancialCalculators from './pages/calculators'
import CashflowAnalysis from './pages/calculators/cashflow-analysis'
import StartupCostEstimator from './pages/calculators/StartupCostEstimator'
import BreakEvenAnalysis from './pages/calculators/BreakEvenAnalysis'
import ScenarioPlanner from './pages/calculators/ScenarioPlanner'
import PricingStrategy from './pages/calculators/PricingStrategy'
import FinancialRatios from './pages/calculators/financial-ratios'
import BusinessValuation from './pages/calculators/BusinessValuation'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="business-plan" element={<BusinessPlan />} />
          <Route path="financial-calculators" element={<FinancialCalculators />} />
          <Route path="calculators/cashflow-analysis" element={<CashflowAnalysis />} />
          <Route path="calculators/startup-cost-estimator" element={<StartupCostEstimator />} />
          <Route path="calculators/break-even-analysis" element={<BreakEvenAnalysis />} />
          <Route path="calculators/scenario-planner" element={<ScenarioPlanner />} />
          <Route path="calculators/pricing-strategy" element={<PricingStrategy />} />
          <Route path="calculators/financial-ratios" element={<FinancialRatios />} />
          <Route path="calculators/business-valuation" element={<BusinessValuation />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
