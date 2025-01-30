import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { CostTotals, FinancialMetrics } from '@/utils/analysisPrompts'

interface StartupCostAnalysisProps {
  costs: CostTotals;
  metrics: FinancialMetrics;
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
