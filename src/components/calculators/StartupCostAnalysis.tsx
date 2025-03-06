import { useState} from 'react'
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

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

export function StartupCostAnalysis({ costs, metrics }: StartupCostAnalysisProps) {
  const [analysis, setAnalysis] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const generateAnalysis = async () => {
    // Validate input data
    if (!costs || !metrics) {
      setError('Missing costs or metrics');
      toast({
        title: "Analysis Error",
        description: "Please complete the startup cost calculator first.",
        variant: "destructive"
      });
      return;
    }

    // Reset previous states
    setError('')
    setAnalysis('')
    setIsLoading(true)

    try {
      const response = await fetch('/.netlify/functions/analyze-startup-costs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ costs, metrics }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (!data.analysis) {
        throw new Error('No analysis returned from the server');
      }

      setAnalysis(data.analysis);
      
      toast({
        title: "Analysis Generated",
        description: "Your startup cost analysis is ready.",
        variant: "default"
      });

    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to generate analysis. Please try again.';
      
      setError(errorMessage);
      
      toast({
        title: "Analysis Generation Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">AI Financial Analysis</h3>
          <Button 
            onClick={generateAnalysis} 
            disabled={!costs || !metrics || isLoading}
            className="ml-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Analysis'
            )}
          </Button>
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            {error}
          </div>
        )}

        {analysis && (
          <div className="bg-muted/50 p-4 rounded-md">
            <p>{analysis}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
