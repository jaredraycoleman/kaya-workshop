#!/usr/bin/env npx tsx
/**
 * Update a guest's status
 * Usage: npm run update-status -- "Howard Paden" "Accepted"
 */

import * as fs from "fs"
import * as path from "path"
import type { WorkshopData, GuestStatus } from "../src/lib/types"

const DATA_PATH = path.join(import.meta.dirname, "../data/workshop.json")

const VALID_STATUSES: GuestStatus[] = [
  "Accepted",
  "Accepted (Tentative)",
  "Invited",
  "Planned",
  "Proposed",
  "Declined",
  "No Response",
]

function main() {
  const name = process.argv[2]
  const newStatus = process.argv[3] as GuestStatus

  if (!name || !newStatus) {
    console.error("Usage: npm run update-status -- <name> <status>")
    console.error(`Valid statuses: ${VALID_STATUSES.join(", ")}`)
    process.exit(1)
  }

  if (!VALID_STATUSES.includes(newStatus)) {
    console.error(`Invalid status: ${newStatus}`)
    console.error(`Valid statuses: ${VALID_STATUSES.join(", ")}`)
    process.exit(1)
  }

  const data: WorkshopData = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"))

  const nameLower = name.toLowerCase()
  const guestIndex = data.guests.findIndex((g) =>
    g.name.toLowerCase().includes(nameLower)
  )

  if (guestIndex === -1) {
    console.error(`No guest found matching "${name}"`)
    process.exit(1)
  }

  const guest = data.guests[guestIndex]
  const oldStatus = guest.status
  guest.status = newStatus

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))

  console.log(`Updated ${guest.name}: ${oldStatus} → ${newStatus}`)
}

main()
