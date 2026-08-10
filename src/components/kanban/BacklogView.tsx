import React, { useState, useEffect } from "react"
import { Plus, AlignLeft, X, Trash2, CheckSquare, Target, AlertCircle, Search, Filter, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useTaskStore, type Task } from "@/store/useTaskStore"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function BacklogView() {
  const tasks = useTaskStore((state) => state.tasks)
  const addTask = useTaskStore((state) => state.addTask) 
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus)
  const updateTask = useTaskStore((state) => state.updateTask)
  const deleteTask = useTaskStore((state) => state.deleteTask)
  const deleteMultipleTasks = useTaskStore((state) => state.deleteMultipleTasks) 
  
  const backlogTasks = tasks.filter(task => task.status === "Backlog")
  
  const [searchQuery, setSearchQuery] = useState("")
  
  // --- UNIFIED MODAL STATE ---
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  
  const defaultTask: Partial<Task> = { title: "", description: "", acceptanceCriteria: [], priority: "Medium", points: 1, assignee: "LC", status: "Backlog" }
  const [formData, setFormData] = useState<Partial<Task>>(defaultTask)

  // --- DELETE MODAL STATE ---
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([])
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  
  // --- Close Modal on Escape Key ---
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsTaskModalOpen(false) }
    if (isTaskModalOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isTaskModalOpen])

  // --- Handlers for Unified Modal ---
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setIsTaskModalOpen(false)
  }

  const openCreateModal = () => {
    setFormData({ ...defaultTask })
    setModalMode('create')
    setEditingTaskId(null)
    setIsTaskModalOpen(true)
  }

  const openEditModal = (task: Task) => {
    setFormData({ ...task })
    setModalMode('edit')
    setEditingTaskId(task.id)
    setIsTaskModalOpen(true)
  }

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title?.trim()) return

    if (modalMode === 'create') {
      addTask({ ...formData, id: `TSK-${Math.floor(Math.random() * 900) + 100}`, status: "Backlog" } as Task)
      toast.success("Task added to backlog.")
    } else if (modalMode === 'edit' && editingTaskId) {
      updateTask(editingTaskId, formData)
      toast.success("Task updated successfully.")
    }
    setIsTaskModalOpen(false)
  }

  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20'
    }
  }

  const handleMoveToBoard = (e: React.MouseEvent, taskId: string, newStatus: string) => {
    e.stopPropagation() 
    updateTaskStatus(taskId, newStatus)
    toast.success("Task moved to Sprint Board!")
  }

  const toggleSelection = (e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
    if (e.target.checked) setSelectedForBulk([...selectedForBulk, taskId])
    else setSelectedForBulk(selectedForBulk.filter(id => id !== taskId))
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Product Backlog</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage, prioritize, and prep tasks before adding them to a sprint.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          
          {selectedForBulk.length > 0 && (
            <button 
              onClick={() => setIsBulkDeleteDialogOpen(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4" /> Delete ({selectedForBulk.length})
            </button>
          )}

          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" placeholder="Search backlog..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-3 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-all shadow-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
          
          <button 
            onClick={() => openCreateModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add to Backlog
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-6 md:col-span-5 flex items-center gap-3">
            <div className="w-4 h-4 shrink-0" />
            <span>Task</span>
          </div>
          <div className="col-span-2 hidden md:block">Project</div>
          <div className="col-span-2 md:col-span-2">Priority</div>
          <div className="col-span-1 hidden md:block">Points</div>
          <div className="col-span-3 md:col-span-2 text-right">Actions</div>
        </div>

        <div className="overflow-y-auto divide-y divide-border custom-scrollbar">
          {backlogTasks.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center h-40">
              <CheckSquare className="w-8 h-8 mb-3 opacity-20" />
              <p>Your backlog is empty.</p>
            </div>
          ) : (
            backlogTasks.map(task => {
              const isSelected = selectedForBulk.includes(task.id)
              
              return (
                <div 
                  key={task.id}
                  onClick={() => openEditModal(task)}
                  className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors cursor-pointer group ${
                    isSelected ? "bg-red-500/5 hover:bg-red-500/10" : "hover:bg-muted/30"
                  }`}
                >
                  <div className="col-span-6 md:col-span-5 flex items-start sm:items-center gap-3">
                    <input 
                      type="checkbox" checked={isSelected} onChange={(e) => toggleSelection(e, task.id)} onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 mt-0.5 sm:mt-0 rounded border-border text-red-500 focus:ring-red-500 cursor-pointer shrink-0"
                    />
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">{task.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{task.id}</span>
                        {(task.description || task.acceptanceCriteria) && <AlignLeft className="w-3 h-3 text-muted-foreground shrink-0" />}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 hidden md:flex items-center">
                    {task.project ? <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">{task.project}</span> : <span className="text-xs text-muted-foreground opacity-50">-</span>}
                  </div>
                  <div className="col-span-2 md:col-span-2 flex items-center">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                  </div>
                  <div className="col-span-1 hidden md:flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-xs font-medium border border-border">{task.points}</span>
                  </div>
                  <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setTaskToDelete(task.id); }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleMoveToBoard(e, task.id, "To Do")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 rounded-md text-xs font-medium transition-colors opacity-0 group-hover:opacity-100"
                    >
                      To Do <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* --- UNIFIED TASK MODAL --- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4" onClick={handleBackdropClick}>
          <div className="bg-card border border-border shadow-xl rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">{modalMode === 'create' ? 'Create New Backlog Task' : 'Edit Task'}</h3>
                {modalMode === 'edit' && editingTaskId && <span className="px-2 py-1 bg-background border border-border rounded text-xs font-semibold text-muted-foreground">{editingTaskId}</span>}
                {formData.project && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold uppercase tracking-wider">{formData.project}</span>}
              </div>
              <button type="button" onClick={() => setIsTaskModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveTask} className="flex-1 overflow-hidden flex flex-col md:flex-row">
              <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar border-r border-border">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">Task Title <span className="text-red-500">*</span></label>
                  <input type="text" required placeholder="e.g., Define user roles logic" value={formData.title || ""} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 text-lg font-semibold bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"/>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground"><AlignLeft className="w-4 h-4" /> Description</label>
                  <textarea placeholder="Add a more detailed description..." value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full min-h-[120px] p-3 text-sm bg-muted/30 border border-border/50 rounded-lg focus:border-primary/50 focus:bg-background outline-none transition-all resize-y"/>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground"><CheckSquare className="w-4 h-4" /> Acceptance Criteria</label>
                  <div className="space-y-2">
                    {formData.acceptanceCriteria?.map((criteria: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 group">
                        <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <input type="text" required value={criteria} onChange={(e) => { const newAC = [...(formData.acceptanceCriteria || [])]; newAC[idx] = e.target.value; setFormData({ ...formData, acceptanceCriteria: newAC }); }} className="flex-1 px-3 py-1.5 text-sm bg-background border border-border/50 focus:border-primary/50 rounded-md outline-none transition-all" placeholder="Enter criteria..."/>
                        <button type="button" onClick={() => { const newAC = [...(formData.acceptanceCriteria || [])]; newAC.splice(idx, 1); setFormData({ ...formData, acceptanceCriteria: newAC }); }} className="p-1.5 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setFormData({ ...formData, acceptanceCriteria: [...(formData.acceptanceCriteria || []), ""] })} className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 mt-2">
                      <Plus className="w-3 h-3" /> Add Criteria
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-72 bg-muted/10 p-6 space-y-6 shrink-0 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="space-y-6 flex-1">
                  
                  {/* Status is HIDDEN when creating a new Backlog task */}
                  {modalMode === 'edit' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status <span className="text-red-500">*</span></label>
                      <select required value={formData.status || "Backlog"} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer">
                        <option value="Backlog">Backlog</option><option value="To Do">To Do</option><option value="In Progress">In Progress</option><option value="Code Review">Code Review</option><option value="Testing">Testing</option><option value="Done">Done</option>
                      </select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignee <span className="text-red-500">*</span></label>
                    <input type="text" required value={formData.assignee || ""} onChange={(e) => setFormData({...formData, assignee: e.target.value})} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"/>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-2 p-2 bg-background border border-border rounded-lg">
                      <AlertCircle className={`w-4 h-4 shrink-0 ${formData.priority === 'Critical' ? 'text-red-500' : formData.priority === 'High' ? 'text-orange-500' : 'text-blue-500'}`} />
                      <select required value={formData.priority || "Medium"} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full text-sm bg-transparent outline-none cursor-pointer">
                        <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Story Points <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-2 p-2 bg-background border border-border rounded-lg focus-within:ring-2 focus-within:ring-primary/50">
                      <Target className="w-4 h-4 text-muted-foreground shrink-0" />
                      <input type="number" required min="1" value={formData.points || 1} onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 0})} className="w-full text-sm bg-transparent outline-none"/>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border space-y-3">
                  <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
                    {modalMode === 'create' ? 'Save to Backlog' : 'Save Changes'}
                  </button>
                  {modalMode === 'edit' && editingTaskId && (
                    <button type="button" onClick={() => setTaskToDelete(editingTaskId)} className="w-full flex items-center justify-center gap-2 p-2 text-sm text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-500/20">
                      <Trash2 className="w-4 h-4" /> Delete Task
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SINGLE Delete Shadcn Alert Dialog --- */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(isOpen) => !isOpen && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete this task from our servers.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (taskToDelete) {
                  deleteTask(taskToDelete)
                  setSelectedForBulk(prev => prev.filter(id => id !== taskToDelete))
                  if (taskToDelete === editingTaskId) setIsTaskModalOpen(false)
                  setTaskToDelete(null)
                  toast.success("Task deleted successfully.")
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- BULK Delete Shadcn Alert Dialog --- */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedForBulk.length} Tasks?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. You are about to permanently delete {selectedForBulk.length} tasks from your backlog.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                deleteMultipleTasks(selectedForBulk)
                setIsBulkDeleteDialogOpen(false)
                setSelectedForBulk([])
                toast.success(`${selectedForBulk.length} tasks deleted successfully.`)
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >Delete Selected</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}