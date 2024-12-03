import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"

export default function StartupCostEstimator() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Startup Cost Estimator"
        description="Calculate initial costs, funding requirements, and startup runway"
      />
      
      <div className="grid gap-6 mt-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Initial Costs Calculator</h2>
          {/* Initial costs calculator component will go here */}
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Runway Calculator</h2>
          {/* Runway calculator component will go here */}
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Emergency Fund Planner</h2>
          {/* Emergency fund component will go here */}
        </Card>
      </div>
    </div>
  )
}
