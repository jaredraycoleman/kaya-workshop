#!/usr/bin/env npx tsx
/**
 * Export workshop data to Excel
 * Usage: npm run export -- workshop_export.xlsx
 */

import * as fs from "fs"
import * as path from "path"
import type { WorkshopData } from "../src/lib/types"

// Simple CSV export (Excel can open these)
// For full XLSX support, would need to add xlsx package

const DATA_PATH = path.join(import.meta.dirname, "../data/workshop.json")

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function arrayToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return ""
  const headers = Object.keys(data[0])
  const rows = data.map((row) => headers.map((h) => escapeCSV(row[h])).join(","))
  return [headers.join(","), ...rows].join("\n")
}

function main() {
  const outputPath = process.argv[2] || "workshop_export.csv"

  const data: WorkshopData = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"))

  // Export guests to CSV
  const guestsCSV = arrayToCSV(data.guests)
  const guestsPath = outputPath.replace(/\.(xlsx|csv)$/, "_guests.csv")
  fs.writeFileSync(guestsPath, guestsCSV)
  console.log(`Exported guests to ${guestsPath}`)

  // Export budget to CSV
  const budgetCSV = arrayToCSV(data.budget)
  const budgetPath = outputPath.replace(/\.(xlsx|csv)$/, "_budget.csv")
  fs.writeFileSync(budgetPath, budgetCSV)
  console.log(`Exported budget to ${budgetPath}`)

  console.log("\nTip: Open CSV files in Excel or Google Sheets")
}

main()
