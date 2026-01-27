import { useState } from "react"
import { Header } from "@/components/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { BudgetOverview } from "@/components/dashboard/budget-overview"
import { StatusChart } from "@/components/dashboard/status-chart"
import { TagsChart } from "@/components/dashboard/tags-chart"
import { TravelCostsMap } from "@/components/dashboard/travel-costs"
import { GuestTable } from "@/components/dashboard/guest-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, Users, Calendar, FileText, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "dashboard" | "guests" | "schedule" | "docs"

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-6">
        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "guests" ? "default" : "ghost"}
            onClick={() => setActiveTab("guests")}
          >
            <Users className="mr-2 h-4 w-4" />
            Guest List
          </Button>
          <Button
            variant={activeTab === "schedule" ? "default" : "ghost"}
            onClick={() => setActiveTab("schedule")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button
            variant={activeTab === "docs" ? "default" : "ghost"}
            onClick={() => setActiveTab("docs")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </Button>
        </nav>

        {/* Dashboard View */}
        <div className={cn(activeTab !== "dashboard" && "hidden")}>
          <div className="space-y-6">
            <StatsCards />
            <div className="grid gap-6 md:grid-cols-2">
              <StatusChart />
              <BudgetOverview />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <TagsChart confirmedOnly={true} />
              <TagsChart confirmedOnly={false} />
            </div>
            <TravelCostsMap />
          </div>
        </div>

        {/* Guest List View */}
        <div className={cn(activeTab !== "guests" && "hidden")}>
          <GuestTable />
        </div>

        {/* Schedule View */}
        <div className={cn(activeTab !== "schedule" && "hidden")}>
          <ScheduleView />
        </div>

        {/* Documents View */}
        <div className={cn(activeTab !== "docs" && "hidden")}>
          <DocsView />
        </div>
      </div>
    </div>
  )
}

function ScheduleView() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {["June 8", "June 9", "June 10"].map((day, idx) => (
          <div key={day} className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">{day}, 2026</h3>
            <p className="text-sm text-muted-foreground">
              {idx === 0 && "Day 1: Welcome & Introductions"}
              {idx === 1 && "Day 2: Working Sessions"}
              {idx === 2 && "Day 3: Synthesis & Next Steps"}
            </p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Detailed schedule coming soon
      </p>
    </div>
  )
}

const documents = [
  {
    title: "Project Summary",
    description: "One-page overview of the workshop goals and expected outcomes",
    filename: "Project Summary.pdf",
  },
  {
    title: "Project Description",
    description: "Detailed description of the workshop plan, activities, and methodology",
    filename: "Project Description.pdf",
  },
  {
    title: "Full Proposal",
    description: "Complete NSF proposal document (contains PII)",
    filename: "Final Awarded Proposal (with PII).pdf",
  },
]

function DocsView() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {documents.map((doc) => (
          <Card key={doc.filename}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {doc.title}
              </CardTitle>
              <CardDescription>{doc.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href={`/docs/${doc.filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 hover:underline"
              >
                Open PDF
                <ExternalLink className="h-4 w-4" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground text-center">
        NSF Award #2542375
      </p>
    </div>
  )
}

export default App
