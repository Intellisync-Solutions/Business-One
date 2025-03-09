import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessValuationAnalysis } from "@/components/financial/BusinessValuationAnalysis";
import { CashFlowAnalysis } from "@/components/financial/CashFlowAnalysis";
import { InvestmentAnalysis } from "@/components/financial/InvestmentAnalysis";
import { BreakEvenAnalysis } from "@/components/financial/BreakEvenAnalysis";
import { useToast } from "@/components/ui/use-toast";

export default function FinancialAnalysisPage() {
  const [activeTab, setActiveTab] = useState('business-valuation');
  const { toast } = useToast();

  const handleSave = (type: string, data: any) => {
    // Save data to localStorage or other storage mechanism
    localStorage.setItem(`intellisync-${type}`, JSON.stringify(data));
    
    toast({
      title: "Analysis data saved",
      description: `Your ${type} analysis data has been saved for future reference.`,
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Analysis Tools</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive financial analysis tools powered by AI to help you make better business decisions.
        </p>
      </div>

      <Tabs defaultValue="business-valuation" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="business-valuation">Business Valuation</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="investment">Investment</TabsTrigger>
          <TabsTrigger value="break-even">Break-Even</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'business-valuation' && 'Business Valuation Analysis'}
              {activeTab === 'cash-flow' && 'Cash Flow Analysis'}
              {activeTab === 'investment' && 'Investment Analysis'}
              {activeTab === 'break-even' && 'Break-Even Analysis'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'business-valuation' && 'Determine the value of a business based on financial metrics and industry standards.'}
              {activeTab === 'cash-flow' && 'Analyze cash flow patterns to assess financial health and sustainability.'}
              {activeTab === 'investment' && 'Evaluate investment opportunities using NPV, IRR, and other financial metrics.'}
              {activeTab === 'break-even' && 'Calculate break-even points and analyze pricing strategies.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="business-valuation" className="mt-0">
              <BusinessValuationAnalysis 
                onSave={(data) => handleSave('business-valuation', data)} 
              />
            </TabsContent>

            <TabsContent value="cash-flow" className="mt-0">
              <CashFlowAnalysis 
                onSave={(data) => handleSave('cash-flow', data)} 
              />
            </TabsContent>

            <TabsContent value="investment" className="mt-0">
              <InvestmentAnalysis 
                onSave={(data) => handleSave('investment', data)} 
              />
            </TabsContent>

            <TabsContent value="break-even" className="mt-0">
              <BreakEvenAnalysis 
                onSave={(data) => handleSave('break-even', data)} 
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
