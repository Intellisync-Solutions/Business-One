import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface BreakEvenData {
  fixedCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  mode: 'standard' | 'findPrice' | 'findUnits' | 'profitTarget';
  targetUnits?: number;
  targetProfit?: number;
  targetProfitPercentage?: number;
  profitInputMode?: 'fixed' | 'percentage';
}

interface BreakEvenResult {
  breakEvenUnits?: number;
  breakEvenPrice?: number;
  totalRevenueAtBreakEven?: number;
  contributionMargin?: number;
  profitMargin?: number;
  requiredPrice?: number;
  targetProfitAmount?: number;
}

interface BreakEvenAnalysisProps {
  breakEvenData: BreakEvenData;
  breakEvenResult: BreakEvenResult;
}

export function BreakEvenAnalysis({ breakEvenData, breakEvenResult }: BreakEvenAnalysisProps) {
  const [analysis, setAnalysis] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const generateAnalysis = async () => {
    setLoading(true)
    setError('')
    setAnalysis('')
    
    try {
      const response = await fetch('/.netlify/functions/analyze-break-even', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ breakEvenData, breakEvenResult }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate analysis')
      }

      setAnalysis(data.analysis)
    } catch (error) {
      console.error('Error generating break-even analysis:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate analysis. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">AI Break-Even Analysis</h3>
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
