import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTagCounts } from "@/lib/data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

interface TagsChartProps {
  confirmedOnly?: boolean
}

export function TagsChart({ confirmedOnly = false }: TagsChartProps) {
  const tagCounts = getTagCounts(confirmedOnly)

  const chartData = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {confirmedOnly ? "Confirmed Participants" : "All Guests"} by Tag
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="tag"
                width={80}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar
                dataKey="count"
                fill="hsl(217, 91%, 60%)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
