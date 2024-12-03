import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import {
  Calculator,
  LineChart,
  Target,
  PiggyBank,
  BarChart4,
  Building
} from "lucide-react"

export default function Calculators() {
  const navigate = useNavigate()

  const calculators = [
    {
      title: "Break-Even Analysis",
      description: "Calculate your break-even point and analyze different pricing scenarios",
      icon: Calculator,
      href: "/calculators/break-even-analysis"
    },
    {
      title: "Startup Cost Estimator",
      description: "Calculate initial costs, funding requirements, and startup runway",
      icon: PiggyBank,
      href: "/calculators/startup-cost-estimator"
    },
    {
      title: "Scenario Planner",
      description: "Model different business scenarios and analyze potential outcomes",
      icon: Target,
      href: "/calculators/scenario-planner"
    },
    {
      title: "Pricing Strategy",
      description: "Develop optimal pricing strategies and analyze market positioning",
      icon: LineChart,
      href: "/calculators/pricing-strategy"
    },
    {
      title: "Business Valuation",
      description: "Calculate your business value using various valuation methods",
      icon: Building,
      href: "/calculators/business-valuation"
    },
    {
      title: "Market Performance",
      description: "Analyze and visualize market performance metrics and trends",
      icon: BarChart4,
      href: "/calculators/market-performance"
    }
  ]

  return (
    <div className="container mx-auto py-6">
      <h1>Financial Calculators</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {calculators.map((calculator) => (
          <Card 
            key={calculator.href}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(calculator.href)}
          >
            <div className="flex items-center gap-4 mb-4">
              <calculator.icon className="h-8 w-8 text-primary" />
              <h2 className="text-xl font-bold">{calculator.title}</h2>
            </div>
            <p className="text-muted-foreground">{calculator.description}</p>
            <Button className="mt-4 w-full">
              Launch Calculator
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
