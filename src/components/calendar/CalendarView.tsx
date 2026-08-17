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
  AlertCircle
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
  eachDayOfInterval
} from "date-fns"
import { useTaskStore } from "@/store/useTaskStore"
import { useProjectStore } from "@/store/useProjectStore"

// Define the types of events our calendar supports
type EventType = 'deadline' | 'meeting' | 'release' | 'leave' | 'sprint'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: EventType
}

export function CalendarView() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects } = useProjectStore()
  const activeProject = projects.find(p => p.id === projectId)
  
  const tasks = useTaskStore(state => state.tasks)
  const projectTasks = tasks.filter(t => t.projectId === projectId)

  const [currentDate, setCurrentDate] = useState(new Date())

  // Navigation handlers
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const jumpToToday = () => setCurrentDate(new Date())

  // Generate the days for the current calendar grid
  const daysInGrid = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [currentDate])

  // Map tasks to events and generate some mock events for demonstration
  const events = useMemo(() => {
    const combinedEvents: CalendarEvent[] = []

    // 1. Map real tasks as deadlines (distributing them across the current month for demo purposes)
    projectTasks.forEach((task, index) => {
      combinedEvents.push({
        id: task.id,
        title: task.title,
        date: addDays(startOfMonth(currentDate), (index * 3) % 28 + 2), // Spreading tasks out
        type: 'deadline'
      })
    })

    // 2. Add mock events to demonstrate the required categories
    combinedEvents.push({
      id: 'evt-1',
      title: 'Sprint 5 Planning',
      date: addDays(startOfMonth(currentDate), 4),
      type: 'meeting'
    })
    
    combinedEvents.push({
      id: 'evt-2',
      title: 'v1.2.0 Production Release',
      date: addDays(startOfMonth(currentDate), 14),
      type: 'release'
    })

    combinedEvents.push({
      id: 'evt-3',
      title: 'Sarah (Leave)',
      date: addDays(startOfMonth(currentDate), 18),
      type: 'leave'
    })

    return combinedEvents
  }, [projectTasks, currentDate])

  // Helper to render the correct styling for each event type
  const renderEventPill = (event: CalendarEvent) => {
    switch (event.type) {
      case 'meeting':
        return (
          <div key={event.id} className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20 truncate">
            <Video className="w-3 h-3 shrink-0" />
            <span className="truncate">{event.title}</span>
          </div>
        )
      case 'release':
        return (
          <div key={event.id} className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/20 truncate">
            <Flag className="w-3 h-3 shrink-0" />
            <span className="truncate">{event.title}</span>
          </div>
        )
      case 'leave':
        return (
          <div key={event.id} className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 truncate">
            <Coffee className="w-3 h-3 shrink-0" />
            <span className="truncate">{event.title}</span>
          </div>
        )
      case 'deadline':
      default:
        return (
          <div key={event.id} className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded-md bg-orange-500/10 text-orange-600 border border-orange-500/20 truncate">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span className="truncate">{event.title}</span>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border border-border shadow-sm overflow-hidden">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-b border-border bg-card shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeProject?.name || "Project"} Timeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={jumpToToday}
            className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors mr-2"
          >
            Today
          </button>
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            <button 
              onClick={prevMonth}
              className="p-2 bg-card hover:bg-muted text-muted-foreground transition-colors border-r border-border"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 bg-card hover:bg-muted text-muted-foreground transition-colors"
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
        {daysInGrid.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isCurrentDay = isToday(day)
          
          // Get events for this specific day
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
                {dayEvents.map(renderEventPill)}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}