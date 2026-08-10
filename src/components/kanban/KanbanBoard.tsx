import React, { useState } from "react"
import { Plus, MoreHorizontal, AlignLeft, X, Trash2, CheckSquare, Target, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useTaskStore } from "@/store/useTaskStore"

// We moved COLUMNS into the component state, but we keep the initial state here
const INITIAL_COLUMNS = ["To Do", "In Progress", "Code Review", "Testing", "Done"]

export function KanbanBoard() {
  // --- Board State ---
  const tasks = useTaskStore((state) => state.tasks)
  const addTask = useTaskStore((state) => state.addTask)
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus)
  const updateTask = useTaskStore((state) => state.updateTask) // NEW: for editing task details
  
  const [columns, setColumns] = useState(INITIAL_COLUMNS)
  const [activeColumn, setActiveColumn] = useState<string | null>(null)
  
  // --- Dynamic Column State ---
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")

  // --- Modal & Form State ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null) // NEW: Tracks which task is being viewed
  
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "Medium",
    points: 1,
    assignee: "LC", 
    status: "To Do" 
  })

  // NEW: Helper to get the full task object for the details modal
  const selectedTask = tasks.find(t => t.id === selectedTaskId)

  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20'
    }
  }

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId)
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = "0.5"
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1"
    setActiveColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault() 
    setActiveColumn(column)
  }

  const handleDragLeave = () => {
    setActiveColumn(null)
  }

  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault()
    setActiveColumn(null)
    const draggedTaskId = e.dataTransfer.getData("taskId")
    updateTaskStatus(draggedTaskId, targetColumn)
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    const createdTask = {
      ...newTask,
      id: `TSK-${Math.floor(Math.random() * 900) + 100}`, 
    }

    // Use global store action
    addTask(createdTask)
    
    setNewTask({ title: "", priority: "Medium", points: 1, assignee: "LC", status: columns[0] || "To Do" })
    setIsModalOpen(false)
  }

  // --- Column Management Handlers ---
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = newColumnName.trim()
    // Prevent empty names or duplicate columns
    if(!trimmedName){
      toast.error("Column name cannot be empty")
    }
    
    const columnExists = columns.some(col => col.toLowerCase() === trimmedName.toLowerCase())
    if(columnExists){
      toast.error("Column with this name already exists.")
      return
    }
    
    if (!trimmedName || columns.includes(trimmedName)) return
    
    setColumns([...columns, trimmedName])
    setNewColumnName("")
    setIsAddingColumn(false)
  }

  const handleDeleteColumn = (columnToDelete: string) => {
    setColumns(columns.filter(col => col !== columnToDelete))
    setActiveDropdown(null)
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
        <h2 className="text-xl font-semibold tracking-tight">Current Sprint Board</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 hover:shadow-md active:translate-y-0.5 transition-all duration-100 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 flex-1 items-start snap-x custom-scrollbar">
        {columns.map((column) => {
          const columnTasks = tasks.filter(task => task.status === column)
          const isDragActive = activeColumn === column
          
          return (
            <div 
              key={column} 
              onDragOver={(e) => handleDragOver(e, column)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column)}
              className={`flex flex-col min-w-[280px] md:min-w-[320px] w-[280px] md:w-[320px] max-h-full rounded-xl border shrink-0 snap-center sm:snap-start transition-colors duration-200 ${
                isDragActive ? "bg-primary/5 border-primary/50" : "bg-muted/30 border-border"
              }`}
            >
              <div className="p-4 flex items-center justify-between border-b border-border/50 shrink-0 relative">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">{column}</h3>
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-xs text-muted-foreground font-medium">
                    {columnTasks.length}
                  </span>
                </div>
                
                {/* 3-Dot Menu Trigger */}
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === column ? null : column)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {/* Dropdown Menu Overlay */}
                {activeDropdown === column && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setActiveDropdown(null)} 
                    />
                    <div className="absolute right-4 top-12 mt-1 w-40 bg-card border border-border shadow-lg rounded-lg z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                      <button 
                        onClick={() => handleDeleteColumn(column)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Column
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="p-3 flex flex-col gap-3 overflow-y-auto flex-1 custom-scrollbar">
                {columnTasks.map((task) => (
                  <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedTaskId(task.id)} // NEW: Open details modal on click
                    className="group p-4 bg-card rounded-lg border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-200 cursor-pointer flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    <p className="text-sm font-medium leading-snug">{task.title}</p>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="flex items-center gap-1 text-xs">
                          <AlignLeft className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-xs font-medium border border-border">
                          {task.points}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/20">
                          {task.assignee}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => {
                    setNewTask({ ...newTask, status: column })
                    setIsModalOpen(true)
                  }}
                  className="flex items-center gap-2 p-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors border border-transparent border-dashed hover:border-border mt-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Card
                </button>
              </div>
            </div>
          )
        })}

        {/* --- Add New Column UI --- */}
        <div className="flex flex-col min-w-[280px] md:min-w-[320px] w-[280px] md:w-[320px] shrink-0 snap-center sm:snap-start pt-1">
          {isAddingColumn ? (
            <form 
              onSubmit={handleAddColumn}
              className="p-3 bg-card rounded-xl border border-border shadow-sm flex flex-col gap-3"
            >
              <input 
                autoFocus
                type="text"
                placeholder="Column name..."
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <div className="flex items-center gap-2">
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Save
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setIsAddingColumn(false)
                    setNewColumnName("")
                  }}
                  className="flex-1 bg-muted text-muted-foreground py-1.5 rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : ( 
            <button 
              onClick={() => setIsAddingColumn(true)}
              className="flex items-center justify-center gap-2 h-14 bg-muted/20 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Column
            </button>
          )}
        </div>
      </div>

      {/* --- NEW: Task Details Modal Overlay --- */}
      {selectedTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card border border-border shadow-xl rounded-xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-background border border-border rounded text-xs font-semibold text-muted-foreground">
                  {selectedTask.id}
                </span>
                {selectedTask.project && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold uppercase tracking-wider">
                    {selectedTask.project}
                  </span>
                )}
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
                    onChange={(e) => updateTask(selectedTask.id, { status: e.target.value })}
                    className="w-full p-2 text-sm bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  >
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignee</label>
                  <div className="flex items-center gap-3 p-2 bg-background border border-border rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/20 shrink-0">
                      {selectedTask.assignee}
                    </div>
                    <input 
                      type="text"
                      value={selectedTask.assignee}
                      onChange={(e) => updateTask(selectedTask.id, { assignee: e.target.value })}
                      className="w-full text-sm bg-transparent outline-none"
                    />
                  </div>
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

      {/* --- Existing Create Task Modal Overlay --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card border border-border shadow-lg rounded-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Create New Task</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
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
                  placeholder="e.g., Implement WebSocket auth for Vaulrizz"
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
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}