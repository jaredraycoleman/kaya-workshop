import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Parse BTS airfare CSV and extract Los Angeles routes
const csvPath = path.join(__dirname, "../data/bts_airfares.csv")
const content = fs.readFileSync(csvPath, "utf-8")
const lines = content.split("\n")

interface CityFare {
  city: string
  state: string
  fare: number
  fareLow: number // lowest carrier fare
  passengers: number
  miles: number
}

const laFares: CityFare[] = []

// State abbreviation mapping
const stateAbbreviations: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
  "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
  "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
  "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
  "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
  "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
  "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
  "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
  "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC"
}

function extractState(cityStr: string): string | null {
  // Match patterns like "City, ST" or "City, State Name"
  const match = cityStr.match(/,\s*([A-Z]{2})(?:\s*\(|$)/)
  if (match) return match[1]

  // Try full state name
  for (const [name, abbr] of Object.entries(stateAbbreviations)) {
    if (cityStr.includes(name)) return abbr
  }
  return null
}

function extractCity(cityStr: string): string {
  // Remove "(Metropolitan Area)" and state
  return cityStr
    .replace(/\s*\(Metropolitan Area\)/g, "")
    .replace(/,\s*[A-Z]{2}(\s*\(.*\))?$/, "")
    .trim()
}

// Parse CSV (handle quoted fields)
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

// Process lines
for (const line of lines) {
  if (!line.includes("2025,2")) continue
  if (!line.includes("Los Angeles")) continue

  const fields = parseCSVLine(line)
  const city1 = fields[5]
  const city2 = fields[6]
  const miles = parseFloat(fields[7])
  const passengers = parseFloat(fields[8])
  const fare = parseFloat(fields[9])
  const fareLow = parseFloat(fields[15])

  // Determine which city is NOT Los Angeles
  const otherCity = city1.includes("Los Angeles") ? city2 : city1
  const state = extractState(otherCity)
  const city = extractCity(otherCity)

  if (state && state !== "CA" && !isNaN(fare)) {
    laFares.push({ city, state, fare, fareLow, passengers, miles })
  }
}

// Sort by fare
laFares.sort((a, b) => a.fare - b.fare)

// Group by state and calculate weighted average
interface StateSummary {
  state: string
  avgFare: number
  minFare: number
  maxFare: number
  cities: { city: string; fare: number; passengers: number }[]
  totalPassengers: number
}

const stateMap = new Map<string, StateSummary>()

for (const f of laFares) {
  if (!stateMap.has(f.state)) {
    stateMap.set(f.state, {
      state: f.state,
      avgFare: 0,
      minFare: Infinity,
      maxFare: 0,
      cities: [],
      totalPassengers: 0
    })
  }
  const s = stateMap.get(f.state)!
  s.cities.push({ city: f.city, fare: f.fare, passengers: f.passengers })
  s.totalPassengers += f.passengers
  s.minFare = Math.min(s.minFare, f.fare)
  s.maxFare = Math.max(s.maxFare, f.fare)
}

// Calculate weighted average fare per state
for (const s of stateMap.values()) {
  const weightedSum = s.cities.reduce((sum, c) => sum + c.fare * c.passengers, 0)
  s.avgFare = Math.round(weightedSum / s.totalPassengers)
}

const states = Array.from(stateMap.values()).sort((a, b) => a.avgFare - b.avgFare)

console.log("\n=== AVERAGE AIRFARES TO LOS ANGELES BY STATE (Q2 2025) ===")
console.log("Source: Bureau of Transportation Statistics\n")

console.log("State | Avg Fare | Min | Max | Cities")
console.log("-".repeat(70))

for (const s of states) {
  const cityList = s.cities
    .sort((a, b) => b.passengers - a.passengers)
    .slice(0, 3)
    .map(c => c.city)
    .join(", ")
  console.log(
    `${s.state.padEnd(5)} | $${s.avgFare.toString().padStart(3)} | $${Math.round(s.minFare).toString().padStart(3)} | $${Math.round(s.maxFare).toString().padStart(3)} | ${cityList}`
  )
}

// Determine stipend tiers
console.log("\n\n=== SUGGESTED STIPEND TIERS ===")
console.log("Hotel: $500 (all participants except LA locals)")
console.log("Travel stipend based on average round-trip airfare:\n")

const tiers: { tier: string; amount: number; states: string[] }[] = [
  { tier: "Low ($250)", amount: 250, states: [] },
  { tier: "Medium ($500)", amount: 500, states: [] },
  { tier: "High ($750)", amount: 750, states: [] },
]

for (const s of states) {
  if (s.avgFare < 250) {
    tiers[0].states.push(s.state)
  } else if (s.avgFare < 400) {
    tiers[1].states.push(s.state)
  } else {
    tiers[2].states.push(s.state)
  }
}

for (const t of tiers) {
  console.log(`${t.tier}: ${t.states.join(", ")}`)
}

// Output JSON for the app
const travelData = states.map(s => ({
  state: s.state,
  avgFare: s.avgFare,
  minFare: Math.round(s.minFare),
  maxFare: Math.round(s.maxFare),
  stipendTier: s.avgFare < 250 ? 250 : s.avgFare < 400 ? 500 : 750
}))

const outputPath = path.join(__dirname, "../data/travel_costs_by_state.json")
fs.writeFileSync(outputPath, JSON.stringify(travelData, null, 2))
console.log(`\nData written to: ${outputPath}`)
