import { RatioInterpretationData, createRatioInterpretation } from "@/components/financial/RatioInterpretation";

/**
 * Utility function to analyze and extract key information from a RatioInterpretationData object
 * @param data The ratio interpretation data to analyze
 * @returns An object with extracted insights and metadata
 */
export function analyzeRatioInterpretation(data: RatioInterpretationData) {
  return {
    summary: {
      context: data.context,
      goodOutcome: data.good,
      badOutcome: data.bad,
    },
    insights: data.insights.flatMap(insight => 
      insight.points.map(point => ({
        category: insight.title,
        point
      }))
    ),
    benchmarks: data.benchmarks?.map(bench => `${bench.industry}: ${bench.range}`) || [],
    warningSignals: data.warningSignals,
    strategies: data.strategies || [],
    
    /**
     * Generates a comprehensive report of the ratio interpretation
     */
    generateReport(): string {
      const report: string[] = [
        ` Ratio Interpretation Report`,
        `Context: ${this.summary.context}`,
        `\n Good Outcome: ${this.summary.goodOutcome}`,
        ` Bad Outcome: ${this.summary.badOutcome}`,
        `\n Key Insights:`
      ];

      this.insights.forEach(insight => 
        report.push(`- [${insight.category}] ${insight.point}`)
      );

      if (this.benchmarks.length > 0) {
        report.push(`\n Industry Benchmarks:`);
        this.benchmarks.forEach(bench => report.push(`- ${bench}`));
      }

      if (this.warningSignals.length > 0) {
        report.push(`\n Warning Signals:`);
        this.warningSignals.forEach(signal => report.push(`- ${signal}`));
      }

      if (this.strategies.length > 0) {
        report.push(`\n Recommended Strategies:`);
        this.strategies.forEach(strategy => report.push(`- ${strategy}`));
      }

      return report.join('\n');
    }
  };
}

export const grossProfitMarginInterpretation = createRatioInterpretation({
  good: "Higher margin indicates better efficiency in managing production costs",
  bad: "Lower margin suggests potential cost control issues or pricing challenges",
  context: "Gross Profit Margin is a fundamental measure of production and pricing efficiency. Target margins vary significantly by industry.",
  insights: [
    {
      title: "Key Indicators",
      points: [
        "Indicates pricing power in the market",
        "Reflects production cost management",
        "Key for competitive analysis",
        "Foundation for overall profitability"
      ]
    }
  ],
  benchmarks: [
    { industry: "Luxury Goods", range: "60-80%" },
    { industry: "Software/Digital", range: "70-90%" },
    { industry: "Retail", range: "25-40%" },
    { industry: "Manufacturing", range: "20-35%" },
    { industry: "Grocery", range: "15-20%" }
  ],
  warningSignals: [
    "Declining margins over time",
    "Margins below industry average",
    "Inconsistent margin fluctuations",
    "Rising cost of goods sold"
  ],
  strategies: [
    "Optimize supplier relationships",
    "Review pricing strategy",
    "Improve production efficiency",
    "Reduce waste and overhead",
    "Consider product mix adjustments"
  ]
});

export const netProfitMarginInterpretation = createRatioInterpretation({
  good: "Higher margin indicates strong overall profitability and cost management",
  bad: "Lower margin suggests inefficiencies or high operating costs",
  context: "Net Profit Margin is the ultimate measure of a company's profitability, showing how much of each dollar of revenue becomes profit.",
  insights: [
    {
      title: "Key Metrics",
      points: [
        "Comprehensive profitability indicator",
        "Accounts for all business costs",
        "Key metric for investors",
        "Important for long-term sustainability"
      ]
    }
  ],
  benchmarks: [
    { industry: "Technology", range: "15-25%" },
    { industry: "Healthcare", range: "12-20%" },
    { industry: "Manufacturing", range: "8-12%" },
    { industry: "Retail", range: "2-5%" },
    { industry: "Airlines", range: "1-3%" }
  ],
  warningSignals: [
    "Margins significantly below industry average",
    "Declining trend over multiple periods",
    "High revenue but low margins",
    "Inconsistent margin patterns"
  ],
  strategies: [
    "Operational efficiency improvements",
    "Cost structure optimization",
    "Pricing strategy refinement",
    "Market expansion potential",
    "Value-added services integration"
  ]
});

