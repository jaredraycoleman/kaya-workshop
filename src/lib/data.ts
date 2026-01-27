import workshopData from "../../data/workshop.json"
import stateTravelCosts from "../../data/travel_costs_by_state.json"
import type {
  WorkshopData,
  Guest,
  GuestSummary,
  BudgetSummary,
  GuestStatus,
  StateTravelCost,
} from "./types"

export const data = workshopData as WorkshopData
export const travelCostsByState = stateTravelCosts as StateTravelCost[]

export function getGuests(options?: {
  status?: GuestStatus | GuestStatus[]
  tag?: string
  confirmedOnly?: boolean
}): Guest[] {
  let guests = [...data.guests]

  if (options?.confirmedOnly) {
    guests = guests.filter(
      (g) => g.status === "Accepted" || g.status === "Accepted (Tentative)"
    )
  } else if (options?.status) {
    const statuses = Array.isArray(options.status)
      ? options.status
      : [options.status]
    guests = guests.filter((g) => statuses.includes(g.status))
  }

  if (options?.tag) {
    const tagLower = options.tag.toLowerCase()
    guests = guests.filter((g) =>
      g.tags?.toLowerCase().includes(tagLower)
    )
  }

  return guests.sort((a, b) => a.name.localeCompare(b.name))
}

export function getGuestSummary(): GuestSummary {
  const guests = data.guests
  const counts: Record<string, number> = {}

  for (const g of guests) {
    counts[g.status] = (counts[g.status] || 0) + 1
  }

  const accepted = counts["Accepted"] || 0
  const acceptedTentative = counts["Accepted (Tentative)"] || 0

  return {
    total: guests.length,
    accepted,
    acceptedTentative,
    invited: counts["Invited"] || 0,
    planned: counts["Planned"] || 0,
    proposed: counts["Proposed"] || 0,
    declined: counts["Declined"] || 0,
    noResponse: counts["No Response"] || 0,
    confirmed: accepted + acceptedTentative,
  }
}

export function getBudgetSummary(): BudgetSummary {
  const budget: Record<string, number> = {}
  for (const b of data.budget) {
    budget[b.item] = b.amount
  }

  const confirmedGuests = getGuests({ confirmedOnly: true })
  const committedStipends = confirmedGuests.reduce((sum, g) => sum + g.stipend, 0)
  const committedHonoraria = confirmedGuests.reduce(
    (sum, g) => sum + g.honorarium,
    0
  )

  const participantBudget = budget["Participant Travel"] || 18751
  const speakerFeesBudget = budget["Speaker Fees"] || 6750
  const speakerTravelBudget = budget["Speaker Travel"] || 11250
  const total = budget["Total"] || 50000

  const remaining = participantBudget - committedStipends
  const avgStipend = 1125
  const estimated = Math.floor(remaining / avgStipend)

  return {
    totalBudget: total,
    participantTravelBudget: participantBudget,
    participantTravelCommitted: committedStipends,
    participantTravelRemaining: remaining,
    speakerFeesBudget: speakerFeesBudget,
    speakerFeesCommitted: committedHonoraria,
    speakerTravelBudget: speakerTravelBudget,
    speakerTravelCommitted: 0,
    confirmedCount: confirmedGuests.length,
    estimatedAdditionalParticipants: estimated,
  }
}

export function getTagCounts(confirmedOnly: boolean = false): Record<string, number> {
  const guests = confirmedOnly ? getGuests({ confirmedOnly: true }) : data.guests
  const counts: Record<string, number> = {}

  for (const g of guests) {
    if (g.tags) {
      const tags = g.tags.split(",").map((t) => t.trim())
      for (const tag of tags) {
        if (tag) {
          counts[tag] = (counts[tag] || 0) + 1
        }
      }
    }
  }

  return counts
}

export function getStatusChartData() {
  const summary = getGuestSummary()
  return [
    { name: "Accepted", value: summary.accepted, fill: "hsl(142, 76%, 36%)" },
    { name: "Tentative", value: summary.acceptedTentative, fill: "hsl(38, 92%, 50%)" },
    { name: "Invited", value: summary.invited, fill: "hsl(217, 91%, 60%)" },
    { name: "Planned", value: summary.planned, fill: "hsl(262, 83%, 58%)" },
    { name: "Proposed", value: summary.proposed, fill: "hsl(215, 14%, 34%)" },
    { name: "Declined/No Response", value: summary.declined + summary.noResponse, fill: "hsl(0, 84%, 60%)" },
  ].filter((d) => d.value > 0)
}

export function getBudgetChartData() {
  const summary = getBudgetSummary()
  return [
    {
      category: "Participant Travel",
      committed: summary.participantTravelCommitted,
      remaining: summary.participantTravelRemaining,
    },
    {
      category: "Speaker Fees",
      committed: summary.speakerFeesCommitted,
      remaining: summary.speakerFeesBudget - summary.speakerFeesCommitted,
    },
    {
      category: "Speaker Travel",
      committed: summary.speakerTravelCommitted,
      remaining: summary.speakerTravelBudget - summary.speakerTravelCommitted,
    },
  ]
}
