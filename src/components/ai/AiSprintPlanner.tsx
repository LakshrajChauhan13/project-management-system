import React, { useState } from "react"
import { Sparkles, Calendar, Users, Target, Loader2, CheckCircle2, ArrowRight, Activity, Info } from "lucide-react"
import { useTaskStore, type Task } from "@/store/useTaskStore"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export function AISprintPlanner() {
  // 1. Get ALL tasks from the store
  const allTasks = useTaskStore((state) => state.tasks)
  const approveSprint = useTaskStore(state => state.approveSprint)
  const navigate = useNavigate()
  
  // 2. Filter dynamically to only look at tasks currently in the Backlog
  const activeBacklogTasks = allTasks.filter(task => task.status === "Backlog")

  const [capacity, setCapacity] = useState<number>(20)
  const [sprintName, setSprintName] = useState("Sprint 5: Core Features")
  const [isGenerating, setIsGenerating] = useState(false)
  const [sprintPlan, setSprintPlan] = useState<Task[] | null>(null)

  const handleApproveSprint = () => {
    if (!sprintPlan) return

    // We just pass the IDs of the approved tasks to move them to "To Do"
    const approvedTaskIds = sprintPlan.map(task => task.id)
    approveSprint(approvedTaskIds)
    
    toast.success("Sprint approved! Tasks moved to 'To Do' on your board.")
    navigate("/kanban") 
  }
  
  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (activeBacklogTasks.length === 0) {
      toast.error("Your backlog is empty! Add tasks via the Kanban board or AI Story Generator first.")
      return
    }

    setIsGenerating(true)
    setSprintPlan(null)

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

  const totalAllocatedPoints = sprintPlan?.reduce((sum, task) => sum + task.points, 0) || 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Sprint Planner</h2>
          <p className="text-muted-foreground text-sm mt-1">Automatically draft optimal sprint backlogs based on team capacity and priority.</p>
        </div>
      </div>

      {/* NEW: Instructional Banner */}
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
                    Enter your team's capacity and click generate. The AI will analyze the backlog to recommend an optimal workload.
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
                    Based on your {capacity}-point capacity limit, I prioritized resolving critical foundational features for Vaulrizz and OORLY. This selection maximizes value delivery while keeping the workload {capacity - totalAllocatedPoints} points under capacity to account for potential technical debt discovery.
                    </p>
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
                            <div className="w-6 h-6 rounded-md bg-muted text-xs font-medium border border-border flex items-center justify-center">
                            {task.points}
                            </div>
                            <div>
                            <p className="text-sm font-medium">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                {task.project}
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
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/20">
                            {task.assignee}
                        </div>
                        </div>
                    ))}
                    </div>
                    <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
                    <button
                        onClick={handleApproveSprint}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
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