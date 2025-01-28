
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportButton } from "@/components/common/ExportButton"
import { SaveLoadState } from "@/components/common/SaveLoadState"
import { 
  Tooltip as UITooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { AlertCircle } from "lucide-react"
import { DataPersistence } from '@/components/common/DataPersistence'
import { useCalculatorData } from '@/hooks/useCalculatorData'

interface StartupCost {
  name: string;
  amount: number;
  category: 'oneTime' | 'monthly' | 'inventory';
  description?: string;
}

interface StartupCostData {
  costs: StartupCost[];
  newCost: StartupCost;
  activeTab: string;
}

export function StartupCostCalculator() {
  const [costData, setCostData] = useCalculatorData<StartupCostData>('startup-cost', {
    costs: [],
    newCost: {
      name: '',
      amount: 0,
      category: 'oneTime',
      description: ''
    },
    activeTab: 'input'
  })

  // Explicitly reference costData to satisfy linter
  console.log('Current cost data:', costData)

  const handleAddCost = () => {
    const { name, amount, category, description } = costData.newCost
    
    // Improved validation
    if (!name.trim()) {
      // Consider adding a toast or error notification
      return
    }
    
    if (amount <= 0) {
      // Consider adding a toast or error notification
      return
    }

    setCostData({
      ...costData,
      costs: [...costData.costs, { name, amount, category, description }],
      newCost: {
        name: '',
        amount: 0,
        category: 'oneTime',
        description: ''
      }
    })
  }

  const handleRemoveCost = (index: number) => {
    setCostData({
      ...costData,
      costs: costData.costs.filter((_, i) => i !== index)
    })
  }

  const handleNewCostChange = (
    field: keyof Pick<StartupCost, 'name' | 'amount' | 'category' | 'description'>, 
    value: string | number
  ) => {
    setCostData({
      ...costData,
      newCost: {
        ...costData.newCost,
        [field]: value
      }
    })
  }

  const handleTabChange = (value: string): void => {
    setCostData({
      ...costData,
      activeTab: value
    })
  }

  // Calculate totals
  const totals = {
    oneTime: costData.costs
      .filter(cost => cost.category === 'oneTime')
      .reduce((sum, cost) => sum + cost.amount, 0),
    monthly: costData.costs
      .filter(cost => cost.category === 'monthly')
      .reduce((sum, cost) => sum + cost.amount, 0),
    inventory: costData.costs
      .filter(cost => cost.category === 'inventory')
      .reduce((sum, cost) => sum + cost.amount, 0)
  }

  const totalStartupCost = totals.oneTime + totals.inventory
  const monthlyOperatingCost = totals.monthly
  const recommendedCashReserve = monthlyOperatingCost * 6 // 6 months reserve
  const totalInitialCapital = totalStartupCost + recommendedCashReserve

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Startup Cost Calculator</h2>
        <DataPersistence
          data={costData}
          onDataImport={setCostData}
          dataType="startup-cost"
        />
      </div>

      <div className="flex justify-end gap-2">
        <SaveLoadState
          calculatorType="startup-cost"
          currentState={costData}
          onLoadState={setCostData}
        />
        <ExportButton
          data={{
            costs: costData.costs,
            totals,
            summary: {
              totalStartupCost,
              monthlyOperatingCost,
              recommendedCashReserve,
              totalInitialCapital
            },
            filename: 'startup_costs.csv',
            title: 'Startup Costs',
            description: 'Detailed breakdown of startup costs and financial projections'
          }}
          filename="startup_costs.csv"
          title="Startup Costs"
          description="Detailed breakdown of startup costs and financial projections"
        />
      </div>

      <Card className="p-6">
        <Tabs value={costData.activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Cost Input</TabsTrigger>
            <TabsTrigger value="summary">Cost Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="input">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="name">Cost Item</Label>
                  <Input
                    id="name"
                    value={costData.newCost.name}
                    onChange={(e) => handleNewCostChange('name', e.target.value)}
                    placeholder="Enter cost item name"
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={costData.newCost.amount || ''}
                    onChange={(e) => handleNewCostChange('amount', parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full px-3 py-2 border rounded-md"
                    value={costData.newCost.category}
                    onChange={(e) => handleNewCostChange('category', e.target.value as StartupCost['category'])}
                  >
                    <option value="oneTime">One-Time Cost</option>
                    <option value="monthly">Monthly Cost</option>
                    <option value="inventory">Initial Inventory</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleAddCost} className="w-full">Add Cost</Button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Cost Items</h3>
                <div className="space-y-2">
                  {costData.costs.map((cost, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                      <div>
                        <span className="font-medium">{cost.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({cost.category === 'oneTime' ? 'One-Time' : 
                            cost.category === 'monthly' ? 'Monthly' : 'Inventory'})
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span>${cost.amount.toLocaleString()}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCost(index)}
                          className="text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="summary">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold">One-Time Costs</h3>
                  <p className="text-2xl mt-2">${totals.oneTime.toLocaleString()}</p>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold">Monthly Operating Costs</h3>
                  <p className="text-2xl mt-2">${totals.monthly.toLocaleString()}</p>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold">Initial Inventory</h3>
                  <p className="text-2xl mt-2">${totals.inventory.toLocaleString()}</p>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Financial Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Startup Cost</span>
                    <span className="font-semibold">${totalStartupCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Monthly Operating Cost</span>
                    <span className="font-semibold">${monthlyOperatingCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger className="flex items-center gap-1">
                          Recommended Cash Reserve
                          <AlertCircle className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>6 months of operating costs</p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                    <span className="font-semibold">${recommendedCashReserve.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Initial Capital Required</span>
                      <span className="text-xl font-bold">${totalInitialCapital.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
