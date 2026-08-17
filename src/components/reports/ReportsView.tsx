"use client"

import React, { useMemo } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon,
  Download
} from "lucide-react"
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend
} from "recharts"

import { 
  type ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { useTaskStore } from "@/store/useTaskStore"

// --- Historical Mock Data ---
const burndownData = [
  { day: "Day 1", actual: 120, ideal: 120 },
  { day: "Day 2", actual: 110, ideal: 105 },
  { day: "Day 3", actual: 95, ideal: 90 },
  { day: "Day 4", actual: 85, ideal: 75 },
  { day: "Day 5", actual: 70, ideal: 60 },
  { day: "Day 6", actual: 55, ideal: 45 },
  { day: "Day 7", actual: 40, ideal: 30 },
  { day: "Day 8", actual: 35, ideal: 15 },
  { day: "Day 9", actual: 10, ideal: 0 },
]

const velocityData = [
  { sprint: "Sprint 1", expected: 45, completed: 38 },
  { sprint: "Sprint 2", expected: 50, completed: 52 },
  { sprint: "Sprint 3", expected: 55, completed: 50 },
  { sprint: "Sprint 4", expected: 60, completed: 64 },
  { sprint: "Sprint 5", expected: 65, completed: 62 },
]

// --- CHART CONFIGURATIONS ---
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

// Config keys must be safe strings (no spaces) for Shadcn to generate valid CSS variables
const distributionConfig = {
  backlog:    { label: "Backlog",     color: "var(--chart-1)" },
  todo:       { label: "To Do",       color: "var(--chart-2)" },
  inprogress: { label: "In Progress", color: "var(--chart-3)" },
  done:       { label: "Done",        color: "var(--chart-4)" },
} satisfies ChartConfig

export function ReportsView() {
  const { tasks } = useTaskStore()

  // 1. Calculate Task Distribution using safe statusIds that match the config keys
  const taskDistributionData = useMemo(() => {
    const distribution = {
      Backlog: 0,
      "To Do": 0,
      "In Progress": 0,
      Done: 0
    }

    tasks.forEach(task => {
      if (distribution[task.status as keyof typeof distribution] !== undefined) {
        distribution[task.status as keyof typeof distribution]++
      }
    })

    return [
      { statusId: "backlog", value: distribution.Backlog, fill: "var(--color-backlog)" },
      { statusId: "todo", value: distribution["To Do"], fill: "var(--color-todo)" },
      { statusId: "inprogress", value: distribution["In Progress"], fill: "var(--color-inprogress)" },
      { statusId: "done", value: distribution.Done, fill: "var(--color-done)" },
    ].filter(item => item.value > 0)
  }, [tasks])

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Historical insights, velocity tracking, and current task distribution.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-border bg-background shadow-sm hover:bg-muted hover:text-foreground h-9 px-4">
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Task Distribution (Donut Chart) */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col">
          <div className="p-6 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <PieChartIcon className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg">Task Status</h3>
            </div>
            <p className="text-sm text-muted-foreground">Current workspace distribution</p>
          </div>
          <div className="flex-1 flex items-center justify-center p-6 min-h-[300px]">
            {taskDistributionData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks available.</p>
            ) : (
              <ChartContainer config={distributionConfig} className="h-full w-full">
                <PieChart>
                  <RechartsTooltip 
                    content={<ChartTooltipContent hideLabel />} 
                  />
                  <Pie
                    data={taskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="statusId" // Now matches the safe string keys in distributionConfig!
                    stroke="none"
                  >
                    {taskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsLegend 
                    verticalAlign="bottom" 
                    height={36} 
                    content={<ChartLegendContent />}
                  />
                </PieChart>
              </ChartContainer>
            )}
          </div>
        </div>

        {/* Sprint Burndown Area Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col">
          <div className="p-6 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg">Sprint 5 Burndown</h3>
            </div>
            <p className="text-sm text-muted-foreground">Tracking remaining tasks vs. ideal trajectory</p>
          </div>
          <div className="flex-1 p-6">
            <ChartContainer config={burndownConfig} className="min-h-[250px] w-full">
              <AreaChart data={burndownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-actual)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-actual)" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorIdeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-ideal)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--color-ideal)" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
                
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <ChartLegend content={<ChartLegendContent />} />
                
                <Area 
                  type="monotone" 
                  dataKey="ideal" 
                  stroke="var(--color-ideal)" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  fill="url(#colorIdeal)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="var(--color-actual)" 
                  strokeWidth={3}
                  fill="url(#colorActual)" 
                  activeDot={{ r: 6, fill: "var(--color-actual)" }}
                >
                  <LabelList 
                    dataKey="actual" 
                    position="top" 
                    offset={10} 
                    fill="var(--color-foreground)"
                    fontSize={12} 
                    fontWeight={600}
                  />
                </Area>
              </AreaChart>
            </ChartContainer>
          </div>
        </div>

        {/* Team Velocity Bar Chart */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col">
          <div className="p-6 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg">Historical Velocity</h3>
            </div>
            <p className="text-sm text-muted-foreground">Expected vs. Completed story points across recent sprints</p>
          </div>
          <div className="w-full p-6">
            <ChartContainer config={velocityConfig} className="min-h-[300px] w-full">
              <BarChart data={velocityData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                
                {/* FIXED: XAxis and YAxis fill colors */}
                <XAxis dataKey="sprint" axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
                
                <ChartTooltip cursor={{ fill: "hsl(var(--muted)/0.4)" }} content={<ChartTooltipContent indicator="dot" />} />
                <ChartLegend content={<ChartLegendContent />} />
                
                <Bar dataKey="expected" fill="var(--color-expected)" radius={[4, 4, 0, 0]} opacity={0.6}>
                  {/* FIXED: LabelList fill color */}
                  <LabelList dataKey="expected" position="top" offset={8} fill="var(--color-muted-foreground)" fontSize={11} />
                </Bar>
                
                <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]}>
                  {/* FIXED: LabelList fill color */}
                  <LabelList dataKey="completed" position="top" offset={8} fill="var(--color-foreground)" fontSize={11} fontWeight={600} />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </div>

      </div>
    </div>
  )
}