export const roaInterpretation = createRatioInterpretation({
  good: "Higher ROA indicates efficient use of assets to generate profit",
  bad: "Lower ROA suggests inefficient asset utilization or excessive asset base",
  context: "Return on Assets measures how efficiently a company uses its assets to generate earnings. A good ROA varies by industry but generally 5% or higher is considered positive.",
  insights: [
    {
      title: "Key Indicators",
      points: [
        "Measures management effectiveness",
        "Important for capital-intensive industries",
        "Useful for comparing companies of different sizes",
        "Key indicator of operational efficiency"
      ]
    }
  ],
  benchmarks: [
    { industry: "Technology", range: "10-15%" },
    { industry: "Financial Services", range: "1-2%" },
    { industry: "Retail", range: "5-10%" },
    { industry: "Manufacturing", range: "4-8%" },
    { industry: "Real Estate", range: "2-4%" }
  ],
  warningSignals: [
    "ROA below cost of capital",
    "Declining trend in asset turnover",
    "High asset base with low returns",
    "Inconsistent earnings pattern"
  ],
  strategies: [
    "Asset utilization optimization",
    "Review capital allocation",
    "Consider asset-light strategies",
    "Improve operational efficiency",
    "Evaluate non-performing assets"
  ]
});

export const roeInterpretation = createRatioInterpretation({
  good: "Higher ROE indicates efficient use of shareholder equity to generate profits",
  bad: "Lower ROE suggests inefficient use of shareholder capital",
  context: "Return on Equity measures how effectively a company uses shareholders' investment to generate profits.",
  insights: [
    {
      title: "Key Indicators",
      points: [
        "Measures management's efficiency in using equity",
        "Important for investor decision-making",
        "Reflects company's competitive advantage",
        "Indicates profit generation capability"
      ]
    }
  ],
  benchmarks: [
    { industry: "Technology", range: "15-25%" },
    { industry: "Financial Services", range: "10-15%" },
    { industry: "Healthcare", range: "15-20%" },
    { industry: "Retail", range: "10-20%" },
    { industry: "Utilities", range: "8-12%" }
  ],
  warningSignals: [
    "ROE below cost of equity",
    "Declining trend in profit margins",
    "Excessive leverage boosting ROE",
    "Inconsistent earnings growth"
  ],
  strategies: [
    "Improve operational efficiency",
    "Optimize capital structure",
    "Enhance profit margins",
    "Manage working capital effectively",
    "Consider share buybacks"
  ]
});

export const inventoryTurnoverInterpretation = createRatioInterpretation({
  good: "Higher turnover indicates efficient inventory management",
  bad: "Lower turnover suggests potential inventory management issues",
  context: "Inventory Turnover measures how many times inventory is sold and replaced over a period.",
  insights: [
    {
      title: "Key Indicators",
      points: [
        "Reflects inventory management efficiency",
        "Indicates working capital utilization",
        "Shows demand strength",
        "Helps identify stocking issues"
      ]
    }
  ],
  benchmarks: [
    { industry: "Retail - Grocery", range: "12-20x" },
    { industry: "Retail - Fashion", range: "4-6x" },
    { industry: "Manufacturing", range: "4-8x" },
    { industry: "Auto Dealers", range: "8-12x" },
    { industry: "Electronics", range: "6-8x" }
  ],
  warningSignals: [
    "Declining turnover ratio",
    "High inventory levels",
    "Stockouts frequency",
    "Seasonal fluctuations"
  ],
  strategies: [
    "Implement JIT inventory",
    "Use demand forecasting",
    "Optimize order quantities",
    "Regular stock reviews",
    "Automate inventory tracking"
  ]
});

export const receivablesTurnoverInterpretation = createRatioInterpretation({
  good: "Higher turnover indicates efficient collection of receivables",
  bad: "Lower turnover suggests potential collection issues",
  context: "Receivables Turnover measures how effectively a company collects debt from its customers.",
  insights: [
    {
      title: "Key Metrics",
      points: [
        "Indicates collection efficiency",
        "Reflects credit policy effectiveness",
        "Shows customer payment behavior",
        "Important for cash flow management"
      ]
    }
  ],
  benchmarks: [
    { industry: "Retail", range: "8-12x" },
    { industry: "Manufacturing", range: "4-6x" },
    { industry: "Services", range: "6-8x" },
    { industry: "Healthcare", range: "5-7x" },
    { industry: "Construction", range: "3-5x" }
  ],
  warningSignals: [
    "Declining turnover ratio",
    "Increasing collection period",
    "High bad debt write-offs",
    "Inconsistent collection patterns"
  ],
  strategies: [
    "Strengthen credit policies",
    "Implement early payment incentives",
    "Regular follow-up procedures",
    "Use automated billing systems",
    "Monitor customer payment patterns"
  ]
});

