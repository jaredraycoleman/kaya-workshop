import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { travelCostsByState } from "@/lib/data"
import { MapPin } from "lucide-react"
import * as topojson from "topojson-client"
import { geoAlbersUsa, geoPath } from "d3-geo"
import usTopology from "@/data/us-states.json"
import type { Topology, GeometryObject } from "topojson-specification"

// FIPS code to state abbreviation mapping
const fipsToState: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
  "08": "CO", "09": "CT", "10": "DE", "11": "DC", "12": "FL",
  "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN",
  "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME",
  "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS",
  "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
  "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
  "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT",
  "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI",
  "56": "WY",
}

// Build state cost lookup
const stateCosts = new Map(travelCostsByState.map(s => [s.state, s]))

// Color scale: green (cheap) -> yellow -> red (expensive)
function getFareColor(fare: number): string {
  const minFare = 136  // NV
  const maxFare = 450  // AK
  const normalized = Math.min(1, Math.max(0, (fare - minFare) / (maxFare - minFare)))

  if (normalized < 0.5) {
    const g = Math.round(180 + normalized * 100)
    const r = Math.round(normalized * 2 * 220)
    return `rgb(${r}, ${g}, 100)`
  } else {
    const r = Math.round(220 + (normalized - 0.5) * 70)
    const g = Math.round(230 - (normalized - 0.5) * 2 * 150)
    return `rgb(${r}, ${g}, 80)`
  }
}

// Stipend tier colors
function getStipendColor(tier: number): string {
  switch (tier) {
    case 250: return "hsl(142, 76%, 36%)"  // green
    case 500: return "hsl(38, 92%, 50%)"   // yellow/orange
    case 750: return "hsl(0, 84%, 60%)"    // red
    default: return "#999"
  }
}

export function TravelCostsMap() {
  // Group states by stipend tier
  const tierGroups = {
    250: travelCostsByState.filter(s => s.stipendTier === 250),
    500: travelCostsByState.filter(s => s.stipendTier === 500),
    750: travelCostsByState.filter(s => s.stipendTier === 750),
  }

  // Generate state paths from TopoJSON
  const statePaths = useMemo(() => {
    const topology = usTopology as unknown as Topology
    const states = topojson.feature(
      topology,
      topology.objects.states as GeometryObject
    )

    const projection = geoAlbersUsa().scale(1000).translate([450, 280])
    const pathGenerator = geoPath().projection(projection)

    return (states as GeoJSON.FeatureCollection).features.map((feature) => {
      const id = feature.id as string
      const stateAbbr = fipsToState[id]
      const cost = stateCosts.get(stateAbbr)
      const fill = cost ? getFareColor(cost.avgFare) : "#e5e5e5"

      return {
        id,
        stateAbbr,
        name: (feature.properties as { name: string }).name,
        path: pathGenerator(feature) || "",
        fill,
        cost,
      }
    })
  }, [])

  // LA location (approximate)
  const laLocation = useMemo(() => {
    const projection = geoAlbersUsa().scale(1000).translate([450, 280])
    return projection([-118.2437, 34.0522]) // LA coordinates
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Travel Costs & Stipend Tiers</CardTitle>
        <CardDescription>
          Average airfare to Los Angeles by state (BTS Q2 2025 data)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Map */}
          <div className="relative">
            <svg viewBox="0 0 900 560" className="w-full h-auto">
              {/* Background */}
              <rect x="0" y="0" width="900" height="560" fill="#f8fafc" rx="8" />

              {/* States */}
              {statePaths.map((state) => (
                <path
                  key={state.id}
                  d={state.path}
                  fill={state.fill}
                  stroke="#fff"
                  strokeWidth="1"
                  className="transition-opacity hover:opacity-70 cursor-pointer"
                >
                  <title>
                    {state.name}: ${state.cost?.avgFare ?? "N/A"}
                    {state.cost ? ` (${state.cost.stipendTier === 250 ? "$250" : state.cost.stipendTier === 500 ? "$500" : "$750"} stipend)` : ""}
                  </title>
                </path>
              ))}

              {/* LA marker (destination) */}
              {laLocation && (
                <>
                  <circle
                    cx={laLocation[0]}
                    cy={laLocation[1]}
                    r="10"
                    fill="#1e40af"
                    stroke="#fff"
                    strokeWidth="3"
                  />
                  <text
                    x={laLocation[0]}
                    y={laLocation[1] + 28}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#1e40af"
                    fontWeight="bold"
                  >
                    LMU
                  </text>
                </>
              )}

              {/* Legend */}
              <defs>
                <linearGradient id="fareGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(0, 180, 100)" />
                  <stop offset="50%" stopColor="rgb(220, 230, 80)" />
                  <stop offset="100%" stopColor="rgb(255, 80, 80)" />
                </linearGradient>
              </defs>
              <rect x="600" y="480" width="200" height="16" fill="url(#fareGradient)" rx="3" />
              <text x="600" y="515" fontSize="12" fill="#666">$136</text>
              <text x="800" y="515" fontSize="12" fill="#666" textAnchor="end">$450+</text>
              <text x="700" y="475" fontSize="13" fill="#333" textAnchor="middle" fontWeight="500">Average Round-Trip Fare</text>
            </svg>
          </div>

          {/* Stipend Tiers */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground">
              Suggested Travel Stipends (+ $500 hotel)
            </div>

            {/* $250 tier */}
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getStipendColor(250) }}
                  />
                  <span className="font-medium">$250 Travel</span>
                </div>
                <span className="text-sm text-muted-foreground">Avg fare &lt;$250</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {tierGroups[250].map(s => s.state).join(", ")}
              </div>
            </div>

            {/* $500 tier */}
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getStipendColor(500) }}
                  />
                  <span className="font-medium">$500 Travel</span>
                </div>
                <span className="text-sm text-muted-foreground">Avg fare $250-$400</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {tierGroups[500].map(s => s.state).join(", ")}
              </div>
            </div>

            {/* $750 tier */}
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getStipendColor(750) }}
                  />
                  <span className="font-medium">$750 Travel</span>
                </div>
                <span className="text-sm text-muted-foreground">Avg fare &gt;$400</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {tierGroups[750].map(s => s.state).join(", ")}
              </div>
            </div>

            <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
              <div>
                <MapPin className="inline h-3 w-3 mr-1" />
                Workshop: Los Angeles (LMU)
              </div>
              <div>
                Source: Bureau of Transportation Statistics, Q2 2025
              </div>
              <div>
                LA locals: $500 hotel only (no travel stipend)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
