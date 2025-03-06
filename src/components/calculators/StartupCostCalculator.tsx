import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Tooltip,
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { AlertCircle } from "lucide-react"
import { DataPersistence } from '@/components/common/DataPersistence'
import { useCalculatorData } from '@/hooks/useCalculatorData'
import { StartupCostAnalysis } from './StartupCostAnalysis'


interface StartupCost {
  name: string;
  amount: number;
  category: 'oneTime' | 'monthly' | 'inventory';
  type: 'fixed' | 'variable';
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
      type: 'fixed',
      description: ''
    },
    activeTab: 'input'
  })

  const handleAddCost = () => {
    const { name, amount, category, type, description } = costData.newCost
    
    if (!name.trim()) {
      // Consider adding a toast or error notification
      return
    }
    
    if (amount <= 0) {
      // Consider adding a toast or error notification
      return
    }

    // Optional: Add a maximum number of costs if desired
    const MAX_COSTS = 50; // Adjust as needed
    if (costData.costs.length >= MAX_COSTS) {
      // Consider adding a toast or error notification
      return;
    }

    setCostData({
      ...costData,
      costs: [...costData.costs, { name, amount, category, type, description }],
      newCost: {
        name: '',
        amount: 0,
        category: 'oneTime',
        type: 'fixed',
        description: ''
      }
    });

   
  }

  const handleRemoveCost = (index: number) => {
    setCostData({
      ...costData,
      costs: costData.costs.filter((_, i) => i !== index)
    })
  }

  const handleNewCostChange = (
    field: keyof Pick<StartupCost, 'name' | 'amount' | 'category' | 'type' | 'description'>, 
    value: string | number
  ) => {
    if (field === 'type') {
      setCostData({
        ...costData,
        newCost: {
          ...costData.newCost,
          [field]: value as 'fixed' | 'variable'
        }
      })
    } else {
      setCostData({
        ...costData,
        newCost: {
          ...costData.newCost,
          [field]: value
        }
      })
    }
  }

  const handleTabChange = (value: string): void => {
    setCostData({
      ...costData,
      activeTab: value
    })
  }

  // Calculate totals with expense type
  const oneTimeCosts = {
    fixed: costData.costs
      .filter(cost => cost.category === 'oneTime' && cost.type === 'fixed')
      .reduce((sum, cost) => sum + cost.amount, 0),
    variable: costData.costs
      .filter(cost => cost.category === 'oneTime' && cost.type === 'variable')
      .reduce((sum, cost) => sum + cost.amount, 0),
    total: costData.costs
      .filter(cost => cost.category === 'oneTime')
      .reduce((sum, cost) => sum + cost.amount, 0)
  };

  const monthlyCosts = {
    fixed: costData.costs
      .filter(cost => cost.category === 'monthly' && cost.type === 'fixed')
      .reduce((sum, cost) => sum + cost.amount, 0),
    variable: costData.costs
      .filter(cost => cost.category === 'monthly' && cost.type === 'variable')
      .reduce((sum, cost) => sum + cost.amount, 0),
    total: costData.costs
      .filter(cost => cost.category === 'monthly')
      .reduce((sum, cost) => sum + cost.amount, 0)
  };

  const inventoryCosts = {
    fixed: costData.costs
      .filter(cost => cost.category === 'inventory' && cost.type === 'fixed')
      .reduce((sum, cost) => sum + cost.amount, 0),
    variable: costData.costs
      .filter(cost => cost.category === 'inventory' && cost.type === 'variable')
      .reduce((sum, cost) => sum + cost.amount, 0),
    total: costData.costs
      .filter(cost => cost.category === 'inventory')
      .reduce((sum, cost) => sum + cost.amount, 0)
  };

  // Ensure totals have the exact structure expected by StartupCostAnalysis
  const totals = {
    oneTime: {
      fixed: oneTimeCosts.fixed,
      variable: oneTimeCosts.variable,
      total: oneTimeCosts.total
    },
    monthly: {
      fixed: monthlyCosts.fixed,
      variable: monthlyCosts.variable,
      total: monthlyCosts.total
    },
    inventory: {
      fixed: inventoryCosts.fixed,
      variable: inventoryCosts.variable,
      total: inventoryCosts.total
    }
  };

  const totalStartupCost = totals.oneTime.total + totals.inventory.total
  const monthlyOperatingCost = totals.monthly.total
  const recommendedCashReserve = monthlyOperatingCost * 6 // 6 months reserve
  const totalInitialCapital = totalStartupCost + recommendedCashReserve

  



  // Detailed type assertion with runtime validation
  const validateTotalsStructure = (totalsObj: any) => {
    const categories = ['oneTime', 'monthly', 'inventory'];
    const fields = ['fixed', 'variable', 'total'];
    const errors: string[] = [];

    categories.forEach(category => {
      if (!totalsObj[category]) {
        errors.push(`Missing category: ${category}`);
        return;
      }

      fields.forEach(field => {
        if (typeof totalsObj[category][field] !== 'number') {
          errors.push(`Invalid ${category}.${field}: not a number`);
        }
      });
    });

    if (errors.length > 0) {
      return false;
    }

    return true;
  };

  if (!validateTotalsStructure(totals)) {
    throw new Error('Invalid totals structure');
  }

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

      <Card className="p-6">
        <Tabs value={costData.activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Cost Input</TabsTrigger>
            <TabsTrigger value="summary">Cost Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="input">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="name">Cost Item</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter the name of your expense item (e.g., "Office Rent", "Equipment")</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="name"
                    value={costData.newCost.name}
                    onChange={(e) => handleNewCostChange('name', e.target.value)}
                    placeholder="Enter cost item name"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter the cost amount in dollars</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    value={costData.newCost.amount || ''}
                    onChange={(e) => handleNewCostChange('amount', parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="category">Category</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>One-Time: Initial expenses<br/>Monthly: Recurring costs<br/>Inventory: Initial stock</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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

                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="type">Type</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fixed: Constant costs<br/>Variable: Costs that change with business activity</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <select
                    id="type"
                    className="w-full px-3 py-2 border rounded-md"
                    value={costData.newCost.type}
                    onChange={(e) => handleNewCostChange('type', e.target.value)}
                  >
                    <option value="fixed">Fixed</option>
                    <option value="variable">Variable</option>
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
                        <span className="text-sm text-muted-foreground ml-2">
                          ({cost.type === 'fixed' ? 'Fixed' : 'Variable'})
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
                  <h3 className="font-semibold mb-4">One-Time Costs Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Fixed One-Time Costs:</span>
                      <span className="font-medium">${totals.oneTime.fixed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variable One-Time Costs:</span>
                      <span className="font-medium">${totals.oneTime.variable.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-bold">Total One-Time Costs:</span>
                      <span className="font-bold">${totals.oneTime.total.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Monthly Costs Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Fixed Monthly Costs:</span>
                      <span className="font-medium">${totals.monthly.fixed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variable Monthly Costs:</span>
                      <span className="font-medium">${totals.monthly.variable.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-bold">Total Monthly Costs:</span>
                      <span className="font-bold">${totals.monthly.total.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Inventory Costs Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Fixed Inventory Costs:</span>
                      <span className="font-medium">${totals.inventory.fixed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variable Inventory Costs:</span>
                      <span className="font-medium">${totals.inventory.variable.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-bold">Total Inventory Costs:</span>
                      <span className="font-bold">${totals.inventory.total.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-4">
                <h3 className="font-semibold mb-4">Financial Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Startup Cost:</span>
                    <span className="font-medium">${totalStartupCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Operating Cost:</span>
                    <span className="font-medium">${monthlyOperatingCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recommended Cash Reserve (6 months):</span>
                    <span className="font-medium">${recommendedCashReserve.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">Total Initial Capital Required:</span>
                    <span className="font-bold">${totalInitialCapital.toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              {costData.costs.length > 0 ? (
                <StartupCostAnalysis 
                  costs={totals}
                  metrics={{
                    totalStartupCost,
                    monthlyOperatingCost,
                    recommendedCashReserve,
                    totalInitialCapital
                  }}
                />
              ) : (
                <div className="text-muted-foreground p-4 text-center">
                  Add some costs to generate an analysis
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
