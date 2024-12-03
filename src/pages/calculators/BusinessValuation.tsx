import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"

export default function BusinessValuation() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Business Valuation"
        description="Calculate your business value using various valuation methods"
      />
      
      <div className="grid gap-6 mt-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">DCF Valuation</h2>
          {/* DCF calculator component will go here */}
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Market Multiple Analysis</h2>
          {/* Market multiple component will go here */}
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Asset-Based Valuation</h2>
          {/* Asset-based valuation component will go here */}
        </Card>
      </div>
    </div>
  )
}
