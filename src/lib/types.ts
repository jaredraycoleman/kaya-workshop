export type GuestStatus =
  | "Accepted"
  | "Accepted (Tentative)"
  | "Invited"
  | "Planned"
  | "Proposed"
  | "Declined"
  | "No Response"

export type GuestType = "Organizer" | "Invited Speaker" | "Participant" | "Undecided"

export interface Guest {
  id: number
  name: string
  affiliation: string | null
  status: GuestStatus
  type: GuestType | null
  notes: string | null
  tags: string | null
  email: string | null
  proposed_by: string | null
  area: string | null
  stipend: number
  honorarium: number
}

export interface Organizer {
  id: number
  name: string
  affiliation: string | null
  email: string | null
  email_secondary: string | null
}

export interface BudgetItem {
  id: number
  item: string
  amount: number
  notes: string | null
}

export interface TravelCost {
  id: number
  origin: string
  avg_fare: number
}

export interface StateTravelCost {
  state: string
  avgFare: number
  minFare: number
  maxFare: number
  stipendTier: 250 | 500 | 750
}

export interface TopicRecommendation {
  id: number
  event: string
  type: string | null
  suggested_by: string | null
  notes: string | null
}

export interface ScheduleEvent {
  id: number
  day: string | null
  start_time: string | null
  end_time: string | null
  event: string | null
}

export interface WorkshopData {
  guests: Guest[]
  organizers: Organizer[]
  budget: BudgetItem[]
  travel_costs: TravelCost[]
  topics: TopicRecommendation[]
  schedule: ScheduleEvent[]
}

// Summary types
export interface GuestSummary {
  total: number
  accepted: number
  acceptedTentative: number
  invited: number
  planned: number
  proposed: number
  declined: number
  noResponse: number
  confirmed: number
}

export interface BudgetSummary {
  totalBudget: number
  participantTravelBudget: number
  participantTravelCommitted: number
  participantTravelRemaining: number
  speakerFeesBudget: number
  speakerFeesCommitted: number
  speakerTravelBudget: number
  speakerTravelCommitted: number
  confirmedCount: number
  estimatedAdditionalParticipants: number
}
