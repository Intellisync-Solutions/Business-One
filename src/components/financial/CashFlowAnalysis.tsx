import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AIGeneratedContent } from "@/components/common/AIGeneratedContent";

interface CashFlowData {
  companyName: string;
  period: string;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  beginningCashBalance: number;
  endingCashBalance: number;
  capitalExpenditures: number;
  dividendsPaid: number;
}

interface CashFlowAnalysisProps {
  onSave?: (data: CashFlowData) => void;
}

export function CashFlowAnalysis({ onSave }: CashFlowAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ analysis: string; recommendations: string } | null>(null);
  
  const [formData, setFormData] = useState<CashFlowData>({
    companyName: '',
    period: '',
    operatingCashFlow: 0,
    investingCashFlow: 0,
    financingCashFlow: 0,
    beginningCashBalance: 0,
    endingCashBalance: 0,
    capitalExpenditures: 0,
    dividendsPaid: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'companyName' || name === 'period' ? value : parseFloat(value) || 0
    }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    // Validate inputs
    if (!formData.companyName || !formData.period) {
      setError("Please enter company name and reporting period.");
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/.netlify/functions/analyze-cash-flow', {
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
    
    const content = `# Cash Flow Analysis for ${formData.companyName} - ${formData.period}\n\n## Analysis\n${analysisResult.analysis}\n\n## Recommendations\n${analysisResult.recommendations}`;
    
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
        <title>Cash Flow Analysis - ${formData.companyName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2563eb; }
          h2 { color: #4b5563; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
          .section { margin-bottom: 30px; }
          .footer { margin-top: 40px; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Cash Flow Analysis - ${formData.companyName}</h1>
        <p>Period: ${formData.period}</p>
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
            <CardTitle>Cash Flow Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Reporting Period</Label>
                  <Input
                    id="period"
                    name="period"
                    value={formData.period}
                    onChange={handleInputChange}
                    placeholder="e.g., FY 2024 or Q1 2024"
                  />
                </div>
              </div>
              
              <Separator className="my-4" />
              <h3 className="text-md font-medium">Cash Flow Statement</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="operatingCashFlow">Operating Cash Flow ($)</Label>
                  <Input
                    id="operatingCashFlow"
                    name="operatingCashFlow"
                    type="number"
                    value={formData.operatingCashFlow || ''}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investingCashFlow">Investing Cash Flow ($)</Label>
                  <Input
                    id="investingCashFlow"
                    name="investingCashFlow"
                    type="number"
                    value={formData.investingCashFlow || ''}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="financingCashFlow">Financing Cash Flow ($)</Label>
                  <Input
                    id="financingCashFlow"
                    name="financingCashFlow"
                    type="number"
                    value={formData.financingCashFlow || ''}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beginningCashBalance">Beginning Cash Balance ($)</Label>
                  <Input
                    id="beginningCashBalance"
                    name="beginningCashBalance"
                    type="number"
                    value={formData.beginningCashBalance || ''}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endingCashBalance">Ending Cash Balance ($)</Label>
                  <Input
                    id="endingCashBalance"
                    name="endingCashBalance"
                    type="number"
                    value={formData.endingCashBalance || ''}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capitalExpenditures">Capital Expenditures ($)</Label>
                  <Input
                    id="capitalExpenditures"
                    name="capitalExpenditures"
                    type="number"
                    value={formData.capitalExpenditures || ''}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dividendsPaid">Dividends Paid ($)</Label>
                  <Input
                    id="dividendsPaid"
                    name="dividendsPaid"
                    type="number"
                    value={formData.dividendsPaid || ''}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <Button 
                type="button"
                onClick={handleAnalyze} 
                disabled={loading}
                className="w-full mt-4"
              >
                {loading ? "Analyzing..." : "Generate Cash Flow Analysis"}
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
            title={`Cash Flow Analysis - ${formData.companyName}`}
            description={`Period: ${formData.period}`}
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
