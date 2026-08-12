import React, { useState, useEffect } from "react"
import { Plus, MoreHorizontal, AlignLeft, X, Trash2, CheckSquare, Target, AlertCircle, Briefcase } from "lucide-react"
import { toast } from "sonner"
import { useTaskStore, type Task } from "@/store/useTaskStore"
import { useProjectStore } from "@/store/useProjectStore" 
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
import { useParams } from "react-router-dom"

const INITIAL_COLUMNS = ["To Do", "In Progress", "Code Review", "Testing", "Done"]

export function KanbanBoard() {
  // NEW: Updated to use currentProjectId from our refactored store
  const { projectId } = useParams<{ projectId: string }>() // Extract ID from the URL
  const { currentProjectId, setCurrentProjectId } = useProjectStore() 
  
  // FIXED: Destructuring directly prevents the implicit 'any' type error on 'state'
  const { tasks, addTask, updateTaskStatus, updateTask, deleteTask, deleteMultipleTasks } = useTaskStore()
  
  // Filter tasks scoped to the globally selected project
  const projectTasks = tasks.filter(task => task.projectId === currentProjectId)

  const [columns, setColumns] = useState(INITIAL_COLUMNS)
  const [activeColumn, setActiveColumn] = useState<string | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  
  const defaultTask: Partial<Task> = { title: "", description: "", acceptanceCriteria: [], priority: "Medium", points: 1, assignee: "LC", status: "To Do" }
  const [formData, setFormData] = useState<Partial<Task>>(defaultTask)

  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([])
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if(projectId && projectId !== currentProjectId){
      setCurrentProjectId(projectId)
    }
  }, [projectId, currentProjectId, setCurrentProjectId])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsTaskModalOpen(false) }
    if (isTaskModalOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isTaskModalOpen])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setIsTaskModalOpen(false)
  }

  const openCreateModal = (defaultStatus = columns[0]) => {
    setFormData({ ...defaultTask, status: defaultStatus })
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
    if (!formData.title?.trim() || !currentProjectId) return

    if (modalMode === 'create') {
      addTask({ 
        ...formData, 
        id: `TSK-${Math.floor(Math.random() * 900) + 100}`,
        projectId: currentProjectId // Inject the active project ID on creation
      } as Task)
      toast.success("Task created successfully.")
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

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId)
    setTimeout(() => { (e.target as HTMLElement).style.opacity = "0.4" }, 0)
  }
  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1"
    setActiveColumn(null)
  }
  const handleDragOver = (e: React.DragEvent, column: string) => { e.preventDefault(); setActiveColumn(column) }
  const handleDragLeave = (e: React.DragEvent) => { if (e.currentTarget === e.target) setActiveColumn(null) }
  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault(); setActiveColumn(null); const draggedTaskId = e.dataTransfer.getData("taskId"); updateTaskStatus(draggedTaskId, targetColumn)
  }

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = newColumnName.trim()
    if(!trimmedName) return toast.error("Column name cannot be empty")
    if(columns.some(col => col.toLowerCase() === trimmedName.toLowerCase())) return toast.error("Column with this name already exists.")
    setColumns([...columns, trimmedName])
    setNewColumnName("")
    setIsAddingColumn(false)
  }

  const toggleSelection = (e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
    if (e.target.checked) setSelectedForBulk([...selectedForBulk, taskId])
    else setSelectedForBulk(selectedForBulk.filter(id => id !== taskId))
  }

  // Guard clause if no project is selected
  if (!currentProjectId) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-muted-foreground border border-dashed border-border rounded-xl p-12">
        <Briefcase className="w-12 h-12 mb-4 opacity-20" />
        <h2 className="text-xl font-semibold text-foreground">No Project Selected</h2>
        <p className="text-sm mt-2">Please select a project from the "Project Execution" menu in the sidebar.</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
        <h2 className="text-xl font-semibold tracking-tight">Current Sprint Board</h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedForBulk.length > 0 && (
            <button 
              onClick={() => setIsBulkDeleteDialogOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4" /> Delete Selected ({selectedForBulk.length})
            </button>
          )}
          <button 
            onClick={() => openCreateModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 hover:shadow-md active:translate-y-0.5 transition-all duration-100 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 flex-1 items-start snap-x custom-scrollbar">
        {columns.map((column) => {
          const columnTasks = projectTasks.filter(task => task.status === column)
          const isDragActive = activeColumn === column
          
          return (
            <div 
              key={column} 
              onDragOver={(e) => handleDragOver(e, column)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, column)}
              className={`flex flex-col min-w-[280px] md:min-w-[320px] w-[280px] md:w-[320px] max-h-full rounded-xl border shrink-0 snap-center sm:snap-start transition-all duration-200 ${
                isDragActive ? "bg-primary/10 border-primary border-dashed shadow-inner ring-2 ring-primary/20 scale-[1.01]" : "bg-muted/30 border-border"
              }`}
            >
              <div className="p-4 flex items-center justify-between border-b border-border/50 shrink-0 relative">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">{column}</h3>
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-xs text-muted-foreground font-medium">{columnTasks.length}</span>
                </div>
                <button onClick={() => setActiveDropdown(activeDropdown === column ? null : column)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {activeDropdown === column && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                    <div className="absolute right-4 top-12 mt-1 w-40 bg-card border border-border shadow-lg rounded-lg z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                      <button onClick={() => { setColumns(columns.filter(col => col !== column)); setActiveDropdown(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-4 h-4" /> Delete Column
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="p-3 flex flex-col gap-3 overflow-y-auto flex-1 custom-scrollbar">
                {columnTasks.map((task) => {
                  const isSelected = selectedForBulk.includes(task.id)
                  
                  return (
                    <div 
                      key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} onDragEnd={handleDragEnd}
                      onClick={() => openEditModal(task)} 
                      className={`group p-4 bg-card rounded-lg border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col gap-3 ${
                        isSelected ? "border-red-500/50 bg-red-500/5 ring-1 ring-red-500/20" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" checked={isSelected} onChange={(e) => toggleSelection(e, task.id)} onClick={(e) => e.stopPropagation()} 
                            className="w-3.5 h-3.5 rounded border-border text-red-500 focus:ring-red-500 cursor-pointer"
                          />
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setTaskToDelete(task.id); }}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 p-1 rounded transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-medium leading-snug">{task.title}</p>
                      
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <div className="flex items-center gap-1 text-xs">{(task.description || task.acceptanceCriteria) && <AlignLeft className="w-3.5 h-3.5" />}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-xs font-medium border border-border">{task.points}</span>
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/20">{task.assignee}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <button 
                  onClick={() => openCreateModal(column)}
                  className="flex items-center gap-2 p-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors border border-transparent border-dashed hover:border-border mt-1"
                >
                  <Plus className="w-4 h-4" /> Add Card
                </button>
              </div>
            </div>
          )
        })}

        <div className="flex flex-col min-w-[280px] md:min-w-[320px] w-[280px] md:w-[320px] shrink-0 snap-center sm:snap-start pt-1">
          {isAddingColumn ? (
            <form onSubmit={handleAddColumn} className="p-3 bg-card rounded-xl border border-border shadow-sm flex flex-col gap-3">
              <input autoFocus type="text" placeholder="Column name..." value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"/>
              <div className="flex items-center gap-2">
                <button type="submit" className="flex-1 bg-primary text-primary-foreground py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">Save</button>
                <button type="button" onClick={() => { setIsAddingColumn(false); setNewColumnName(""); }} className="flex-1 bg-muted text-muted-foreground py-1.5 rounded-md text-sm font-medium hover:bg-muted/80 transition-colors">Cancel</button>
              </div>
            </form>
          ) : ( 
            <button onClick={() => setIsAddingColumn(true)} className="flex items-center justify-center gap-2 h-14 bg-muted/20 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
              <Plus className="w-4 h-4" /> Add Column
            </button>
          )}
        </div>
      </div>

      {/* --- UNIFIED TASK MODAL --- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4" onClick={handleBackdropClick}>
          <div className="bg-card border border-border shadow-xl rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">{modalMode === 'create' ? 'Create New Task' : 'Edit Task'}</h3>
                {modalMode === 'edit' && editingTaskId && <span className="px-2 py-1 bg-background border border-border rounded text-xs font-semibold text-muted-foreground">{editingTaskId}</span>}
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
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status <span className="text-red-500">*</span></label>
                    <select required value={formData.status || "To Do"} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer">
                      <option value="Backlog">Backlog</option>
                      {columns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>
                  
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
                    {modalMode === 'create' ? 'Create Task' : 'Save Changes'}
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

      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedForBulk.length} Tasks?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. You are about to permanently delete {selectedForBulk.length} tasks from your project.</AlertDialogDescription>
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