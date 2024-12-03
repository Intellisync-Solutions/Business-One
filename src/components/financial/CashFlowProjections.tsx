import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import type { CashFlowProjection } from "@/types/cashflow"
import { formatCurrency } from '@/utils/currency'

interface ProjectionsDisplayProps {
  projections: CashFlowProjection[];
}

export function ProjectionsDisplay({ projections }: ProjectionsDisplayProps) {
  const getProjectionsForPeriod = (months: number) => {
    const periodProjections = projections.slice(0, months)
    const totalRevenue = periodProjections.reduce((sum, p) => sum + p.revenue, 0)
    const totalExpenses = periodProjections.reduce((sum, p) => sum + p.expenses, 0)
    const netCashFlow = totalRevenue - totalExpenses
    const averageMonthlyRevenue = totalRevenue / periodProjections.length
    const averageMonthlyExpenses = totalExpenses / periodProjections.length
    const averageMonthlyNetCashFlow = netCashFlow / periodProjections.length

    return {
      projections: periodProjections,
      summary: {
        totalRevenue,
        totalExpenses,
        netCashFlow,
        averageMonthlyRevenue,
        averageMonthlyExpenses,
        averageMonthlyNetCashFlow
      }
    }
  }

  const timeframes = [
    { label: "1 Year", months: 12 },
    { label: "2 Years", months: 24 },
    { label: "3 Years", months: 36 },
    { label: "5 Years", months: 60 }
  ]

  const ProjectionContent = ({ months }: { months: number }) => {
    const { projections: periodProjections, summary } = getProjectionsForPeriod(months)
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground">Total Revenue</h4>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
            <p className="text-sm text-muted-foreground">
              Avg. Monthly: {formatCurrency(summary.averageMonthlyRevenue)}
            </p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground">Total Expenses</h4>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</p>
            <p className="text-sm text-muted-foreground">
              Avg. Monthly: {formatCurrency(summary.averageMonthlyExpenses)}
            </p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground">Net Cash Flow</h4>
            <p className="text-2xl font-bold">{formatCurrency(summary.netCashFlow)}</p>
            <p className="text-sm text-muted-foreground">
              Avg. Monthly: {formatCurrency(summary.averageMonthlyNetCashFlow)}
            </p>
          </Card>
        </div>

        <Card>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Expenses</TableHead>
                  <TableHead>Net Cash Flow</TableHead>
                  <TableHead>Cumulative Cash Flow</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periodProjections.map((projection) => (
                  <TableRow key={projection.month}>
                    <TableCell>{projection.month}</TableCell>
                    <TableCell>{formatCurrency(projection.revenue)}</TableCell>
                    <TableCell>{formatCurrency(projection.expenses)}</TableCell>
                    <TableCell>{formatCurrency(projection.netCashFlow)}</TableCell>
                    <TableCell>{formatCurrency(projection.cumulativeCashFlow)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </div>
    )
  }

  return (
    <Tabs defaultValue="12" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        {timeframes.map(({ label, months }) => (
          <TabsTrigger key={months} value={months.toString()}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {timeframes.map(({ months }) => (
        <TabsContent key={months} value={months.toString()}>
          <ProjectionContent months={months} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
