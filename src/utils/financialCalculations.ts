export const validateNonZeroDenominator = (value: number, errorMessage: string) => {
  if (value === 0) {
    throw new Error(errorMessage);
  }
};

export const formatters = {
  percentage: (value: number) => value.toFixed(2) + '%',
  ratio: (value: number) => value.toFixed(2),
  currency: (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' }),
  times: (value: number) => value.toFixed(2) + 'x'
};

export const commonInputs = {
  currentAssets: {
    name: "currentAssets",
    label: "Current Assets ($)",
    placeholder: "Enter current assets",
    tooltip: "Total value of all current assets including cash, accounts receivable, inventory, and other liquid assets",
    min: 0,
    required: true
  },
  currentLiabilities: {
    name: "currentLiabilities",
    label: "Current Liabilities ($)",
    placeholder: "Enter current liabilities",
    tooltip: "Total value of all short-term financial obligations due within one year",
    min: 0,
    required: true
  },
  netIncome: {
    name: "netIncome",
    label: "Net Income ($)",
    placeholder: "Enter net income",
    tooltip: "Total profit after all expenses, taxes, and interest",
    min: 0,
    required: true
  },
  revenue: {
    name: "revenue",
    label: "Revenue ($)",
    placeholder: "Enter total revenue",
    tooltip: "Total sales revenue before any deductions",
    min: 0,
    required: true
  }
};
