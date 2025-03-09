import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIGeneratedContent } from "@/components/common/AIGeneratedContent";

// NOTE: This is an enhanced version of the BreakEvenCalculator component found in
// /src/components/calculators/BreakEvenCalculator.tsx. This version is designed to work
// with the financial analysis page and uses the analyze-break-even-custom.ts Netlify function
// which leverages the specialized prompt generators from specializedPrompts.ts.

type BreakEvenMode = 'standard' | 'findPrice' | 'findUnits' | 'profitTarget';

interface BreakEvenData {
  productName: string;
  fixedCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  mode: BreakEvenMode;
  targetUnits?: number;
  targetProfit?: number;
  targetProfitPercentage?: number;
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
  onSave?: (data: BreakEvenData) => void;
}

export function BreakEvenAnalysis({ onSave }: BreakEvenAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ analysis: string; recommendations: string } | null>(null);
  const [activeTab, setActiveTab] = useState<BreakEvenMode>('standard');
  
  const [formData, setFormData] = useState<BreakEvenData>({
    productName: '',
    fixedCosts: 0,
    variableCostPerUnit: 0,
    sellingPricePerUnit: 0,
    mode: 'standard',
    targetUnits: 0,
    targetProfit: 0,
    targetProfitPercentage: 0
  });

  const [breakEvenResult, setBreakEvenResult] = useState<BreakEvenResult>({
    breakEvenUnits: 0,
    totalRevenueAtBreakEven: 0,
    contributionMargin: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'productName' ? value : parseFloat(value) || 0
    }));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as BreakEvenMode);
    setFormData(prev => ({
      ...prev,
      mode: value as BreakEvenMode
    }));
  };

  // Calculate break-even point locally before sending to API
  const calculateBreakEven = () => {
    const { fixedCosts, variableCostPerUnit, sellingPricePerUnit, mode, targetProfit } = formData;
    const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
    
    if (contributionMargin <= 0) {
      setError("Contribution margin must be positive. Selling price must exceed variable cost per unit.");
      return false;
    }
    
    let breakEvenUnits = fixedCosts / contributionMargin;
    let totalRevenueAtBreakEven = breakEvenUnits * sellingPricePerUnit;
    
    // Calculate mode-specific values
    if (mode === 'profitTarget' && targetProfit) {
      breakEvenUnits = (fixedCosts + targetProfit) / contributionMargin;
      totalRevenueAtBreakEven = breakEvenUnits * sellingPricePerUnit;
    }
    
    setBreakEvenResult({
      breakEvenUnits,
      totalRevenueAtBreakEven,
      contributionMargin,
      profitMargin: contributionMargin / sellingPricePerUnit
    });
    
    return true;
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    // Validate inputs
    if (!formData.productName) {
      setError("Please enter a product name.");
      setLoading(false);
      return;
    }
    
    if (formData.fixedCosts <= 0) {
      setError("Fixed costs must be greater than zero.");
      setLoading(false);
      return;
    }
    
    if (formData.sellingPricePerUnit <= 0) {
      setError("Selling price must be greater than zero.");
      setLoading(false);
      return;
    }
    
    // Calculate break-even point
    if (!calculateBreakEven()) {
      setLoading(false);
      return;
    }
    
    try {
      // Prepare the data in the format expected by the Netlify function
      const breakEvenDataFormatted = {
        productName: formData.productName,
        fixedCosts: formData.fixedCosts,
        variableCostPerUnit: formData.variableCostPerUnit,
        sellingPricePerUnit: formData.sellingPricePerUnit,
        mode: formData.mode,
        targetUnits: formData.targetUnits,
        targetProfit: formData.targetProfit,
        targetProfitPercentage: formData.targetProfitPercentage
      };

      console.log('Sending break-even data:', breakEvenDataFormatted);
      console.log('Sending break-even result:', breakEvenResult);
      
      const response = await fetch('/.netlify/functions/analyze-break-even-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          breakEvenData: breakEvenDataFormatted,
          breakEvenResult
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received analysis result:', data);
      
      if (!data.analysis || !data.recommendations) {
        throw new Error("Received incomplete analysis data from the server");
      }
      
      setAnalysisResult(data);
      
      // Save the data if onSave is provided
      if (onSave) {
        onSave(formData);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    
    const content = `# Break-Even Analysis for ${formData.productName}\n\n## Analysis\n${analysisResult.analysis}\n\n## Recommendations\n${analysisResult.recommendations}`;
    
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
        <title>Break-Even Analysis - ${formData.productName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2563eb; }
          h2 { color: #4b5563; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
          .section { margin-bottom: 30px; }
          .footer { margin-top: 40px; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Break-Even Analysis - ${formData.productName}</h1>
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
            <CardTitle>Break-Even Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product/Service Name</Label>
                <Input
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder="Enter product or service name"
                />
              </div>
              
              <Tabs defaultValue="standard" value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="standard">Standard</TabsTrigger>
                  <TabsTrigger value="profitTarget">Profit Target</TabsTrigger>
                  <TabsTrigger value="findPrice">Find Price</TabsTrigger>
                  <TabsTrigger value="findUnits">Find Units</TabsTrigger>
                </TabsList>
                
                <TabsContent value="standard" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fixedCosts">Fixed Costs ($)</Label>
                      <Input
                        id="fixedCosts"
                        name="fixedCosts"
                        type="number"
                        value={formData.fixedCosts || ''}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="variableCostPerUnit">Variable Cost per Unit ($)</Label>
                      <Input
                        id="variableCostPerUnit"
                        name="variableCostPerUnit"
                        type="number"
                        value={formData.variableCostPerUnit || ''}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sellingPricePerUnit">Selling Price per Unit ($)</Label>
                      <Input
                        id="sellingPricePerUnit"
                        name="sellingPricePerUnit"
                        type="number"
                        value={formData.sellingPricePerUnit || ''}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="profitTarget" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fixedCosts">Fixed Costs ($)</Label>
                      <Input
                        id="fixedCosts"
                        name="fixedCosts"
                        type="number"
                        value={formData.fixedCosts || ''}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="variableCostPerUnit">Variable Cost per Unit ($)</Label>
                      <Input
                        id="variableCostPerUnit"
                        name="variableCostPerUnit"
                        type="number"
                        value={formData.variableCostPerUnit || ''}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sellingPricePerUnit">Selling Price per Unit ($)</Label>
                      <Input
                        id="sellingPricePerUnit"
                        name="sellingPricePerUnit"
                        type="number"
                        value={formData.sellingPricePerUnit || ''}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="targetProfit">Target Profit ($)</Label>
                    <Input
                      id="targetProfit"
                      name="targetProfit"
                      type="number"
                      value={formData.targetProfit || ''}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="findPrice" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fixedCosts">Fixed Costs ($)</Label>
                      <Input
                        id="fixedCosts"
                        name="fixedCosts"
                        type="number"
                        value={formData.fixedCosts || ''}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="variableCostPerUnit">Variable Cost per Unit ($)</Label>
                      <Input
                        id="variableCostPerUnit"
                        name="variableCostPerUnit"
                        type="number"
                        value={formData.variableCostPerUnit || ''}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetUnits">Target Units to Sell</Label>
                      <Input
                        id="targetUnits"
                        name="targetUnits"
                        type="number"
                        value={formData.targetUnits || ''}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="targetProfitPercentage">Target Profit Margin (%)</Label>
                    <Input
                      id="targetProfitPercentage"
                      name="targetProfitPercentage"
                      type="number"
                      value={formData.targetProfitPercentage || ''}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="findUnits" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fixedCosts">Fixed Costs ($)</Label>
                      <Input
                        id="fixedCosts"
                        name="fixedCosts"
                        type="number"
                        value={formData.fixedCosts || ''}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="variableCostPerUnit">Variable Cost per Unit ($)</Label>
                      <Input
                        id="variableCostPerUnit"
                        name="variableCostPerUnit"
                        type="number"
                        value={formData.variableCostPerUnit || ''}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sellingPricePerUnit">Selling Price per Unit ($)</Label>
                      <Input
                        id="sellingPricePerUnit"
                        name="sellingPricePerUnit"
                        type="number"
                        value={formData.sellingPricePerUnit || ''}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="targetProfit">Target Profit ($)</Label>
                    <Input
                      id="targetProfit"
                      name="targetProfit"
                      type="number"
                      value={formData.targetProfit || ''}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button 
                type="button"
                onClick={handleAnalyze} 
                disabled={loading}
                className="w-full mt-4"
              >
                {loading ? "Analyzing..." : "Generate Break-Even Analysis"}
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
            title={`Break-Even Analysis - ${formData.productName}`}
            description={`Mode: ${formData.mode === 'standard' ? 'Standard Break-Even Analysis' : 
              formData.mode === 'profitTarget' ? 'Profit Target Analysis' : 
              formData.mode === 'findPrice' ? 'Price Analysis' : 'Units Analysis'}`}
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
