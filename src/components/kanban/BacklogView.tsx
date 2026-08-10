import React, { useState } from "react"
import { Plus, MoreHorizontal, AlignLeft, X, Trash2, CheckSquare, Target, AlertCircle, Search, Filter, ArrowRight } from "lucide-react"
import { useTaskStore } from "@/store/useTaskStore"

export function BacklogView() {
  // --- Global Store ---
  const tasks = useTaskStore((state) => state.tasks)
  const addTask = useTaskStore((state) => state.addTask) // NEW: Added to handle creation
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus)
  const updateTask = useTaskStore((state) => state.updateTask)
  
  // Filter for only Backlog tasks
  const backlogTasks = tasks.filter(task => task.status === "Backlog")
  
  // --- UI State ---
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  // --- Create Task Modal State ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "Medium",
    points: 1,
    assignee: "LC", 
    status: "Backlog" // Defaults directly to the backlog
  })

  const selectedTask = tasks.find(t => t.id === selectedTaskId)

  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20'
    }
  }

  // --- Handlers ---
  const handleMoveToBoard = (e: React.MouseEvent, taskId: string, newStatus: string) => {
    e.stopPropagation() 
    updateTaskStatus(taskId, newStatus)
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    addTask({
      ...newTask,
      id: `TSK-${Math.floor(Math.random() * 900) + 100}`, 
    })
    
    // Reset form and close
    setNewTask({ title: "", priority: "Medium", points: 1, assignee: "LC", status: "Backlog" })
    setIsCreateModalOpen(false)
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Product Backlog</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage, prioritize, and prep tasks before adding them to a sprint.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search backlog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-3 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-all shadow-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
          
          {/* NEW: Add Task Trigger Button */}
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add to Backlog
          </button>
        </div>
      </div>

      {/* Backlog List */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-6 md:col-span-5">Task</div>
          <div className="col-span-2 hidden md:block">Project</div>
          <div className="col-span-3 md:col-span-2">Priority</div>
          <div className="col-span-2 hidden md:block">Points</div>
          <div className="col-span-3 md:col-span-1 text-right">Actions</div>
        </div>

        <div className="overflow-y-auto divide-y divide-border custom-scrollbar">
          {backlogTasks.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center h-40">
              <CheckSquare className="w-8 h-8 mb-3 opacity-20" />
              <p>Your backlog is empty.</p>
            </div>
          ) : (
            backlogTasks.map(task => (
              <div 
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                <div className="col-span-6 md:col-span-5 flex flex-col gap-1">
                  <span className="text-sm font-medium text-foreground line-clamp-1">{task.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{task.id}</span>
                    {(task.description || task.acceptanceCriteria) && (
                      <AlignLeft className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                <div className="col-span-2 hidden md:flex items-center">
                  {task.project ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                      {task.project}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground opacity-50">-</span>
                  )}
                </div>

                <div className="col-span-3 md:col-span-2 flex items-center">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>

                <div className="col-span-2 hidden md:flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-xs font-medium border border-border">
                    {task.points}
                  </span>
                </div>

                <div className="col-span-3 md:col-span-1 flex items-center justify-end">
                  <button 
                    onClick={(e) => handleMoveToBoard(e, task.id, "To Do")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 rounded-md text-xs font-medium transition-colors opacity-0 group-hover:opacity-100"
                  >
                    To Do <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- Task Details Modal --- */}
      {selectedTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card border border-border shadow-xl rounded-xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-background border border-border rounded text-xs font-semibold text-muted-foreground">
                  {selectedTask.id}
                </span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold uppercase tracking-wider">
                  {selectedTask.project || "Unassigned"}
                </span>
              </div>
              <button 
                onClick={() => setSelectedTaskId(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
              
              <div className="flex-1 p-6 space-y-8 border-r border-border">
                <div>
                  <textarea 
                    value={selectedTask.title}
                    onChange={(e) => updateTask(selectedTask.id, { title: e.target.value })}
                    className="w-full text-2xl font-bold bg-transparent border border-transparent hover:border-border/50 focus:border-primary/50 focus:bg-background rounded-lg p-2 resize-none outline-none transition-all"
                    rows={2}
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                    <AlignLeft className="w-4 h-4" /> Description
                  </h3>
                  <textarea 
                    placeholder="Add a more detailed description..."
                    value={selectedTask.description || ""}
                    onChange={(e) => updateTask(selectedTask.id, { description: e.target.value })}
                    className="w-full min-h-[120px] p-3 text-sm bg-muted/30 border border-border/50 rounded-lg hover:border-border focus:border-primary/50 focus:bg-background outline-none transition-all resize-y"
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                    <CheckSquare className="w-4 h-4" /> Acceptance Criteria
                  </h3>
                  <div className="space-y-2">
                    {selectedTask.acceptanceCriteria && selectedTask.acceptanceCriteria.length > 0 ? (
                      selectedTask.acceptanceCriteria.map((criteria, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-background shadow-sm group">
                          <input type="checkbox" className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
                          <input 
                            type="text"
                            value={criteria}
                            onChange={(e) => {
                              const newCriteria = [...(selectedTask.acceptanceCriteria || [])];
                              newCriteria[idx] = e.target.value;
                              updateTask(selectedTask.id, { acceptanceCriteria: newCriteria });
                            }}
                            className="flex-1 text-sm bg-transparent outline-none border-b border-transparent focus:border-primary/50"
                          />
                        </div>
                      ))
                    ) : (
                      <button className="text-sm text-muted-foreground p-3 w-full border border-dashed border-border rounded-lg hover:bg-muted/50 hover:text-foreground transition-all">
                        + Add Acceptance Criteria
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-72 bg-muted/10 p-6 space-y-6 shrink-0">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                  <select 
                    value={selectedTask.status}
                    onChange={(e) => {
                      updateTask(selectedTask.id, { status: e.target.value })
                      if(e.target.value !== "Backlog") setSelectedTaskId(null)
                    }}
                    className="w-full p-2 text-sm bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Code Review">Code Review</option>
                    <option value="Testing">Testing</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</label>
                  <div className="flex items-center gap-2 p-2 bg-background border border-border rounded-lg">
                    <AlertCircle className={`w-4 h-4 shrink-0 ${selectedTask.priority === 'Critical' ? 'text-red-500' : selectedTask.priority === 'High' ? 'text-orange-500' : 'text-blue-500'}`} />
                    <select 
                      value={selectedTask.priority}
                      onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value })}
                      className="w-full text-sm bg-transparent outline-none cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Story Points</label>
                  <div className="flex items-center gap-2 p-2 bg-background border border-border rounded-lg focus-within:ring-2 focus-within:ring-primary/50">
                    <Target className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input 
                      type="number"
                      min="1"
                      value={selectedTask.points}
                      onChange={(e) => updateTask(selectedTask.id, { points: parseInt(e.target.value) || 0 })}
                      className="w-full text-sm bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- NEW: Create Task Modal --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card border border-border shadow-lg rounded-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Create New Backlog Task</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Define user roles logic"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Story Points</label>
                  <input 
                    type="number"
                    min="1"
                    max="21"
                    value={newTask.points}
                    onChange={(e) => setNewTask({...newTask, points: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assignee</label>
                  <input 
                    type="text"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    value={newTask.status}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Code Review">Code Review</option>
                    <option value="Testing">Testing</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border mt-6">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Save to Backlog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}