export const debtToEquityInterpretation = createRatioInterpretation({
  good: "Lower ratio indicates less reliance on debt financing",
  bad: "Higher ratio suggests higher financial risk",
  context: "Debt to Equity Ratio measures the company's financial leverage by comparing debt to equity.",
  insights: [
    {
      title: "Key Considerations",
      points: [
        "Indicates financial leverage",
        "Shows financial risk level",
        "Important for creditors",
        "Reflects financing strategy"
      ]
    }
  ],
  benchmarks: [
    { industry: "Technology", range: "0.5-1.5" },
    { industry: "Utilities", range: "1.5-2.5" },
    { industry: "Manufacturing", range: "0.5-1.5" },
    { industry: "Retail", range: "0.5-1.0" },
    { industry: "Financial Services", range: "2.0-5.0" }
  ],
  warningSignals: [
    "Ratio above industry average",
    "Rising interest expenses",
    "Declining profitability",
    "Cash flow constraints"
  ],
  strategies: [
    "Balance debt usage",
    "Consider equity financing",
    "Improve profitability",
    "Manage working capital",
    "Regular debt restructuring"
  ]
});

export const interestCoverageInterpretation = createRatioInterpretation({
  good: "Higher ratio indicates strong ability to meet interest payments",
  bad: "Lower ratio suggests potential difficulty in servicing debt",
  context: "Interest Coverage Ratio measures how easily a company can pay interest on its outstanding debt.",
  insights: [
    {
      title: "Key Indicators",
      points: [
        "Shows debt servicing capability",
        "Indicates financial health",
        "Important for lenders",
        "Reflects earnings stability"
      ]
    }
  ],
  benchmarks: [
    { industry: "Technology", range: ">3x" },
    { industry: "Manufacturing", range: ">2.5x" },
    { industry: "Retail", range: ">2x" },
    { industry: "Utilities", range: ">1.5x" },
    { industry: "Startups", range: "Variable" }
  ],
  warningSignals: [
    "Ratio below 1.5",
    "Declining trend",
    "Volatile earnings",
    "Rising interest rates"
  ],
  strategies: [
    "Reduce debt levels",
    "Improve EBIT",
    "Refinance high-cost debt",
    "Strengthen operations",
    "Build cash reserves"
  ]
});

export const operatingCashFlowRatioInterpretation = createRatioInterpretation({
  good: "Higher ratio indicates strong ability to cover short-term obligations with operating cash flow",
  bad: "Lower ratio suggests potential liquidity issues",
  context: "Operating Cash Flow Ratio measures how well current liabilities are covered by cash flow from operations.",
  insights: [
    {
      title: "Key Metrics",
      points: [
        "Indicates cash generation strength",
        "Shows short-term debt coverage",
        "Important for liquidity analysis",
        "Reflects operational efficiency"
      ]
    }
  ],
  benchmarks: [
    { industry: "Technology", range: ">1.5x" },
    { industry: "Manufacturing", range: ">1.2x" },
    { industry: "Retail", range: ">1.0x" },
    { industry: "Services", range: ">1.1x" },
    { industry: "Startups", range: "Variable" }
  ],
  warningSignals: [
    "Ratio below 1.0",
    "Declining operating cash flow",
    "Rising current liabilities",
    "Seasonal cash flow issues"
  ],
  strategies: [
    "Improve working capital",
    "Accelerate collections",
    "Manage payables timing",
    "Reduce operating costs",
    "Build cash reserves"
  ]
});

export const ebitdaMarginInterpretation = createRatioInterpretation({
  good: "Higher margin indicates strong operational performance",
  bad: "Lower margin suggests operational inefficiencies",
  context: "EBITDA Margin shows operating profitability before accounting for financial and tax impacts.",
  insights: [
    {
      title: "Key Indicators",
      points: [
        "Measures operational efficiency",
        "Excludes non-operating factors",
        "Important for comparisons",
        "Shows core profitability"
      ]
    }
  ],
  benchmarks: [
    { industry: "Technology", range: "30-40%" },
    { industry: "Manufacturing", range: "15-25%" },
    { industry: "Retail", range: "8-15%" },
    { industry: "Services", range: "20-30%" },
    { industry: "Telecom", range: "35-45%" }
  ],
  warningSignals: [
    "Margin below industry average",
    "Declining trend",
    "High operating costs",
    "Volatile margins"
  ],
  strategies: [
    "Reduce operating costs",
    "Improve pricing strategy",
    "Optimize operations",
    "Scale efficiently",
    "Focus on core business"
  ]
});

