#!/usr/bin/env npx tsx
/**
 * Find a guest by name
 * Usage: npm run find -- "Howard"
 */

import { data } from "../src/lib/data"

function main() {
  const searchTerm = process.argv[2]

  if (!searchTerm) {
    console.error("Usage: npm run find -- <name>")
    process.exit(1)
  }

  const searchLower = searchTerm.toLowerCase()
  const matches = data.guests.filter((g) =>
    g.name.toLowerCase().includes(searchLower)
  )

  if (matches.length === 0) {
    console.log(`No guests found matching "${searchTerm}"`)
    return
  }

  for (const guest of matches) {
    console.log(`\n${guest.name}`)
    console.log("=".repeat(guest.name.length))
    console.log(`Affiliation: ${guest.affiliation || "N/A"}`)
    console.log(`Status:      ${guest.status}`)
    console.log(`Type:        ${guest.type || "N/A"}`)
    console.log(`Email:       ${guest.email || "N/A"}`)
    console.log(`Tags:        ${guest.tags || "N/A"}`)
    console.log(`Area:        ${guest.area || "N/A"}`)
    console.log(`Proposed by: ${guest.proposed_by || "N/A"}`)
    console.log(`Stipend:     $${guest.stipend.toLocaleString()}`)
    console.log(`Honorarium:  $${guest.honorarium.toLocaleString()}`)
    if (guest.notes) {
      console.log(`Notes:       ${guest.notes}`)
    }
  }

  if (matches.length > 1) {
    console.log(`\n(${matches.length} matches found)`)
  }
}

main()
