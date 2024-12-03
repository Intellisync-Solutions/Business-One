import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"

export default function ScenarioPlanner() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Scenario Planning"
        description="Model different business scenarios and analyze potential outcomes"
      />
      
      <div className="grid gap-6 mt-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Scenario Simulator</h2>
          {/* Scenario simulator component will go here */}
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Sensitivity Analysis</h2>
          {/* Sensitivity analysis component will go here */}
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Risk Assessment</h2>
          {/* Risk assessment component will go here */}
        </Card>
      </div>
    </div>
  )
}
