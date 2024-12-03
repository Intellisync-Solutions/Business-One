import { PageHeader } from "@/components/PageHeader"
import { PricingStrategyCalculator } from "@/components/calculators/PricingStrategyCalculator"

export default function PricingStrategy() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Pricing Strategy"
        description="Optimize your pricing strategy based on costs, market conditions, and competition"
      />
      
      <div className="mt-6">
        <PricingStrategyCalculator />
      </div>
    </div>
  )
}
