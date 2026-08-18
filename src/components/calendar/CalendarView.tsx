"use client"

import React, { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Video, 
  Flag, 
  Coffee,
  AlertCircle,
  X,
  Clock,
  Target,
  AlignLeft,
  CheckCircle2,
  Filter,
  ChevronDown,
  Check
} from "lucide-react"
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addDays,
  eachDayOfInterval,
  startOfDay
} from "date-fns"
import { useTaskStore } from "@/store/useTaskStore"
import { useProjectStore } from "@/store/useProjectStore"
import { useSprintStore, type Sprint } from "@/store/useSprintStore"

// 1. Import Shadcn Tooltip components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"

type EventType = 'deadline' | 'meeting' | 'release' | 'leave' | 'sprint'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: EventType
  projectId?: string
}

export function CalendarView() {
  const { projects } = useProjectStore()
  const { tasks } = useTaskStore()
  const { sprints } = useSprintStore()
  
  const [filterProjectId, setFilterProjectId] = useState<string>("all")
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Navigation handlers
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const jumpToToday = () => setCurrentDate(new Date())

  const filteredSprints = useMemo(() => {
    if (filterProjectId === "all") return sprints
    return sprints.filter(s => s.projectId === filterProjectId)
  }, [sprints, filterProjectId])

  const daysInGrid = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [currentDate])

  const sprintTasks = useMemo(() => {
    if (!selectedSprint) return []
    return tasks.filter(task => task.sprintId === selectedSprint.id)
  }, [selectedSprint, tasks])

  const events = useMemo(() => {
    const combinedEvents: CalendarEvent[] = []

    // High-level mock events
    combinedEvents.push({
      id: 'evt-1', title: 'Sprint Planning', date: addDays(startOfMonth(currentDate), 4), type: 'meeting'
    })
    combinedEvents.push({
      id: 'evt-2', title: 'v1.2.0', date: addDays(startOfMonth(currentDate), 14), type: 'release'
    })
    combinedEvents.push({
      id: 'evt-3', title: 'Sarah', date: addDays(startOfMonth(currentDate), 18), type: 'leave'
    })
    combinedEvents.push({
      id: 'evt-4', title: 'Feature Freeze', date: addDays(startOfMonth(currentDate), 25), type: 'deadline'
    })

    return combinedEvents
  }, [currentDate])

  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20'
    }
  }

  // Helper to generate conversational tooltip text
  const getTooltipText = (event: CalendarEvent) => {
    switch (event.type) {
      case 'leave': return `${event.title} will be on leave.`
      case 'release': return `${event.title} will be released to production.`
      case 'meeting': return `Scheduled Meeting: ${event.title}`
      case 'deadline': return `Critical Deadline: ${event.title}`
      default: return event.title
    }
  }

  // 2. Upgraded renderEventPill with Tooltips
  const renderEventPill = (event: CalendarEvent) => {
    let pillContent = null

    switch (event.type) {
      case 'meeting':
        pillContent = (
          <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20 truncate cursor-help">
            <Video className="w-3 h-3 shrink-0" />
            <span className="truncate">{event.title}</span>
          </div>
        )
        break
      case 'release':
        pillContent = (
          <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/20 truncate cursor-help">
            <Flag className="w-3 h-3 shrink-0" />
            <span className="truncate">{event.title}</span>
          </div>
        )
        break
      case 'leave':
        pillContent = (
          <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 truncate cursor-help">
            <Coffee className="w-3 h-3 shrink-0" />
            <span className="truncate">{event.title}</span>
          </div>
        )
        break
      case 'deadline':
      default:
        pillContent = (
          <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded-md bg-orange-500/10 text-orange-600 border border-orange-500/20 truncate cursor-help">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span className="truncate">{event.title}</span>
          </div>
        )
        break
    }

    // Wrap the pill inside the Shadcn Tooltip components
    return (
      <Tooltip key={event.id}>
        <TooltipTrigger>
          {pillContent}
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="text-xs text-shadow-2xs ">
          <p>{getTooltipText(event)}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  const getProjectName = (id: string) => {
    const p = projects.find(proj => proj.id === id)
    return p ? p.name : 'Unknown Project'
  }

  return (
    // 3. Wrap the main component in TooltipProvider
    <TooltipProvider>
      <div className="relative flex flex-col h-full bg-background rounded-xl border border-border shadow-sm overflow-hidden">
        
        {/* Calendar Header with Filter Dropdown */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-6 border-b border-border bg-card shrink-0 gap-4">
            <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                {format(currentDate, 'MMMM yyyy')}
                </h2>
                <p className="text-sm text-muted-foreground">
                Workspace Timeline
                </p>
            </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
            
            {/* UPDATED: Project Filter Dropdown with proper height, width, and truncation */}
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                    <button className="flex items-center gap-2 px-3 py-2 h-9 bg-background border border-border rounded-md min-w-[180px] shadow-sm hover:border-primary/50 transition-all text-sm font-medium text-foreground" />
                    }
                >
                    <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 text-left truncate">
                    {filterProjectId === "all" ? "All Projects" : getProjectName(filterProjectId)}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[--anchor-width] min-w-[220px]">
                    <DropdownMenuItem
                    onClick={() => setFilterProjectId("all")}
                    className="cursor-pointer justify-between"
                    >
                    All Projects
                    {filterProjectId === "all" && <Check className="w-4 h-4" />}
                    </DropdownMenuItem>
                    {projects.map((project) => (
                    <DropdownMenuItem
                        key={project.id}
                        onClick={() => setFilterProjectId(project.id)}
                        className="cursor-pointer justify-between"
                    >
                        <span className="truncate">{project.name}</span>
                        {filterProjectId === project.id && <Check className="w-4 h-4 shrink-0" />}
                    </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>

            <button 
                onClick={jumpToToday}
                className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
                Today
            </button>
            <div className="flex items-center border border-border rounded-md overflow-hidden h-9">
                <button 
                onClick={prevMonth}
                className="h-full px-2 bg-card hover:bg-muted text-muted-foreground transition-colors border-r border-border flex items-center justify-center"
                >
                <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                onClick={nextMonth}
                className="h-full px-2 bg-card hover:bg-muted text-muted-foreground transition-colors flex items-center justify-center"
                >
                <ChevronRight className="w-4 h-4" />
                </button>
            </div>
            </div>
        </div>

        {/* Days of the Week Header */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30 shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-border gap-px overflow-y-auto">
          {daysInGrid.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isCurrentDay = isToday(day)
            const dayStart = startOfDay(day)

            const dayEvents = events.filter(event => isSameDay(event.date, day))

            return (
              <div 
                key={day.toString()} 
                className={`min-h-[120px] bg-card p-2 flex flex-col gap-1 hover:bg-muted/10 transition-colors group ${
                  !isCurrentMonth ? 'bg-muted/30 opacity-70' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                    isCurrentDay 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground group-hover:text-primary transition-colors'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1.5 mt-1 overflow-y-auto custom-scrollbar">
                  {filteredSprints.map(sprint => {
                    const sStart = startOfDay(new Date(sprint.startDate))
                    const sEnd = startOfDay(new Date(sprint.endDate))

                    if (dayStart >= sStart && dayStart <= sEnd) {
                      const isStart = dayStart.getTime() === sStart.getTime()
                      const isEnd = dayStart.getTime() === sEnd.getTime()

                      const radiusClass = isStart && isEnd ? "rounded-md mx-1" 
                                        : isStart ? "rounded-l-md ml-1 border-l-2 border-r-0" 
                                        : isEnd ? "rounded-r-md mr-1 border-r-2 border-l-0" 
                                        : "rounded-none border-x-0 mx-0"

                      return (
                        <div 
                          key={sprint.id}
                          onClick={() => setSelectedSprint(sprint)}
                          className={`text-[10px] font-bold px-2 py-1 cursor-pointer truncate transition-all hover:brightness-110 border border-primary/30 bg-primary/10 text-primary z-10 ${radiusClass}`}
                        >
                          {(isStart || day.getDay() === 0) ? sprint.name : '\u00A0'}
                        </div>
                      )
                    }
                    return null
                  })}

                  {dayEvents.map(renderEventPill)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Side Panel */}
        {selectedSprint && (
          <>
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedSprint(null)} />
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
              
              <div className="p-6 border-b border-border flex items-start justify-between bg-muted/20">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary">
                      {selectedSprint.status}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary/50 text-secondary-foreground border border-border">
                      {getProjectName(selectedSprint.projectId)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{selectedSprint.name}</h3>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {format(new Date(selectedSprint.startDate), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1.5"><Target className="w-4 h-4" /> {format(new Date(selectedSprint.endDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedSprint(null)} className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center justify-between">
                  Sprint Backlog
                  <span className="bg-muted px-2 py-0.5 rounded-full text-xs">{sprintTasks.length} Tasks</span>
                </h4>
                
                {sprintTasks.length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-border rounded-xl">
                    <AlignLeft className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">No tasks assigned to this sprint yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sprintTasks.map(task => (
                      <div key={task.id} className="p-4 rounded-xl border border-border bg-background shadow-sm hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h5 className="text-sm font-medium leading-snug">{task.title}</h5>
                          <div 
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              task.assignee === "UN" 
                                ? "bg-muted text-muted-foreground border border-dashed border-border" 
                                : "bg-primary/10 text-primary border border-primary/20"
                            }`}
                          >
                            {task.assignee}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                              <Target className="w-3.5 h-3.5" /> {task.points} pts
                            </span>
                          </div>
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            {task.status === "Done" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}