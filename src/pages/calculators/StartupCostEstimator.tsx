import { PageHeader } from "@/components/PageHeader"
import { StartupCostCalculator } from "@/components/calculators/StartupCostCalculator"

export default function StartupCostEstimator() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Startup Cost Estimator"
        description="Calculate and plan your initial business costs and required capital"
      />
      
      <div className="mt-6">
        <StartupCostCalculator />
      </div>
    </div>
  )
}
