import React from "react"
import { FolderKanban, Zap, CheckCircle2, Clock, Sparkles } from "lucide-react"

// A reusable sub-component for our metric cards
interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: string
}

function MetricCard({ title, value, icon: Icon, trend }: MetricCardProps) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col gap-4 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-emerald-500 font-medium">{trend}</span> from last week
          </p>
        )}
      </div>
    </div>
  )
}

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Projects" value="12" icon={FolderKanban} trend="+2" />
        <MetricCard title="Active Sprints" value="3" icon={Zap} trend="Steady" />
        <MetricCard title="Pending Tasks" value="24" icon={Clock} trend="-5" />
        <MetricCard title="Completed Tasks" value="108" icon={CheckCircle2} trend="+12" />
      </div>

      {/* Main Content Area: Charts & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Placeholder (Takes up 2/3 width on large screens) */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm min-h-[300px] flex flex-col">
          <h3 className="font-semibold mb-4">Sprint Burndown</h3>
          <div className="flex-1 border-2 border-dashed border-muted rounded-lg flex items-center justify-center bg-muted/20">
            <p className="text-sm text-muted-foreground">Chart Integration Pending...</p>
          </div>
        </div>

        {/* AI Insights Panel (Takes up 1/3 width) */}
        <div className="p-6 rounded-xl border border-border bg-gradient-to-b from-card to-primary/5 shadow-sm min-h-[300px] flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-primary">AI Insights</h3>
          </div>
          <div className="flex-1 space-y-4">
            <div className="p-3 text-sm bg-background rounded-lg border border-border">
              <span className="font-medium">Capacity Warning:</span> The current sprint is over-allocated by 8 story points based on historical team velocity.
            </div>
            <div className="p-3 text-sm bg-background rounded-lg border border-border">
              <span className="font-medium">Productivity:</span> Task completion rate has improved by 15% this week.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}