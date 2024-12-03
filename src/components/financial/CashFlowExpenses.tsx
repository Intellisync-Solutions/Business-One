import { Card } from "@/components/ui/card"
import { CurrencyInput } from "./CashFlowFormFields"
import type { FixedExpenses, VariableExpenses, OneTimeExpenses, FinancialObligations } from "@/types/cashflow"

interface ExpensesFormProps {
  fixedExpenses: FixedExpenses;
  variableExpenses: VariableExpenses;
  oneTimeExpenses: OneTimeExpenses;
  financialObligations: FinancialObligations;
  onFixedExpensesChange: (expenses: FixedExpenses) => void;
  onVariableExpensesChange: (expenses: VariableExpenses) => void;
  onOneTimeExpensesChange: (expenses: OneTimeExpenses) => void;
  onFinancialObligationsChange: (obligations: FinancialObligations) => void;
}

export function ExpensesForm({
  fixedExpenses,
  variableExpenses,
  oneTimeExpenses,
  financialObligations,
  onFixedExpensesChange,
  onVariableExpensesChange,
  onOneTimeExpensesChange,
  onFinancialObligationsChange
}: ExpensesFormProps) {
  return (
    <div className="space-y-6">
      {/* Fixed Expenses */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Fixed Expenses (Monthly)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CurrencyInput
            label="Rent/Mortgage"
            value={fixedExpenses.rent}
            onChange={(value) => onFixedExpensesChange({ ...fixedExpenses, rent: value })}
            tooltip="Monthly rent or mortgage payment for business premises"
          />
          <CurrencyInput
            label="Salaries and Wages"
            value={fixedExpenses.salaries}
            onChange={(value) => onFixedExpensesChange({ ...fixedExpenses, salaries: value })}
            tooltip="Total monthly payroll expenses"
          />
          <CurrencyInput
            label="Insurance"
            value={fixedExpenses.insurance}
            onChange={(value) => onFixedExpensesChange({ ...fixedExpenses, insurance: value })}
            tooltip="Monthly insurance premiums including business, liability, and health insurance"
          />
          <CurrencyInput
            label="Utilities"
            value={fixedExpenses.utilities}
            onChange={(value) => onFixedExpensesChange({ ...fixedExpenses, utilities: value })}
            tooltip="Monthly utilities including electricity, water, internet, and phone"
          />
          <CurrencyInput
            label="Software Subscriptions"
            value={fixedExpenses.softwareSubscriptions}
            onChange={(value) => onFixedExpensesChange({ ...fixedExpenses, softwareSubscriptions: value })}
            tooltip="Monthly software and SaaS subscriptions"
          />
        </div>
      </Card>

      {/* Variable Expenses */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Variable Expenses (Monthly Average)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CurrencyInput
            label="Cost of Goods Sold (COGS)"
            value={variableExpenses.cogs}
            onChange={(value) => onVariableExpensesChange({ ...variableExpenses, cogs: value })}
            tooltip="Monthly materials, labor, and overhead costs"
          />
          <CurrencyInput
            label="Marketing and Advertising"
            value={variableExpenses.marketing}
            onChange={(value) => onVariableExpensesChange({ ...variableExpenses, marketing: value })}
            tooltip="Monthly marketing expenses including ad spend and campaigns"
          />
          <CurrencyInput
            label="Sales Commissions"
            value={variableExpenses.salesCommissions}
            onChange={(value) => onVariableExpensesChange({ ...variableExpenses, salesCommissions: value })}
            tooltip="Monthly sales commission payments"
          />
          <CurrencyInput
            label="Supplies and Materials"
            value={variableExpenses.supplies}
            onChange={(value) => onVariableExpensesChange({ ...variableExpenses, supplies: value })}
            tooltip="Monthly operational supplies and materials"
          />
        </div>
      </Card>

      {/* One-Time Expenses */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">One-Time Expenses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CurrencyInput
            label="Startup Costs"
            value={oneTimeExpenses.startupCosts}
            onChange={(value) => onOneTimeExpensesChange({ ...oneTimeExpenses, startupCosts: value })}
            tooltip="Initial costs including legal fees and registration"
          />
          <CurrencyInput
            label="Capital Expenditures"
            value={oneTimeExpenses.capitalExpenditures}
            onChange={(value) => onOneTimeExpensesChange({ ...oneTimeExpenses, capitalExpenditures: value })}
            tooltip="Long-term asset purchases like machinery or software licenses"
          />
          <CurrencyInput
            label="Legal and Licensing"
            value={oneTimeExpenses.legalAndLicensing}
            onChange={(value) => onOneTimeExpensesChange({ ...oneTimeExpenses, legalAndLicensing: value })}
            tooltip="Patents, trademarks, and licensing fees"
          />
        </div>
      </Card>

      {/* Financial Obligations */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Financial Obligations (Monthly)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CurrencyInput
            label="Loan Repayments"
            value={financialObligations.loanRepayments}
            onChange={(value) => onFinancialObligationsChange({ ...financialObligations, loanRepayments: value })}
            tooltip="Monthly loan principal payments"
          />
          <CurrencyInput
            label="Interest Payments"
            value={financialObligations.interestPayments}
            onChange={(value) => onFinancialObligationsChange({ ...financialObligations, interestPayments: value })}
            tooltip="Monthly interest payments on loans"
          />
          <CurrencyInput
            label="Taxes"
            value={financialObligations.taxes}
            onChange={(value) => onFinancialObligationsChange({ ...financialObligations, taxes: value })}
            tooltip="Monthly tax obligations including corporate and payroll taxes"
          />
        </div>
      </Card>
    </div>
  )
}