export const priceEarningsRatioInterpretation = createRatioInterpretation({
  good: "Reasonable P/E relative to growth prospects and industry",
  bad: "Extremely high or low P/E may indicate risks",
  context: "Price-to-Earnings Ratio measures market value relative to earnings, indicating investor expectations.",
  insights: [
    {
      title: "Key Considerations",
      points: [
        "Reflects market expectations",
        "Indicates growth prospects",
        "Important for valuation",
        "Shows market sentiment"
      ]
    }
  ],
  benchmarks: [
    { industry: "Technology", range: "20-35x" },
    { industry: "Consumer Goods", range: "15-25x" },
    { industry: "Utilities", range: "10-20x" },
    { industry: "Financial", range: "12-18x" },
    { industry: "Healthcare", range: "18-30x" }
  ],
  warningSignals: [
    "P/E significantly above peers",
    "Unsustainable earnings growth",
    "Market volatility",
    "Industry disruption"
  ],
  strategies: [
    "Focus on sustainable growth",
    "Maintain earnings quality",
    "Regular investor communications",
    "Monitor market trends",
    "Manage expectations"
  ]
});

export const priceToBookRatioInterpretation = createRatioInterpretation({
  good: "P/B ratio aligned with industry and growth prospects",
  bad: "Extremely high P/B may indicate overvaluation",
  context: "Price-to-Book Ratio compares market value to book value, indicating market premium over assets.",
  insights: [
    {
      title: "Key Indicators",
      points: [
        "Shows market premium",
        "Indicates asset utilization",
        "Useful for asset-heavy industries",
        "Important for value investors"
      ]
    }
  ],
  benchmarks: [
    { industry: "Technology", range: "3-5x" },
    { industry: "Banking", range: "1-2x" },
    { industry: "Manufacturing", range: "2-3x" },
    { industry: "Retail", range: "2-4x" },
    { industry: "Utilities", range: "1.5-2.5x" }
  ],
  warningSignals: [
    "Ratio below 1.0",
    "Significant premium to peers",
    "Asset quality issues",
    "Market volatility"
  ],
  strategies: [
    "Improve asset efficiency",
    "Maintain strong balance sheet",
    "Regular asset revaluation",
    "Focus on ROE",
    "Consider buybacks when appropriate"
  ]
});

export const operatingMarginInterpretation = createRatioInterpretation({
  good: "Higher margin indicates strong operational efficiency",
  bad: "Lower margin suggests operational challenges",
  context: "Operating Margin shows profitability from core business operations.",
  insights: [
    {
      title: "Key Metrics",
      points: [
        "Measures operational efficiency",
        "Shows pricing power",
        "Indicates cost control",
        "Core performance indicator"
      ]
    }
  ],
  benchmarks: [
    { industry: "Technology", range: "20-30%" },
    { industry: "Manufacturing", range: "10-20%" },
    { industry: "Retail", range: "5-10%" },
    { industry: "Healthcare", range: "15-25%" },
    { industry: "Services", range: "12-18%" }
  ],
  warningSignals: [
    "Margin below industry average",
    "Declining trend",
    "Rising operating costs",
    "Pricing pressure"
  ],
  strategies: [
    "Cost optimization",
    "Pricing strategy review",
    "Operational efficiency",
    "Process automation",
    "Scale operations"
  ]
});

export const assetTurnoverInterpretation = createRatioInterpretation({
  good: "Higher turnover indicates efficient asset utilization",
  bad: "Lower turnover suggests inefficient asset usage",
  context: "Asset Turnover measures how efficiently a company uses its assets to generate sales.",
  insights: [
    {
      title: "Key Indicators",
      points: [
        "Shows asset efficiency",
        "Indicates revenue generation",
        "Important for asset-heavy businesses",
        "Operational effectiveness measure"
      ]
    }
  ],
  benchmarks: [
    { industry: "Retail", range: "2-4x" },
    { industry: "Manufacturing", range: "1-2x" },
    { industry: "Technology", range: "0.7-1.5x" },
    { industry: "Services", range: "1-3x" },
    { industry: "Utilities", range: "0.3-0.5x" }
  ],
  warningSignals: [
    "Declining turnover ratio",
    "Underutilized assets",
    "High maintenance costs",
    "Poor revenue growth"
  ],
  strategies: [
    "Optimize asset usage",
    "Review asset portfolio",
    "Improve sales efficiency",
    "Consider asset light model",
    "Regular asset maintenance"
  ]
});

export const grossProfitMarginAnalysis = analyzeRatioInterpretation(grossProfitMarginInterpretation);
