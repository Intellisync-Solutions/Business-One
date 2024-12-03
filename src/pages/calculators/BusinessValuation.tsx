import { PageHeader } from "@/components/PageHeader"
import { BusinessValuationCalculator } from "@/components/calculators/BusinessValuationCalculator"

export default function BusinessValuation() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Business Valuation"
        description="Calculate your business value using multiple valuation methods"
      />
      
      <div className="mt-6">
        <BusinessValuationCalculator />
      </div>
    </div>
  )
}
