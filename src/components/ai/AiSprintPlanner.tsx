"use client"

import React, { useState } from "react"
import { 
  Sparkles, 
  Calendar, 
  Users, 
  Target, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  Info, 
  Briefcase,
  Clock,
  Check
} from "lucide-react"
import { useTaskStore, type Task } from "@/store/useTaskStore"
import { useProjectStore } from "@/store/useProjectStore"
import { useTeamStore } from "@/store/useTeamStore" // NEW: Added Team Store
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useSprintStore } from "@/store/useSprintStore"

export function AISprintPlanner() {
  const navigate = useNavigate()
  
  // 1. Get Project Context
  const { currentProjectId, projects } = useProjectStore()
  const activeProject = projects.find(p => p.id === currentProjectId)

  // 2. Get Task Store Actions
  const { tasks: allTasks, updateTask } = useTaskStore()
  const { members } = useTeamStore()
  const { addSprint } = useSprintStore() // 3. Pull in the addSprint action
  
  // Filter dynamically to ONLY look at the active project's backlog
  const activeBacklogTasks = allTasks.filter(task => 
    task.status === "Backlog" && task.projectId === currentProjectId
  )

  // Form State
  const [capacity, setCapacity] = useState<number>(20)
  const [sprintName, setSprintName] = useState("Sprint 5: Core Features")
  const [duration, setDuration] = useState("2 Weeks") // NEW: Duration state
  
  // Generation & Selection State
  const [isGenerating, setIsGenerating] = useState(false)
  const [sprintPlan, setSprintPlan] = useState<Task[] | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]) // NEW: Selected team members

  const handleApproveSprint = () => {
    if (!sprintPlan || !currentProjectId) return

    if (selectedMembers.length === 0) {
      toast.error("Please select at least one team member for this sprint.")
      return
    }

    // A. Calculate Start and End Dates based on current time
    const startDate = new Date()
    const endDate = new Date(startDate)
    const durationInWeeks = parseInt(duration.split(" ")[0]) || 2
    endDate.setDate(startDate.getDate() + (durationInWeeks * 7))

    // B. Generate a new Sprint ID
    const newSprintId = `SPR-${Math.floor(Math.random() * 9000) + 1000}`

    // C. Save the new Sprint to our store
    addSprint({
      id: newSprintId,
      projectId: currentProjectId,
      name: sprintName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'Active'
    })

    // D. Update each planned task: move to 'To Do' AND link to the new Sprint
    sprintPlan.forEach(task => {
      updateTask(task.id, { 
        status: "To Do",
        sprintId: newSprintId 
      })
    })
    
    toast.success(`Sprint approved! Ends on ${endDate.toLocaleDateString()}.`)
    navigate(`/projects/${currentProjectId}/kanban`) 
  }
  
  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (activeBacklogTasks.length === 0) {
      toast.error("Your backlog for this project is empty! Add tasks via the Kanban board or AI Story Generator first.")
      return
    }

    setIsGenerating(true)
    setSprintPlan(null)
    // Pre-select all members by default for convenience, user can deselect
    setSelectedMembers(members.map(m => m.id))

    setTimeout(() => {
      let currentPoints = 0
      const selectedTasks: Task[] = []
      
      // Sort the active backlog by priority
      const sortedBacklog = [...activeBacklogTasks].sort((a, b) => {
        const priorityWeight = { "Critical": 3, "High": 2, "Medium": 1, "Low": 0 }
        return priorityWeight[b.priority as keyof typeof priorityWeight] - priorityWeight[a.priority as keyof typeof priorityWeight]
      })

      for (const task of sortedBacklog) {
        if (currentPoints + task.points <= capacity) {
          selectedTasks.push(task)
          currentPoints += task.points
        }
      }
      setSprintPlan(selectedTasks)
      setIsGenerating(false)
    }, 2000)
  }

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    )
  }

  const totalAllocatedPoints = sprintPlan?.reduce((sum, task) => sum + task.points, 0) || 0

  if (!currentProjectId) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-muted-foreground border border-dashed border-border rounded-xl p-12 max-w-5xl mx-auto">
        <Briefcase className="w-12 h-12 mb-4 opacity-20" />
        <h2 className="text-xl font-semibold text-foreground">No Project Selected</h2>
        <p className="text-sm mt-2 text-center">Please select a project from the sidebar to plan a sprint for it.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Sprint Planner</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Automatically draft optimal sprint backlogs for <span className="font-semibold text-foreground">{activeProject?.name}</span>.
          </p>
        </div>
      </div>

      {/* Instructional Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <strong>How it works:</strong> The AI generates the sprint plan exclusively from your active backlogs. View the Kanban board to see, edit, or prioritize all active backlogs before generating your plan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Configuration Panel */}
        <div className="lg:col-span-1 p-6 bg-card border border-border rounded-xl shadow-sm h-fit">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Sprint Parameters
          </h3>
          
          <form onSubmit={handleGeneratePlan} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sprint Name</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text"
                  required
                  value={sprintName}
                  onChange={(e) => setSprintName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* NEW: Duration Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer appearance-none"
                >
                  <option value="1 Week">1 Week</option>
                  <option value="2 Weeks">2 Weeks</option>
                  <option value="3 Weeks">3 Weeks</option>
                  <option value="4 Weeks">4 Weeks</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Team Capacity (Story Points)</label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input 
                  type="number"
                  min="5"
                  max="100"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Backlog...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Draft Plan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2">
          {!isGenerating && !sprintPlan && (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-card/50 border border-border border-dashed rounded-xl text-center">
              <div className="p-4 bg-muted/50 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">Ready to Plan</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Set your parameters and click generate. The AI will analyze the {activeProject?.name} backlog to recommend an optimal workload.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-card border border-border rounded-xl">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-sm font-medium animate-pulse">Calculating optimal task distribution...</p>
            </div>
          )}

          {sprintPlan && !isGenerating && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Points Allocated</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalAllocatedPoints} <span className="text-sm font-normal text-muted-foreground">/ {capacity}</span>
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                </div>
                
                <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Tasks Scheduled</p>
                    <p className="text-2xl font-bold text-foreground">{sprintPlan.length}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
              </div>

              {/* AI Rationale */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" /> AI Rationale
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Based on your {capacity}-point capacity limit for a {duration} sprint, I prioritized resolving critical foundational features for {activeProject?.name}. This selection maximizes value delivery while keeping the workload {capacity - totalAllocatedPoints} points under capacity to account for potential technical debt discovery.
                </p>
              </div>

              {/* NEW: Manual Team Selection */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <h3 className="font-medium text-sm">Select Sprint Team</h3>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {members.map(member => {
                    const isSelected = selectedMembers.includes(member.id)
                    return (
                      <div 
                        key={member.id} 
                        onClick={() => toggleMember(member.id)}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-muted border border-border text-[10px] font-bold flex items-center justify-center shrink-0">
                            {member.avatar}
                          </div>
                          <span className="text-sm font-medium truncate">{member.name}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Proposed Backlog */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <h3 className="font-medium text-sm">Proposed Sprint Backlog</h3>
                </div>
                <div className="divide-y divide-border">
                  {sprintPlan.map(task => (
                    <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-md bg-muted text-xs font-medium border border-border flex items-center justify-center shrink-0">
                          {task.points}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                              {task.projectId}
                            </span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                              task.priority === 'Critical' ? 'text-red-500' : 
                              task.priority === 'High' ? 'text-orange-500' : 'text-blue-500'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/20 shrink-0">
                        {task.assignee}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
                  <button
                    onClick={handleApproveSprint}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Approve & Start Sprint <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>  
    </div>
  )
}