import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { DataPersistence } from '@/components/common/DataPersistence'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Card } from '@/components/ui/card'
import { RatioCategoryLayout } from '@/components/financial/RatioCategoryLayout'
import { useState } from 'react'
import { 
  grossProfitMarginInterpretation, 
  netProfitMarginInterpretation, 
  roaInterpretation,
  roeInterpretation,
  inventoryTurnoverInterpretation,
  receivablesTurnoverInterpretation,
  debtToEquityInterpretation,
  interestCoverageInterpretation,
  operatingCashFlowRatioInterpretation,
  ebitdaMarginInterpretation,
  priceEarningsRatioInterpretation,
  priceToBookRatioInterpretation,
  operatingMarginInterpretation,
  assetTurnoverInterpretation
} from "@/data/ratioInterpretations";
import { RatioCategoryMap } from "@/types/financial";
import { validateNonZeroDenominator, formatters, commonInputs } from "@/utils/financialCalculations";

interface FinancialData {
  ratios: Record<string, Record<string, number>>;
}

const RATIO_CATEGORIES: RatioCategoryMap = {
  liquidity: {
    title: "Liquidity Ratios",
    ratios: [
      {
        title: "Current Ratio",
        description: "Measures the ability to pay off short-term liabilities with short-term assets",
        interpretation: {
          good: "Greater than 1 indicates good short-term financial health",
          bad: "Less than 1 may signal potential liquidity issues",
          context: "Optimal ratios vary by industry. A ratio between 1.5 and 3 is generally considered healthy.",
          insights: [
            {
              title: "Key Components",
              points: [
                "Measures a company's ability to pay short-term obligations",
                "Compares current assets to current liabilities",
                "Higher ratio suggests more liquidity and financial flexibility",
                "Too high might indicate inefficient use of assets"
              ]
            }
          ],
          benchmarks: [
            { industry: "Retail", range: "1.5 - 2.5" },
            { industry: "Manufacturing", range: "1.2 - 2.0" },
            { industry: "Technology", range: "2.0 - 4.0" }
          ],
          warningSignals: [
            "Ratio falling below 1.0",
            "Sharp decline in ratio over time",
            "Ratio significantly below industry average",
            "Increasing current liabilities without proportional asset growth"
          ],
          strategies: [
            "Improve working capital management",
            "Negotiate better payment terms with suppliers",
            "Convert short-term debt to long-term financing",
            "Optimize inventory levels"
          ]
        },
        inputs: [commonInputs.currentAssets, commonInputs.currentLiabilities],
        calculate: (values: Record<string, number>) => {
          validateNonZeroDenominator(values.currentLiabilities, "Current liabilities cannot be zero");
          return values.currentAssets / values.currentLiabilities;
        },
        formatResult: formatters.ratio
      },
      {
        title: "Quick Ratio (Acid-Test)",
        description: "Evaluates ability to meet short-term obligations without relying on inventory",
        interpretation: {
          good: "A ratio above 1 indicates strong short-term liquidity position",
          bad: "A ratio below 1 suggests potential short-term liquidity challenges",
          context: "The Quick Ratio is a more stringent measure than the Current Ratio. A ratio between 1.0 and 1.5 is generally considered healthy.",
          insights: [
            {
              title: "Key Features",
              points: [
                "More conservative than Current Ratio as it excludes inventory",
                "Focuses on most liquid assets (cash, marketable securities, receivables)",
                "Better indicator for businesses with slow-moving inventory",
                "Particularly important in economic downturns"
              ]
            }
          ],
          benchmarks: [
            { industry: "Retail", range: "0.5 - 1.0" },
            { industry: "Technology", range: "1.0 - 1.5" },
            { industry: "Services", range: "1.2 - 1.5" }
          ],
          warningSignals: [
            "Ratio falling below industry average",
            "Sudden drops in quick ratio",
            "Consistent downward trend over multiple periods",
            "Heavy reliance on inventory for liquidity",
            "Poor collection of accounts receivable"
          ],
          strategies: [
            "Improve accounts receivable collection",
            "Maintain adequate cash reserves",
            "Optimize working capital management",
            "Review credit policies"
          ]
        },
        inputs: [
          commonInputs.currentAssets,
          {
            name: "inventory",
            label: "Inventory ($)",
            placeholder: "Enter inventory value",
            tooltip: "Total value of inventory that will be excluded from the quick ratio calculation",
            min: 0,
            required: true
          },
          commonInputs.currentLiabilities
        ],
        calculate: (values: Record<string, number>) => {
          validateNonZeroDenominator(values.currentLiabilities, "Current liabilities cannot be zero");
          return (values.currentAssets - values.inventory) / values.currentLiabilities;
        },
        formatResult: formatters.ratio
      },
      {
        title: "Working Capital",
        description: "Measures short-term financial health and operational efficiency",
        interpretation: {
          good: "Positive working capital indicates ability to fund operations and growth",
          bad: "Negative working capital may signal operational and financial distress",
          context: "Working Capital is a key measure of operational efficiency and short-term financial stability. The ideal amount varies by industry and company size.",
          insights: [
            {
              title: "Key Components",
              points: [
                "Represents excess of current assets over current liabilities",
                "Indicates operational liquidity and efficiency",
                "Reflects ability to fund day-to-day operations",
                "Important for business growth and expansion"
              ]
            }
          ],
          benchmarks: [
            { industry: "Retail", range: "15-25% of sales" },
            { industry: "Manufacturing", range: "20-30% of sales" },
            { industry: "Technology", range: "10-20% of sales" }
          ],
          warningSignals: [
            "Negative working capital",
            "Sharp decline in working capital ratio",
            "Working capital significantly below industry average",
            "Increasing current liabilities without proportional asset growth",
            "Seasonal fluctuations beyond normal patterns"
          ],
          strategies: [
            "Improve inventory management",
            "Optimize accounts receivable collection",
            "Negotiate better payment terms with suppliers",
            "Consider working capital financing options"
          ]
        },
        inputs: [commonInputs.currentAssets, commonInputs.currentLiabilities],
        calculate: (values: Record<string, number>) => values.currentAssets - values.currentLiabilities,
        formatResult: formatters.currency
      }
    ]
  },
  profitability: {
    title: "Profitability Ratios",
    ratios: [
      {
        title: "Gross Profit Margin",
        description: "Measures profitability after accounting for cost of goods sold",
        interpretation: grossProfitMarginInterpretation,
        inputs: [
          commonInputs.revenue,
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
          validateNonZeroDenominator(values.revenue, "Revenue cannot be zero");
          return ((values.revenue - values.costOfGoodsSold) / values.revenue) * 100;
        },
        formatResult: formatters.percentage
      },
      {
        title: "Net Profit Margin",
        description: "Shows the percentage of revenue that remains as profit after all expenses",
        interpretation: netProfitMarginInterpretation,
        inputs: [
          {
            name: "netIncome",
            label: "Net Income ($)",
            placeholder: "Enter net income",
            tooltip: "Total profit after all expenses, taxes, and interest have been deducted",
            min: 0,
            required: true
          },
          commonInputs.revenue
        ],
        calculate: (values: Record<string, number>) => 
          (values.netIncome / values.revenue) * 100,
        formatResult: (value: number) => `${value.toFixed(2)}%`
      },
      {
        title: "Return on Assets (ROA)",
        description: "Shows how effectively a company uses its assets to generate profit",
        interpretation: roaInterpretation,
        inputs: [
          {
            name: "netIncome",
            label: "Net Income ($)",
            placeholder: "Enter net income",
            tooltip: "Total profit after all expenses, taxes, and interest",
            min: 0,
            required: true
          },
          {
            name: "totalAssets",
            label: "Total Assets ($)",
            placeholder: "Enter total assets",
            tooltip: "Sum of all current and non-current assets owned by the company",
            min: 0,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => (values.netIncome / values.totalAssets) * 100,
        formatResult: (value: number) => value.toFixed(2) + '%'
      },
      {
        title: "Return on Equity (ROE)",
        description: "Measures how efficiently a company uses shareholders' equity",
        interpretation: roeInterpretation,
        inputs: [
          {
            name: "netIncome",
            label: "Net Income ($)",
            placeholder: "Enter net income",
            tooltip: "The company's total earnings or profit after all expenses, taxes, and costs have been deducted from total revenue. Also known as bottom-line profit or net earnings.",
            min: 0,
            required: true
          },
          {
            name: "shareholderEquity",
            label: "Shareholder's Equity ($)",
            placeholder: "Enter shareholder's equity",
            tooltip: "The owners' stake in the company, calculated as total assets minus total liabilities. Represents the net worth of the company and includes paid-in capital, retained earnings, and other comprehensive income.",
            min: 0,
            required: true
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
        interpretation: inventoryTurnoverInterpretation,
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
          validateNonZeroDenominator(values.averageInventory, "Average inventory cannot be zero");
          return values.costOfGoodsSold / values.averageInventory;
        },
        formatResult: (value: number) => value.toFixed(2) + ' times'
      },
      {
        title: "Accounts Receivable Turnover",
        description: "Measures how quickly customers pay their bills",
        interpretation: receivablesTurnoverInterpretation,
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
          validateNonZeroDenominator(values.averageAccountsReceivable, "Average accounts receivable cannot be zero");
          return values.netCreditSales / values.averageAccountsReceivable;
        },
        formatResult: (value: number) => value.toFixed(2) + ' times'
      }
    ]
  },
  leverage: {
    title: "Leverage Ratios",
    ratios: [
      {
        title: "Debt to Equity",
        description: "Measures financial leverage by comparing debt to equity",
        interpretation: debtToEquityInterpretation,
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
            min: 0,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          validateNonZeroDenominator(values.totalEquity, "Total equity cannot be zero");
          return (values.totalDebt / values.totalEquity) * 100;
        },
        formatResult: (value: number) => value.toFixed(2) + '%'
      },
      {
        title: "Interest Coverage",
        description: "Shows ability to meet interest payments on debt",
        interpretation: interestCoverageInterpretation,
        inputs: [
          {
            name: "ebit",
            label: "EBIT ($)",
            placeholder: "Enter EBIT",
            tooltip: "Earnings Before Interest and Taxes",
            min: 0,
            required: true
          },
          {
            name: "interestExpense",
            label: "Interest Expense ($)",
            placeholder: "Enter interest expense",
            tooltip: "Total interest payments on debt",
            min: 0,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          validateNonZeroDenominator(values.interestExpense, "Interest expense cannot be zero");
          return values.ebit / values.interestExpense;
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
        description: "Measures ability to cover short-term liabilities with operating cash flow",
        interpretation: operatingCashFlowRatioInterpretation,
        inputs: [
          {
            name: "operatingCashFlow",
            label: "Operating Cash Flow ($)",
            placeholder: "Enter operating cash flow",
            tooltip: "Cash generated from normal business operations. Calculated as net income plus non-cash expenses (like depreciation) and changes in working capital. Shows a company's ability to generate cash from its core business.",
            min: 0,
            required: true
          },
          commonInputs.currentLiabilities
        ],
        calculate: (values: Record<string, number>) => values.operatingCashFlow / values.currentLiabilities,
        formatResult: (value: number) => value.toFixed(2)
      },
      {
        title: "EBITDA Margin",
        description: "Shows operating profitability as percentage of revenue",
        interpretation: ebitdaMarginInterpretation,
        inputs: [
          {
            name: "ebitda",
            label: "EBITDA ($)",
            placeholder: "Enter EBITDA",
            tooltip: "Earnings Before Interest, Taxes, Depreciation, and Amortization. A measure of a company's operating performance before financing, tax, and accounting decisions. Often used to evaluate a company's operating cash flow.",
            min: 0,
            required: true
          },
          commonInputs.revenue
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
        title: "Price-Earnings (P/E)",
        description: "Compares stock price to earnings per share",
        interpretation: priceEarningsRatioInterpretation,
        inputs: [
          {
            name: "marketPrice",
            label: "Market Price per Share ($)",
            placeholder: "Enter stock price",
            tooltip: "Current market price of one share",
            min: 0,
            required: true
          },
          {
            name: "earningsPerShare",
            label: "Earnings per Share ($)",
            placeholder: "Enter EPS",
            tooltip: "Net income divided by outstanding shares",
            min: 0,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          validateNonZeroDenominator(values.earningsPerShare, "Earnings per share cannot be zero");
          return values.marketPrice / values.earningsPerShare;
        },
        formatResult: (value: number) => value.toFixed(2)
      },
      {
        title: "Price-to-Book",
        description: "Compares market value to book value",
        interpretation: priceToBookRatioInterpretation,
        inputs: [
          {
            name: "marketPrice",
            label: "Market Price per Share ($)",
            placeholder: "Enter stock price",
            tooltip: "Current market price of one share",
            min: 0,
            required: true
          },
          {
            name: "bookValuePerShare",
            label: "Book Value per Share ($)",
            placeholder: "Enter book value per share",
            tooltip: "Total equity divided by shares outstanding",
            min: 0,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          validateNonZeroDenominator(values.bookValuePerShare, "Book value per share must be positive");
          return values.marketPrice / values.bookValuePerShare;
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
        description: "Shows profitability from core operations",
        interpretation: operatingMarginInterpretation,
        inputs: [
          {
            name: "operatingIncome",
            label: "Operating Income ($)",
            placeholder: "Enter operating income",
            tooltip: "Income from core business operations",
            min: 0,
            required: true
          },
          commonInputs.revenue
        ],
        calculate: (values: Record<string, number>) => {
          validateNonZeroDenominator(values.revenue, "Revenue must be positive");
          return (values.operatingIncome / values.revenue) * 100;
        },
        formatResult: (value: number) => value.toFixed(2) + '%'
      },
      {
        title: "Asset Turnover",
        description: "Measures efficiency of asset usage in generating sales",
        interpretation: assetTurnoverInterpretation,
        inputs: [
          commonInputs.revenue,
          {
            name: "averageAssets",
            label: "Average Total Assets ($)",
            placeholder: "Enter average assets",
            tooltip: "Average of beginning and ending total assets",
            min: 0,
            required: true
          }
        ],
        calculate: (values: Record<string, number>) => {
          validateNonZeroDenominator(values.averageAssets, "Average assets must be positive");
          return (values.revenue / values.averageAssets) * 100;
        },
        formatResult: (value: number) => value.toFixed(2) + '%'
      }
    ]
  }
}

const FinancialCalculators = () => {
  const { toast } = useToast()
  const [financialData, setFinancialData] = useLocalStorage<FinancialData>('financial-ratios', {
    ratios: {}
  })
  const [activeCategory, setActiveCategory] = useState<string>('liquidity')

  const handleCalculation = (ratioName: string, result: number) => {
    setFinancialData(prev => ({
      ...prev,
      ratios: {
        ...prev.ratios,
        [activeCategory]: {
          ...(prev.ratios[activeCategory] || {}),
          [ratioName]: result
        }
      }
    }))
    toast({
      title: "Calculation Complete",
      description: `${ratioName}: ${result}`,
    })
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Financial Ratio Calculator</h2>
        <DataPersistence
          data={financialData}
          onDataImport={setFinancialData}
          dataType="financial-ratios"
        />
      </div>
      
      <div className="grid md:grid-cols-[250px,1fr] gap-6">
        {/* Navigation Sidebar */}
        <Card className="p-4 h-fit">
          <div className="space-y-4">
            <h3 className="font-semibold">Categories</h3>
            <div className="space-y-2">
              {Object.entries(RATIO_CATEGORIES).map(([key, category]) => (
                <Button
                  key={key}
                  variant={activeCategory === key ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveCategory(key)}
                >
                  {category.title}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          {Object.entries(RATIO_CATEGORIES)
            .filter(([key]) => key === activeCategory)
            .map(([key, category]) => (
              <RatioCategoryLayout
                key={key}
                category={category}
                onCalculate={handleCalculation}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

export default FinancialCalculators
