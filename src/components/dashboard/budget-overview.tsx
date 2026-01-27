import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getBudgetSummary } from "@/lib/data"

export function BudgetOverview() {
  const budget = getBudgetSummary()

  const items = [
    {
      label: "Participant Travel",
      committed: budget.participantTravelCommitted,
      total: budget.participantTravelBudget,
    },
    {
      label: "Speaker Fees",
      committed: budget.speakerFeesCommitted,
      total: budget.speakerFeesBudget,
    },
    {
      label: "Speaker Travel",
      committed: budget.speakerTravelCommitted,
      total: budget.speakerTravelBudget,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total Budget: ${budget.totalBudget.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {items.map((item) => {
          const percentage = (item.committed / item.total) * 100
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground">
                  ${item.committed.toLocaleString()} / ${item.total.toLocaleString()}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
