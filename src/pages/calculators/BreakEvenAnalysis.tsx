import { PageHeader } from "@/components/PageHeader"
import { BreakEvenCalculator } from "@/components/calculators/BreakEvenCalculator"

export default function BreakEvenAnalysis() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Break-Even Analysis"
        description="Calculate your break-even point and analyze different pricing scenarios"
      />
      
      <div className="grid gap-6 mt-6">
        <BreakEvenCalculator />
      </div>
    </div>
  )
}
