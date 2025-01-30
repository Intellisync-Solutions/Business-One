import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface CostBreakdown {
  fixed: number;
  variable: number;
  total: number;
}

interface CostTotals {
  oneTime: CostBreakdown;
  monthly: CostBreakdown;
  inventory: CostBreakdown;
}

interface FinancialMetrics {
  totalStartupCost: number;
  monthlyOperatingCost: number;
  recommendedCashReserve: number;
  totalInitialCapital: number;
}

interface StartupCostAnalysisProps {
  costs: CostTotals;
  metrics: FinancialMetrics;
}

const generateAnalysisPrompt = (costs: CostTotals, metrics: FinancialMetrics) => {
  return `As a financial advisor, analyze the following startup cost breakdown and provide strategic insights:

COST BREAKDOWN:
One-Time Costs:
- Fixed: $${costs.oneTime.fixed.toLocaleString()}
- Variable: $${costs.oneTime.variable.toLocaleString()}
- Total: $${costs.oneTime.total.toLocaleString()}

Monthly Operating Costs:
- Fixed: $${costs.monthly.fixed.toLocaleString()}
- Variable: $${costs.monthly.variable.toLocaleString()}
- Total: $${costs.monthly.total.toLocaleString()}

Inventory Costs:
- Fixed: $${costs.inventory.fixed.toLocaleString()}
- Variable: $${costs.inventory.variable.toLocaleString()}
- Total: $${costs.inventory.total.toLocaleString()}

Key Metrics:
- Total Startup Cost: $${metrics.totalStartupCost.toLocaleString()}
- Monthly Operating Cost: $${metrics.monthlyOperatingCost.toLocaleString()}
- Recommended Cash Reserve (6 months): $${metrics.recommendedCashReserve.toLocaleString()}
- Total Initial Capital Required: $${metrics.totalInitialCapital.toLocaleString()}

Please provide a concise analysis that includes:
1. Cost Structure Assessment:
   - Evaluate the balance between fixed and variable costs
   - Identify potential risks or advantages in the current cost structure
   
2. Financial Health Indicators:
   - Analyze the sustainability of monthly operating costs
   - Assess the adequacy of the cash reserve
   
3. Strategic Recommendations:
   - Suggest areas for potential cost optimization
   - Identify key financial considerations for success
   
4. Industry Context:
   - Compare these metrics to typical startup benchmarks
   - Highlight any unusual patterns or concerns

Please provide actionable insights that can help in decision-making.`
}

export function StartupCostAnalysis({ costs, metrics }: StartupCostAnalysisProps) {
  const [analysis, setAnalysis] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const generateAnalysis = async () => {
    setLoading(true)
    setError('')
    setAnalysis('')
    
    try {
      const response = await fetch('/.netlify/functions/analyze-startup-costs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ costs, metrics }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate analysis')
      }

      setAnalysis(data.analysis)
    } catch (error) {
      console.error('Error generating analysis:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate analysis. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">AI Financial Analysis</h3>
          <Button 
            onClick={generateAnalysis} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Analyzing...' : 'Generate Analysis'}
          </Button>
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        
        {analysis && (
          <div className="prose prose-sm max-w-none mt-4">
            {analysis.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-2">{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
