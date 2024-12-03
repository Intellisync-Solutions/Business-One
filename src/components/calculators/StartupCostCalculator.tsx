import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportButton } from "@/components/common/ExportButton"
import { SaveLoadState } from "@/components/common/SaveLoadState"

interface StartupCost {
  name: string;
  amount: number;
  category: 'oneTime' | 'monthly' | 'inventory';
  description?: string;
}

export function StartupCostCalculator() {
  const [costs, setCosts] = useState<StartupCost[]>([])
  const [newCost, setNewCost] = useState<StartupCost>({
    name: '',
    amount: 0,
    category: 'oneTime'
  })

  const addCost = () => {
    if (newCost.name && newCost.amount > 0) {
      setCosts([...costs, newCost])
      setNewCost({
        name: '',
        amount: 0,
        category: 'oneTime'
      })
    }
  }

  const calculateTotals = () => {
    return {
      oneTime: costs.filter(c => c.category === 'oneTime')
        .reduce((sum, cost) => sum + cost.amount, 0),
      monthly: costs.filter(c => c.category === 'monthly')
        .reduce((sum, cost) => sum + cost.amount, 0),
      inventory: costs.filter(c => c.category === 'inventory')
        .reduce((sum, cost) => sum + cost.amount, 0)
    }
  }

  const totals = calculateTotals()
  const totalStartupCost = totals.oneTime + (totals.monthly * 6) + totals.inventory
  const recommendedBuffer = totalStartupCost * 0.2

  const oneTimeCosts = costs.filter(c => c.category === 'oneTime')
  const monthlyCosts = costs.filter(c => c.category === 'monthly')
  const inventoryCosts = costs.filter(c => c.category === 'inventory')

  const chartData = [
    { name: 'One-Time Costs', value: oneTimeCosts.reduce((sum, cost) => sum + cost.amount, 0) },
    { name: 'Monthly Costs', value: monthlyCosts.reduce((sum, cost) => sum + cost.amount, 0) * 6 },
    { name: 'Initial Inventory', value: inventoryCosts.reduce((sum, cost) => sum + cost.amount, 0) }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <SaveLoadState
          calculatorType="startup-cost"
          currentState={{
            costs,
            totals: calculateTotals(),
            recommendedBuffer: totalStartupCost * 0.2
          }}
          onLoadState={(state) => {
            setCosts(state.costs)
          }}
        />
        <ExportButton
          data={{
            costs,
            totals: calculateTotals(),
            recommendedBuffer: totalStartupCost * 0.2,
            totalRequired: totalStartupCost * 1.2,
            chartData
          }}
          filename="startup-cost-estimate"
          title="Startup Cost Estimate"
          description="Detailed breakdown of startup costs and recommended buffer"
          chartType="pie"
        />
      </div>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="costName">Cost Item</Label>
              <Input
                id="costName"
                value={newCost.name}
                onChange={e => setNewCost({...newCost, name: e.target.value})}
                placeholder="Enter cost item name"
              />
            </div>
            
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={newCost.amount || ''}
                onChange={e => setNewCost({...newCost, amount: parseFloat(e.target.value) || 0})}
                placeholder="Enter amount"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={newCost.category}
                onChange={e => setNewCost({...newCost, category: e.target.value as StartupCost['category']})}
              >
                <option value="oneTime">One-Time Cost</option>
                <option value="monthly">Monthly Cost</option>
                <option value="inventory">Initial Inventory</option>
              </select>
            </div>
          </div>
          
          <Button onClick={addCost} className="w-full">Add Cost</Button>
        </div>
      </Card>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Cost Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Startup Cost Summary</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">One-Time Costs</span>
                  <div className="text-lg font-bold mt-1">
                    ${totals.oneTime.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="p-4 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">Monthly Costs (6 months)</span>
                  <div className="text-lg font-bold mt-1">
                    ${(totals.monthly * 6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="p-4 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">Initial Inventory</span>
                  <div className="text-lg font-bold mt-1">
                    ${totals.inventory.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg">
                  <span className="text-sm font-medium">Total Startup Cost</span>
                  <div className="text-xl font-bold mt-1">
                    ${totalStartupCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-semibold mb-2">Recommended Emergency Fund</h4>
                <div className="text-lg font-bold mb-2">
                  ${recommendedBuffer.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-sm">
                  This buffer (20% of total startup cost) helps cover unexpected expenses and initial operating losses.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Cost Details</h3>
            <div className="space-y-4">
              {costs.map((cost, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                  <div>
                    <div className="font-semibold">{cost.name}</div>
                    <div className="text-sm text-muted-foreground">{cost.category}</div>
                  </div>
                  <div className="text-lg font-bold">
                    ${cost.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
              {costs.length === 0 && (
                <p className="text-muted-foreground">No costs added yet</p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
