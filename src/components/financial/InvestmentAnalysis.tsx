import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AIGeneratedContent } from "@/components/common/AIGeneratedContent";

interface InvestmentData {
  projectName: string;
  initialInvestment: number;
  projectedCashFlows: number[];
  discountRate: number;
  projectLifespan: number;
  alternativeInvestmentReturn: number;
}

interface InvestmentAnalysisProps {
  onSave?: (data: InvestmentData) => void;
}

export function InvestmentAnalysis({ onSave }: InvestmentAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ analysis: string; recommendations: string } | null>(null);
  
  const [formData, setFormData] = useState<InvestmentData>({
    projectName: '',
    initialInvestment: 0,
    projectedCashFlows: [0, 0, 0, 0, 0],
    discountRate: 10,
    projectLifespan: 5,
    alternativeInvestmentReturn: 5
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('cashFlow')) {
      const index = parseInt(name.replace('cashFlow', ''));
      const newCashFlows = [...formData.projectedCashFlows];
      newCashFlows[index] = parseFloat(value) || 0;
      
      setFormData(prev => ({
        ...prev,
        projectedCashFlows: newCashFlows
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'projectName' ? value : parseFloat(value) || 0
      }));
    }
  };

  const handleLifespanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLifespan = parseInt(e.target.value) || 5;
    const constrainedLifespan = Math.min(Math.max(newLifespan, 1), 20); // Limit between 1 and 20 years
    
    // Adjust cash flows array to match new lifespan
    let newCashFlows = [...formData.projectedCashFlows];
    if (constrainedLifespan > formData.projectedCashFlows.length) {
      // Add more years with 0 cash flow
      newCashFlows = [
        ...newCashFlows,
        ...Array(constrainedLifespan - formData.projectedCashFlows.length).fill(0)
      ];
    } else if (constrainedLifespan < formData.projectedCashFlows.length) {
      // Truncate to fewer years
      newCashFlows = newCashFlows.slice(0, constrainedLifespan);
    }
    
    setFormData(prev => ({
      ...prev,
      projectLifespan: constrainedLifespan,
      projectedCashFlows: newCashFlows
    }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    // Validate inputs
    if (!formData.projectName) {
      setError("Please enter a project name.");
      setLoading(false);
      return;
    }
    
    if (formData.initialInvestment <= 0) {
      setError("Initial investment must be greater than zero.");
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/.netlify/functions/analyze-investment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setAnalysisResult(data);
      
      // Save the data if onSave is provided
      if (onSave) {
        onSave(formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    
    const content = `# Investment Analysis for ${formData.projectName}\n\n## Analysis\n${analysisResult.analysis}\n\n## Recommendations\n${analysisResult.recommendations}`;
    
    navigator.clipboard.writeText(content)
      .then(() => {
        console.log('Content copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy content: ', err);
      });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !analysisResult) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Investment Analysis - ${formData.projectName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2563eb; }
          h2 { color: #4b5563; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
          .section { margin-bottom: 30px; }
          .footer { margin-top: 40px; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Investment Analysis - ${formData.projectName}</h1>
        <div class="section">
          <h2>Analysis</h2>
          ${analysisResult.analysis.replace(/\n/g, '<br>')}
        </div>
        <div class="section">
          <h2>Recommendations</h2>
          ${analysisResult.recommendations.replace(/\n/g, '<br>')}
        </div>
        <div class="footer">
          Generated by Intellisync Business Suite on ${new Date().toLocaleDateString()}
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const resetForm = () => {
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {!analysisResult ? (
        <Card>
          <CardHeader>
            <CardTitle>Investment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project/Investment Name</Label>
                  <Input
                    id="projectName"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    placeholder="Enter project name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initialInvestment">Initial Investment ($)</Label>
                  <Input
                    id="initialInvestment"
                    name="initialInvestment"
                    type="number"
                    value={formData.initialInvestment || ''}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectLifespan">Project Lifespan (years)</Label>
                  <Input
                    id="projectLifespan"
                    name="projectLifespan"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.projectLifespan || ''}
                    onChange={handleLifespanChange}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountRate">Discount Rate (%)</Label>
                  <Input
                    id="discountRate"
                    name="discountRate"
                    type="number"
                    value={formData.discountRate || ''}
                    onChange={handleInputChange}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alternativeInvestmentReturn">Alternative Investment Return (%)</Label>
                  <Input
                    id="alternativeInvestmentReturn"
                    name="alternativeInvestmentReturn"
                    type="number"
                    value={formData.alternativeInvestmentReturn || ''}
                    onChange={handleInputChange}
                    placeholder="5"
                  />
                </div>
              </div>
              
              <Separator className="my-4" />
              <h3 className="text-md font-medium">Projected Cash Flows</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {formData.projectedCashFlows.map((cashFlow, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`cashFlow${index}`}>Year {index + 1} ($)</Label>
                    <Input
                      id={`cashFlow${index}`}
                      name={`cashFlow${index}`}
                      type="number"
                      value={cashFlow || ''}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              
              <Button 
                type="button"
                onClick={handleAnalyze} 
                disabled={loading}
                className="w-full mt-4"
              >
                {loading ? "Analyzing..." : "Generate Investment Analysis"}
              </Button>
              
              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <AIGeneratedContent
            title={`Investment Analysis - ${formData.projectName}`}
            description={`Initial Investment: $${formData.initialInvestment.toLocaleString()}`}
            analysis={analysisResult.analysis}
            recommendations={analysisResult.recommendations}
            loading={loading}
            error={error || undefined}
            onCopy={handleCopy}
            onPrint={handlePrint}
          />
          
          <Button 
            variant="outline" 
            onClick={resetForm}
            className="mt-4"
          >
            Start New Analysis
          </Button>
        </>
      )}
    </div>
  );
}
