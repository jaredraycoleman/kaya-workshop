#!/usr/bin/env npx tsx
/**
 * Show workshop status summary
 * Usage: npm run status
 */

import { data } from "../src/lib/data"
import type { Guest, GuestStatus } from "../src/lib/types"

function getGuestSummary() {
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

function getBudgetSummary() {
  const budget: Record<string, number> = {}
  for (const b of data.budget) {
    budget[b.item] = b.amount
  }

  const confirmedGuests = data.guests.filter(
    (g) => g.status === "Accepted" || g.status === "Accepted (Tentative)"
  )
  const committedStipends = confirmedGuests.reduce((sum, g) => sum + g.stipend, 0)

  const participantBudget = budget["Participant Travel"] || 18751
  const total = budget["Total"] || 50000

  const remaining = participantBudget - committedStipends
  const avgStipend = 1125
  const estimated = Math.floor(remaining / avgStipend)

  return {
    totalBudget: total,
    participantTravelBudget: participantBudget,
    participantTravelCommitted: committedStipends,
    participantTravelRemaining: remaining,
    confirmedCount: confirmedGuests.length,
    estimatedAdditionalParticipants: estimated,
  }
}

function main() {
  const guestSummary = getGuestSummary()
  const budgetSummary = getBudgetSummary()

  console.log("==================================================")
  console.log("WORKSHOP STATUS")
  console.log("==================================================")

  console.log(`\n📋 GUESTS (${guestSummary.total} total)`)
  console.log(`   ✅ Confirmed: ${guestSummary.confirmed}`)
  console.log(`      - Accepted: ${guestSummary.accepted}`)
  console.log(`      - Tentative: ${guestSummary.acceptedTentative}`)
  console.log(`   📨 Invited: ${guestSummary.invited}`)
  console.log(`   📝 Planned: ${guestSummary.planned}`)
  console.log(`   💡 Proposed: ${guestSummary.proposed}`)
  console.log(`   ❌ Declined/No Response: ${guestSummary.declined + guestSummary.noResponse}`)

  console.log(`\n💰 BUDGET`)
  console.log(`   Total: $${budgetSummary.totalBudget.toLocaleString()}`)
  console.log(`\n   Participant Travel:`)
  console.log(`      Budget:    $${budgetSummary.participantTravelBudget.toLocaleString()}`)
  console.log(`      Committed: $${budgetSummary.participantTravelCommitted.toLocaleString()}`)
  console.log(`      Remaining: $${budgetSummary.participantTravelRemaining.toLocaleString()}`)
  console.log(`\n   → Can invite ~${budgetSummary.estimatedAdditionalParticipants} more participants`)
}

main()
