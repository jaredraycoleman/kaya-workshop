#!/usr/bin/env npx tsx
/**
 * List guests with optional filtering
 * Usage: npm run guests
 * Usage: npm run guests -- --status Accepted
 * Usage: npm run guests -- --tag "CS"
 * Usage: npm run guests -- --confirmed
 */

import { data } from "../src/lib/data"
import type { GuestStatus } from "../src/lib/types"

function parseArgs() {
  const args = process.argv.slice(2)
  const options: {
    status?: GuestStatus
    tag?: string
    confirmed?: boolean
  } = {}

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--status" && args[i + 1]) {
      options.status = args[i + 1] as GuestStatus
      i++
    } else if (args[i] === "--tag" && args[i + 1]) {
      options.tag = args[i + 1]
      i++
    } else if (args[i] === "--confirmed") {
      options.confirmed = true
    }
  }

  return options
}

function main() {
  const options = parseArgs()
  let guests = [...data.guests]

  if (options.confirmed) {
    guests = guests.filter(
      (g) => g.status === "Accepted" || g.status === "Accepted (Tentative)"
    )
  } else if (options.status) {
    guests = guests.filter((g) => g.status === options.status)
  }

  if (options.tag) {
    const tagLower = options.tag.toLowerCase()
    guests = guests.filter((g) => g.tags?.toLowerCase().includes(tagLower))
  }

  guests.sort((a, b) => a.name.localeCompare(b.name))

  if (guests.length === 0) {
    console.log("No guests found matching criteria.")
    return
  }

  // Print header
  console.log(
    `${"Name".padEnd(30)} ${"Affiliation".padEnd(35)} ${"Status".padEnd(20)} ${"Stipend".padStart(10)}`
  )
  console.log("-".repeat(97))

  // Print guests
  for (const g of guests) {
    const stipend = g.stipend ? `$${g.stipend.toLocaleString()}` : "-"
    console.log(
      `${g.name.padEnd(30)} ${(g.affiliation || "").padEnd(35)} ${g.status.padEnd(20)} ${stipend.padStart(10)}`
    )
  }

  console.log(`\nTotal: ${guests.length} guests`)
}

main()
