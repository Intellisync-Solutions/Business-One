import { PageHeader } from "@/components/PageHeader"
import { ScenarioPlannerCalculator } from "@/components/calculators/ScenarioPlannerCalculator"

export default function ScenarioPlanner() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Scenario Planner"
        description="Model different business scenarios and analyze their potential outcomes"
      />
      
      <div className="mt-6">
        <ScenarioPlannerCalculator />
      </div>
    </div>
  )
}
