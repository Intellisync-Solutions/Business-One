import { useState} from 'react'
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

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
  
  // Debug log props on component mount
  console.log('StartupCostAnalysis mounted with props:', { 
    costs: costs ? 'defined' : 'undefined', 
    metrics: metrics ? 'defined' : 'undefined',
    costsDetail: costs,
    metricsDetail: metrics
  })

  const generateAnalysis = async () => {
    // Debug logging
    console.log('Generate Analysis clicked');
    console.log('Costs data:', JSON.stringify(costs, null, 2));
    console.log('Metrics data:', JSON.stringify(metrics, null, 2));
    
    // Always proceed with analysis attempt, even if props appear undefined
    // This helps us debug what's happening
    setError('')
    setAnalysis('')
    setIsLoading(true)
    
    // Create default values if needed
    const costData = costs || {
      oneTime: { fixed: 0, variable: 0, total: 0 },
      monthly: { fixed: 0, variable: 0, total: 0 },
      inventory: { fixed: 0, variable: 0, total: 0 }
    };
    
    const metricData = metrics || {
      totalStartupCost: 0,
      monthlyOperatingCost: 0,
      recommendedCashReserve: 0,
      totalInitialCapital: 0
    };

    // States already reset above

    try {
      console.log('Sending request to analyze-startup-costs function');
      // In development, always use the absolute URL with port 9000
      // In production, use the relative path
      const functionUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:9000/.netlify/functions/analyze-startup-costs'
        : '/.netlify/functions/analyze-startup-costs';
      
      console.log('Function URL:', functionUrl);
      console.log('Sending data:', { costData, metricData });
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          costs: costData, 
          metrics: metricData 
        }),
      });
      
      console.log('Response status:', response.status);

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
      console.error('Error generating analysis:', error);
      
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
    <Card className="p-6 relative">
      {/* Generate Analysis Button */}
      <div className="absolute top-0 right-0 left-0 z-50">
        <Button 
          onClick={() => {
            console.log('Button clicked');
            if (!isLoading) {
              generateAnalysis();
            }
          }}
          disabled={isLoading}
          className="w-full rounded-b-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Intellisync Analysis...
            </>
          ) : (
            'Intellisync Analysis'
          )}
        </Button>
      </div>

      <div className="space-y-4 pt-12">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h3 className="text-xl font-semibold">AI Financial Analysis</h3>
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            {error}
          </div>
        )}

        {analysis && (
          <div className="bg-muted/50 p-4 rounded-md analysis-content">
            <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br/>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        )}
      </div>
    </Card>
  );
}
