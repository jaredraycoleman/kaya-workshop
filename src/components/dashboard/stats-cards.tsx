import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getGuestSummary, getBudgetSummary } from "@/lib/data"
import { Users, Mail, ListTodo, DollarSign } from "lucide-react"

export function StatsCards() {
  const guestSummary = getGuestSummary()
  const budgetSummary = getBudgetSummary()

  const cards = [
    {
      title: "Confirmed",
      value: guestSummary.confirmed,
      description: `${guestSummary.accepted} accepted + ${guestSummary.acceptedTentative} tentative`,
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Awaiting Response",
      value: guestSummary.invited,
      description: "Invitations sent",
      icon: Mail,
      color: "text-blue-500",
    },
    {
      title: "Pipeline",
      value: guestSummary.planned + guestSummary.proposed,
      description: `${guestSummary.planned} planned + ${guestSummary.proposed} proposed`,
      icon: ListTodo,
      color: "text-purple-500",
    },
    {
      title: "Travel Budget Remaining",
      value: `$${budgetSummary.participantTravelRemaining.toLocaleString()}`,
      description: `~${budgetSummary.estimatedAdditionalParticipants} more participants`,
      icon: DollarSign,
      color: "text-amber-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
