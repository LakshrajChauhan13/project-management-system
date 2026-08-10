import React from "react"
import { FolderKanban, Zap, CheckCircle2, Clock, Sparkles } from "lucide-react"
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList 
} from "recharts"

import { 
  type ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"

const burndownData = [
  { day: "Mon", actual: 60, ideal: 60 },
  { day: "Tue", actual: 55, ideal: 50 },
  { day: "Wed", actual: 48, ideal: 40 },
  { day: "Thu", actual: 35, ideal: 30 },
  { day: "Fri", actual: 22, ideal: 20 },
  { day: "Sat", actual: 15, ideal: 10 },
  { day: "Sun", actual: 5, ideal: 0 },
]

const velocityData = [
  { sprint: "Sprint 1", expected: 40, completed: 35 },
  { sprint: "Sprint 2", expected: 45, completed: 48 },
  { sprint: "Sprint 3", expected: 50, completed: 42 },
  { sprint: "Sprint 4", expected: 55, completed: 60 },
]

const burndownConfig = {
  actual: {
    label: "Actual Remaining",
    color: "hsl(var(--chart-actual))",
  },
  ideal: {
    label: "Ideal Burndown",
    color: "hsl(var(--chart-ideal))",
  },
} satisfies ChartConfig

const velocityConfig = {
  expected: {
    label: "Expected Points",
    color: "hsl(var(--chart-expected))",
  },
  completed: {
    label: "Completed Points",
    color: "hsl(var(--chart-completed))",
  },
} satisfies ChartConfig

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
            <span className={trend.startsWith("+") ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
              {trend}
            </span> from last week
          </p>
        )}
      </div>
    </div>
  )
}

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Projects" value="12" icon={FolderKanban} trend="+2" />
        <MetricCard title="Active Sprints" value="3" icon={Zap} trend="+1" />
        <MetricCard title="Pending Tasks" value="24" icon={Clock} trend="-5" />
        <MetricCard title="Completed Tasks" value="108" icon={CheckCircle2} trend="+12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sprint Burndown Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="font-semibold text-lg">Sprint Burndown</h3>
            <p className="text-sm text-muted-foreground">Tracking remaining tasks vs. ideal trajectory</p>
          </div>
          <div className="flex-1 w-full">
            <ChartContainer config={burndownConfig} className="min-h-[320px] w-full">
              <AreaChart data={burndownData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-actual)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-actual)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillIdeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-ideal)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-ideal)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                
                {/* Fix: Removed nameKey to restore default text rendering next to the dots */}
                <ChartLegend content={<ChartLegendContent />} />
                
                <Area 
                  type="monotone" 
                  dataKey="ideal" 
                  stroke="var(--color-ideal)" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  fill="url(#fillIdeal)" 
                />
                
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="var(--color-actual)" 
                  strokeWidth={3} 
                  fill="url(#fillActual)" 
                  activeDot={{ r: 6, fill: "var(--color-actual)" }}
                >
                  <LabelList 
                    dataKey="actual" 
                    position="top" 
                    offset={10} 
                    fill="hsl(var(--foreground))" 
                    fontSize={12} 
                    fontWeight={600}
                  />
                </Area>
              </AreaChart>
            </ChartContainer>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="p-6 rounded-xl border border-border bg-gradient-to-b from-card to-primary/5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-primary">AI Insights</h3>
          </div>
          <div className="flex-1 space-y-4">
            <div className="p-4 text-sm bg-background rounded-lg border border-border/50 shadow-sm transition-all hover:shadow-md">
              <span className="font-semibold block mb-1">Capacity Warning:</span> 
              The current sprint is over-allocated by 8 story points based on historical team velocity. Consider moving low-priority tasks to the backlog.
            </div>
            <div className="p-4 text-sm bg-background rounded-lg border border-border/50 shadow-sm transition-all hover:shadow-md">
              <span className="font-semibold block mb-1">Productivity Trend:</span> 
              Task completion rate has improved by 15% this week. Code review bottlenecks have significantly decreased.
            </div>
          </div>
        </div>

        {/* Team Velocity Chart */}
        <div className="lg:col-span-3 p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="font-semibold text-lg">Team Velocity</h3>
            <p className="text-sm text-muted-foreground">Expected vs. Completed story points across recent sprints</p>
          </div>
          <div className="w-full">
            <ChartContainer config={velocityConfig} className="h-[320px] w-full">
              <BarChart data={velocityData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="sprint" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                
                <ChartTooltip cursor={{ fill: "hsl(var(--muted)/0.3)" }} content={<ChartTooltipContent indicator="dot" />} />
                
                {/* Fix: Removed nameKey to restore default text rendering next to the dots */}
                <ChartLegend content={<ChartLegendContent />} />
                
                <Bar dataKey="expected" fill="var(--color-expected)" radius={[4, 4, 0, 0]} opacity={0.7}>
                  <LabelList 
                    dataKey="expected" 
                    position="top" 
                    offset={8} 
                    fill="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                  />
                </Bar>
                
                <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]}>
                  <LabelList 
                    dataKey="completed" 
                    position="top" 
                    offset={8} 
                    fill="hsl(var(--foreground))" 
                    fontSize={12} 
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </div>

      </div>
    </div>
  )
}