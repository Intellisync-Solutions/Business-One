import { Card } from "@/components/ui/card"
import { PercentageInput, NumberInput } from "./CashFlowFormFields"
import type { GrowthParameters } from "@/types/cashflow"

interface GrowthParametersFormProps {
  parameters: GrowthParameters;
  onChange: (parameters: GrowthParameters) => void;
}

export function GrowthParametersForm({ parameters, onChange }: GrowthParametersFormProps) {
  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Growth Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PercentageInput
            label="Revenue Growth Rate (Annual)"
            value={parameters.revenueGrowthRate}
            onChange={(value) => onChange({ ...parameters, revenueGrowthRate: value })}
            tooltip="Expected annual revenue growth rate"
          />
          <PercentageInput
            label="Expense Growth Rate (Annual)"
            value={parameters.expenseGrowthRate}
            onChange={(value) => onChange({ ...parameters, expenseGrowthRate: value })}
            tooltip="Expected annual expense growth rate including inflation"
          />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Payment Terms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberInput
            label="Accounts Receivable Days"
            value={parameters.accountsReceivableDays}
            onChange={(value) => onChange({ ...parameters, accountsReceivableDays: value })}
            tooltip="Average days to collect payment from customers"
            min={0}
          />
          <NumberInput
            label="Accounts Payable Days"
            value={parameters.accountsPayableDays}
            onChange={(value) => onChange({ ...parameters, accountsPayableDays: value })}
            tooltip="Average days to pay suppliers"
            min={0}
          />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Tax Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PercentageInput
            label="Corporate Tax Rate"
            value={parameters.corporateTaxRate}
            onChange={(value) => onChange({ ...parameters, corporateTaxRate: value })}
            tooltip="Applicable corporate tax rate"
          />
        </div>
      </Card>
    </div>
  )
}
