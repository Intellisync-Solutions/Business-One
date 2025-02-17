import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ChatWidget from './components/ChatWidget'

import BusinessPlan from './pages/BusinessPlan'

import StartupCostEstimator from './pages/calculators/StartupCostEstimator'
import BreakEvenAnalysis from './pages/calculators/BreakEvenAnalysis'
import ScenarioPlanner from './pages/calculators/ScenarioPlanner'
import PricingStrategy from './pages/calculators/PricingStrategy'
import FinancialRatios from './pages/calculators/financial-ratios'
import BusinessValuation from './pages/calculators/BusinessValuation'
import LandingPage from './pages'
import PrivacyPolicy from './pages/policies/PrivacyPolicy'
import TermsOfService from './pages/policies/TermsOfService'
import CookiesPolicy from './pages/policies/CookiesPolicy'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
         
          <Route path="/business-plan" element={<BusinessPlan />} />
          <Route path="/calculators/startup-cost-estimator" element={<StartupCostEstimator />} />
          <Route path="/calculators/break-even-analysis" element={<BreakEvenAnalysis />} />
          <Route path="/calculators/scenario-planner" element={<ScenarioPlanner />} />
          <Route path="/calculators/pricing-strategy" element={<PricingStrategy />} />
          <Route path="/calculators/financial-ratios" element={<FinancialRatios />} />
          <Route path="/calculators/business-valuation" element={<BusinessValuation />} />
          <Route path="/policies/privacy" element={<PrivacyPolicy />} />
          <Route path="/policies/terms" element={<TermsOfService />} />
          <Route path="/policies/cookies" element={<CookiesPolicy />} />
        </Route>
      </Routes>
      <Toaster />
      <ChatWidget />
    </div>
  )
}

export default App
