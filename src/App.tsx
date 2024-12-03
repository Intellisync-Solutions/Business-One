import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import BusinessPlan from './pages/BusinessPlan'
import FinancialCalculators from './pages/FinancialCalculators'
import CashflowAnalysis from './pages/CashflowAnalysis'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="business-plan" element={<BusinessPlan />} />
          <Route path="financial-calculators" element={<FinancialCalculators />} />
          <Route path="cashflow-analysis" element={<CashflowAnalysis />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
