import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { saveToFile, loadFromFile } from '@/utils/fileOperations'
import { RatioCalculator } from '@/components/financial/RatioCalculator'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface FinancialData {
  ratios: Record<string, Record<string, number>>;
}

const RATIO_CATEGORIES = {
  liquidity: {
    title: "Liquidity Ratios",
    ratios: [
      {
        title: "Current Ratio",
        description: "Measures the ability to pay off short-term liabilities with short-term assets",
        interpretation: {
          good: "Greater than 1 indicates good short-term financial health",
          bad: "Less than 1 may signal potential liquidity issues",
          context: "Optimal ratios vary by industry"
        },
        inputs: [
          { 
            name: "currentAssets", 
            label: "Current Assets ($)", 
            placeholder: "Enter current assets",
            tooltip: "Assets that can be converted into cash within one year. Includes cash, cash equivalents, short-term investments, accounts receivable, inventory, and prepaid expenses.",
            min: 0,
            required: true
          },
          { 
            name: "currentLiabilities", 
            label: "Current Liabilities ($)", 
            placeholder: "Enter current liabilities",
            tooltip: "Financial obligations due within one year. Includes accounts payable, short-term debt, current portion of long-term debt, accrued expenses, and other short-term financial obligations.",
            min: 0,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          if (values.currentLiabilities === 0) {
            throw new Error("Current liabilities cannot be zero")
          }
          return values.currentAssets / values.currentLiabilities
        },
        formatResult: (value: number) => value.toFixed(2)
      },
      {
        title: "Quick Ratio (Acid-Test)",
        description: "Evaluates ability to meet short-term obligations without relying on inventory",
        interpretation: {
          good: "Greater than 1 suggests strong liquidity",
          bad: "Less than 1 indicates potential liquidity problems",
          context: "More stringent than current ratio"
        },
        inputs: [
          { 
            name: "currentAssets", 
            label: "Current Assets ($)", 
            placeholder: "Enter current assets",
            tooltip: "Assets that can be converted into cash within one year. Includes cash, cash equivalents, short-term investments, accounts receivable, inventory, and prepaid expenses.",
            min: 0,
            required: true
          },
          { 
            name: "inventory", 
            label: "Inventory ($)", 
            placeholder: "Enter inventory value",
            tooltip: "Value of goods available for sale. Includes raw materials, work-in-progress, and finished goods. Part of current assets but typically less liquid.",
            min: 0,
            required: true
          },
          { 
            name: "currentLiabilities", 
            label: "Current Liabilities ($)", 
            placeholder: "Enter current liabilities",
            tooltip: "Financial obligations due within one year. Includes accounts payable, short-term debt, current portion of long-term debt, accrued expenses, and other short-term financial obligations.",
            min: 0,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          if (values.currentLiabilities === 0) {
            throw new Error("Current liabilities cannot be zero")
          }
          if (values.inventory > values.currentAssets) {
            throw new Error("Inventory cannot be greater than current assets")
          }
          return (values.currentAssets - values.inventory) / values.currentLiabilities
        },
        formatResult: (value: number) => value.toFixed(2)
      },
      {
        title: "Working Capital",
        description: "Measures short-term financial health and operational efficiency",
        interpretation: {
          good: "Positive working capital indicates strong short-term position",
          bad: "Negative working capital suggests potential liquidity problems",
          context: "Essential for day-to-day operations"
        },
        inputs: [
          { 
            name: "currentAssets", 
            label: "Current Assets ($)", 
            placeholder: "Enter current assets",
            tooltip: "Assets that can be converted into cash within one year. Includes cash, cash equivalents, short-term investments, accounts receivable, inventory, and prepaid expenses."
          },
          { 
            name: "currentLiabilities", 
            label: "Current Liabilities ($)", 
            placeholder: "Enter current liabilities",
            tooltip: "Financial obligations due within one year. Includes accounts payable, short-term debt, current portion of long-term debt, accrued expenses, and other short-term financial obligations."
          }
        ],
        calculate: (values: Record<string, number>) => values.currentAssets - values.currentLiabilities,
        formatResult: (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      }
    ]
  },
  profitability: {
    title: "Profitability Ratios",
    ratios: [
      {
        title: "Gross Profit Margin",
        description: "Shows the percentage of revenue retained after direct costs",
        interpretation: {
          good: "Higher margin indicates better cost control",
          bad: "Low margin may indicate pricing or cost issues",
          context: "Industry benchmarks vary significantly"
        },
        inputs: [
          { 
            name: "revenue", 
            label: "Revenue ($)", 
            placeholder: "Enter total revenue",
            tooltip: "Total revenue from all business activities",
            min: 0,
            required: true
          },
          { 
            name: "costOfGoodsSold", 
            label: "Cost of Goods Sold ($)", 
            placeholder: "Enter COGS",
            tooltip: "Direct costs attributable to the production of goods sold",
            min: 0,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          if (values.revenue === 0) {
            throw new Error("Revenue cannot be zero")
          }
          if (values.costOfGoodsSold > values.revenue) {
            throw new Error("Cost of goods sold cannot exceed revenue")
          }
          return ((values.revenue - values.costOfGoodsSold) / values.revenue) * 100
        },
        formatResult: (value: number) => value.toFixed(2) + '%'
      },
      {
        title: "Net Profit Margin",
        description: "Shows the percentage of revenue that remains as profit after all expenses",
        interpretation: {
          good: "Higher margin indicates efficient management",
          bad: "Lower margin suggests higher expenses",
          context: "Key indicator of overall profitability"
        },
        inputs: [
          { 
            name: "netIncome", 
            label: "Net Income ($)", 
            placeholder: "Enter net income",
            tooltip: "The company's total earnings or profit after all expenses, taxes, and costs have been deducted from total revenue. Also known as bottom-line profit or net earnings."
          },
          { 
            name: "revenue", 
            label: "Revenue ($)", 
            placeholder: "Enter total revenue",
            tooltip: "Total income generated from sales of goods or services before any costs or expenses are deducted. Also known as gross sales or top-line revenue."
          }
        ],
        calculate: (values: Record<string, number>) => 
          (values.netIncome / values.revenue) * 100,
        formatResult: (value: number) => `${value.toFixed(2)}%`
      },
      {
        title: "Return on Assets (ROA)",
        description: "Shows how effectively a company uses its assets to generate profit",
        interpretation: {
          good: "Higher ROA indicates more efficient use of assets",
          bad: "Lower ROA suggests assets may be underutilized",
          context: "Compare with industry peers for accurate assessment"
        },
        inputs: [
          { 
            name: "netIncome", 
            label: "Net Income ($)", 
            placeholder: "Enter net income",
            tooltip: "The company's total earnings or profit after all expenses, taxes, and costs have been deducted from total revenue. Also known as bottom-line profit or net earnings."
          },
          { 
            name: "totalAssets", 
            label: "Total Assets ($)", 
            placeholder: "Enter total assets",
            tooltip: "All resources owned by the company with economic value. Includes both current assets (convertible to cash within a year) and non-current assets (long-term assets like property, equipment, and intangibles)."
          }
        ],
        calculate: (values: Record<string, number>) => (values.netIncome / values.totalAssets) * 100,
        formatResult: (value: number) => value.toFixed(2) + '%'
      },
      {
        title: "Return on Equity (ROE)",
        description: "Shows the return generated on shareholders' investments",
        interpretation: {
          good: "Higher ROE indicates effective management and strong profitability",
          bad: "Lower ROE suggests potential issues with profitability",
          context: "Important metric for investors seeking good returns"
        },
        inputs: [
          { 
            name: "netIncome", 
            label: "Net Income ($)", 
            placeholder: "Enter net income",
            tooltip: "The company's total earnings or profit after all expenses, taxes, and costs have been deducted from total revenue. Also known as bottom-line profit or net earnings."
          },
          { 
            name: "shareholderEquity", 
            label: "Shareholder's Equity ($)", 
            placeholder: "Enter shareholder's equity",
            tooltip: "The owners' stake in the company, calculated as total assets minus total liabilities. Represents the net worth of the company and includes paid-in capital, retained earnings, and other comprehensive income."
          }
        ],
        calculate: (values: Record<string, number>) => (values.netIncome / values.shareholderEquity) * 100,
        formatResult: (value: number) => value.toFixed(2) + '%'
      }
    ]
  },
  efficiency: {
    title: "Efficiency Ratios",
    ratios: [
      {
        title: "Inventory Turnover",
        description: "Measures how quickly inventory is sold and replaced",
        interpretation: {
          good: "Higher turnover indicates efficient inventory management",
          bad: "Low turnover may indicate excess inventory or slow sales",
          context: "Industry-specific; retail typically has higher turnover"
        },
        inputs: [
          { 
            name: "costOfGoodsSold", 
            label: "Cost of Goods Sold ($)", 
            placeholder: "Enter annual COGS",
            tooltip: "Total cost of goods sold for the year",
            min: 0,
            required: true
          },
          { 
            name: "averageInventory", 
            label: "Average Inventory ($)", 
            placeholder: "Enter average inventory",
            tooltip: "Average value of inventory over the period ((Beginning + Ending)/2)",
            min: 0,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          if (values.averageInventory === 0) {
            throw new Error("Average inventory cannot be zero")
          }
          return values.costOfGoodsSold / values.averageInventory
        },
        formatResult: (value: number) => value.toFixed(2) + ' times'
      },
      {
        title: "Accounts Receivable Turnover",
        description: "Measures how effectively a company collects debt",
        interpretation: {
          good: "Higher ratio indicates efficient collection of receivables",
          bad: "Lower ratio suggests potential collection issues",
          context: "Consider payment terms and industry standards"
        },
        inputs: [
          { 
            name: "netCreditSales", 
            label: "Net Credit Sales ($)", 
            placeholder: "Enter annual credit sales",
            tooltip: "Total sales made on credit for the year",
            min: 0,
            required: true
          },
          { 
            name: "averageAccountsReceivable", 
            label: "Average Accounts Receivable ($)", 
            placeholder: "Enter average AR",
            tooltip: "Average accounts receivable ((Beginning + Ending)/2)",
            min: 0,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          if (values.averageAccountsReceivable === 0) {
            throw new Error("Average accounts receivable cannot be zero")
          }
          return values.netCreditSales / values.averageAccountsReceivable
        },
        formatResult: (value: number) => value.toFixed(2) + ' times'
      }
    ]
  },
  leverage: {
    title: "Leverage Ratios",
    ratios: [
      {
        title: "Debt-to-Equity",
        description: "Measures financial leverage and risk",
        interpretation: {
          good: "Lower ratio indicates less financial risk",
          bad: "Higher ratio suggests higher financial risk",
          context: "Optimal ratio varies by industry and growth stage"
        },
        inputs: [
          { 
            name: "totalDebt", 
            label: "Total Debt ($)", 
            placeholder: "Enter total debt",
            tooltip: "All short-term and long-term debt obligations",
            min: 0,
            required: true
          },
          { 
            name: "totalEquity", 
            label: "Total Equity ($)", 
            placeholder: "Enter total equity",
            tooltip: "Total shareholders' equity",
            min: 0.01,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          if (values.totalEquity === 0) {
            throw new Error("Total equity cannot be zero")
          }
          if (values.totalEquity < 0) {
            throw new Error("Total equity cannot be negative")
          }
          return (values.totalDebt / values.totalEquity) * 100
        },
        formatResult: (value: number) => value.toFixed(2) + '%'
      },
      {
        title: "Interest Coverage",
        description: "Measures ability to pay interest on debt",
        interpretation: {
          good: "Higher ratio indicates strong ability to service debt",
          bad: "Lower ratio suggests potential debt servicing issues",
          context: "Generally, ratio > 1.5 is considered minimum acceptable"
        },
        inputs: [
          { 
            name: "ebit", 
            label: "EBIT ($)", 
            placeholder: "Enter EBIT",
            tooltip: "Earnings Before Interest and Taxes",
            required: true
          },
          { 
            name: "interestExpense", 
            label: "Interest Expense ($)", 
            placeholder: "Enter interest expense",
            tooltip: "Total interest payments on debt",
            min: 0.01,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          if (values.interestExpense === 0) {
            throw new Error("Interest expense cannot be zero")
          }
          if (values.interestExpense < 0) {
            throw new Error("Interest expense cannot be negative")
          }
          return values.ebit / values.interestExpense
        },
        formatResult: (value: number) => value.toFixed(2) + ' times'
      }
    ]
  },
  cashflow: {
    title: "Cash Flow Ratios",
    ratios: [
      {
        title: "Operating Cash Flow Ratio",
        description: "Evaluates ability to cover liabilities with cash flow",
        interpretation: {
          good: "Higher ratio indicates strong liquidity from operations",
          bad: "Lower ratio suggests potential liquidity issues",
          context: "Essential for assessing operational cash generation"
        },
        inputs: [
          { 
            name: "operatingCashFlow", 
            label: "Operating Cash Flow ($)", 
            placeholder: "Enter operating cash flow",
            tooltip: "Cash generated from normal business operations. Calculated as net income plus non-cash expenses (like depreciation) and changes in working capital. Shows a company's ability to generate cash from its core business."
          },
          { 
            name: "currentLiabilities", 
            label: "Current Liabilities ($)", 
            placeholder: "Enter current liabilities",
            tooltip: "Financial obligations due within one year. Includes accounts payable, short-term debt, current portion of long-term debt, accrued expenses, and other short-term financial obligations."
          }
        ],
        calculate: (values: Record<string, number>) => values.operatingCashFlow / values.currentLiabilities,
        formatResult: (value: number) => value.toFixed(2)
      },
      {
        title: "EBITDA Margin",
        description: "Assesses operating profitability before non-operating expenses",
        interpretation: {
          good: "Higher margin indicates strong operational performance",
          bad: "Lower margin suggests operational inefficiencies",
          context: "Useful for comparing profitability across companies"
        },
        inputs: [
          { 
            name: "ebitda", 
            label: "EBITDA ($)", 
            placeholder: "Enter EBITDA",
            tooltip: "Earnings Before Interest, Taxes, Depreciation, and Amortization. A measure of a company's operating performance before financing, tax, and accounting decisions. Often used to evaluate a company's operating cash flow."
          },
          { 
            name: "revenue", 
            label: "Revenue ($)", 
            placeholder: "Enter total revenue",
            tooltip: "Total income generated from sales of goods or services before any costs or expenses are deducted. Also known as gross sales or top-line revenue."
          }
        ],
        calculate: (values: Record<string, number>) => (values.ebitda / values.revenue) * 100,
        formatResult: (value: number) => value.toFixed(2) + '%'
      }
    ]
  },
  marketValue: {
    title: "Market Value Ratios",
    ratios: [
      {
        title: "Price-to-Earnings (P/E)",
        description: "Measures market price relative to earnings",
        interpretation: {
          good: "Lower P/E may indicate undervaluation",
          bad: "Very high P/E might suggest overvaluation",
          context: "Compare to industry averages and growth rates"
        },
        inputs: [
          { 
            name: "marketPrice", 
            label: "Market Price per Share ($)", 
            placeholder: "Enter stock price",
            tooltip: "Current market price of one share",
            min: 0.01,
            required: true
          },
          { 
            name: "earningsPerShare", 
            label: "Earnings per Share ($)", 
            placeholder: "Enter EPS",
            tooltip: "Net income divided by outstanding shares",
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          if (values.earningsPerShare === 0) {
            throw new Error("Earnings per share cannot be zero")
          }
          if (values.marketPrice <= 0) {
            throw new Error("Market price must be positive")
          }
          return values.marketPrice / values.earningsPerShare
        },
        formatResult: (value: number) => value.toFixed(2)
      },
      {
        title: "Price-to-Book (P/B)",
        description: "Compares market price to book value",
        interpretation: {
          good: "P/B < 1 might indicate undervaluation",
          bad: "High P/B may suggest overvaluation",
          context: "Consider industry and company growth stage"
        },
        inputs: [
          { 
            name: "marketPrice", 
            label: "Market Price per Share ($)", 
            placeholder: "Enter stock price",
            tooltip: "Current market price of one share",
            min: 0.01,
            required: true
          },
          { 
            name: "bookValuePerShare", 
            label: "Book Value per Share ($)", 
            placeholder: "Enter book value per share",
            tooltip: "Total equity divided by shares outstanding",
            min: 0.01,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          if (values.bookValuePerShare <= 0) {
            throw new Error("Book value per share must be positive")
          }
          return values.marketPrice / values.bookValuePerShare
        },
        formatResult: (value: number) => value.toFixed(2)
      }
    ]
  },
  operating: {
    title: "Operating Performance Ratios",
    ratios: [
      {
        title: "Operating Margin",
        description: "Measures operating efficiency",
        interpretation: {
          good: "Higher margin indicates operational efficiency",
          bad: "Low margin suggests operational challenges",
          context: "Compare to industry standards"
        },
        inputs: [
          { 
            name: "operatingIncome", 
            label: "Operating Income ($)", 
            placeholder: "Enter operating income",
            tooltip: "Income from core business operations",
            required: true
          },
          { 
            name: "revenue", 
            label: "Revenue ($)", 
            placeholder: "Enter total revenue",
            tooltip: "Total sales or revenue",
            min: 0.01,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          if (values.revenue <= 0) {
            throw new Error("Revenue must be positive")
          }
          return (values.operatingIncome / values.revenue) * 100
        },
        formatResult: (value: number) => value.toFixed(2) + '%'
      },
      {
        title: "Asset Utilization",
        description: "Measures efficiency of asset usage",
        interpretation: {
          good: "Higher ratio indicates efficient asset use",
          bad: "Lower ratio suggests underutilization",
          context: "Industry-specific benchmark"
        },
        inputs: [
          { 
            name: "revenue", 
            label: "Revenue ($)", 
            placeholder: "Enter total revenue",
            tooltip: "Total annual revenue",
            min: 0,
            required: true
          },
          { 
            name: "averageAssets", 
            label: "Average Total Assets ($)", 
            placeholder: "Enter average assets",
            tooltip: "Average of beginning and ending total assets",
            min: 0.01,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          if (values.averageAssets <= 0) {
            throw new Error("Average assets must be positive")
          }
          return (values.revenue / values.averageAssets) * 100
        },
        formatResult: (value: number) => value.toFixed(2) + '%'
      }
    ]
  }
}

const FinancialCalculators = () => {
  const { toast } = useToast()
  const [financialData, setFinancialData] = useLocalStorage<FinancialData>('financial-data', {
    ratios: {}
  })

  const handleSaveData = async () => {
    try {
      await saveToFile(financialData, 'financial-ratios.json')
      toast({
        title: "Success",
        description: "Financial data saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save financial data",
        variant: "destructive",
      })
    }
  }

  const handleLoadData = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const data = await loadFromFile(file);
        if (data) {
          setFinancialData(data);
          toast({
            title: "Success",
            description: "Financial data loaded successfully",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load financial data",
          variant: "destructive",
        });
      }
    };
    input.click();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Financial Ratio Calculators</h1>
        <div className="space-x-4">
          <Button onClick={handleLoadData}>Load Data</Button>
          <Button onClick={handleSaveData}>Save Data</Button>
        </div>
      </div>
      
      <div className="grid gap-6">
        <div className="space-y-4">
          {Object.entries(RATIO_CATEGORIES).map(([key, category]) => (
            <div key={key} className="space-y-4">
              <h3 className="text-xl font-bold">{category.title}</h3>
              <div className="grid gap-6 md:grid-cols-2">
                {category.ratios.map((ratio, index) => (
                  <RatioCalculator
                    key={index}
                    title={ratio.title}
                    description={ratio.description}
                    inputs={ratio.inputs}
                    calculate={ratio.calculate}
                    interpretation={ratio.interpretation}
                    data={financialData.ratios[ratio.title.toLowerCase().replace(' ', '-')] || 
                      Object.fromEntries(ratio.inputs.map(input => [input.name, 0]))}
                    onDataChange={(data) => setFinancialData({ ...financialData, ratios: { ...financialData.ratios, [ratio.title.toLowerCase().replace(' ', '-')]: data } })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FinancialCalculators
