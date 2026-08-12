"use client"

import React, { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  FolderKanban, 
  MoreVertical, 
  X, 
  Trash2, 
  CheckCircle2, 
  Pencil,
  Briefcase
} from "lucide-react"
import { toast } from "sonner"
import { useProjectStore, type Project } from "@/store/useProjectStore"

// Shadcn UI Imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

export function ProjectListView() {
  // Global Store State
  const { 
    projects, 
    currentProjectId, 
    setCurrentProjectId, 
    addProject, 
    updateProject, 
    deleteProject 
  } = useProjectStore()
  
  // Local UI State
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  
  const defaultProject: Partial<Project> = { name: "", description: "", status: "Active", priority: "Medium" }
  const [formData, setFormData] = useState<Partial<Project>>(defaultProject)

  // Client-side filtering (debouncing simulated via controlled input for simplicity, but reacts instantly)
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Keyboard accessibility for modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsModalOpen(false) }
    if (isModalOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isModalOpen])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setIsModalOpen(false)
  }

  // Modal Handlers
  const openCreateModal = () => {
    setFormData({ ...defaultProject })
    setModalMode('create')
    setIsModalOpen(true)
  }

  const openEditModal = (project: Project) => {
    setFormData({ ...project })
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) return

    if (modalMode === 'create') {
      addProject({ 
        ...formData, 
        id: `PRJ-${Math.floor(Math.random() * 9000) + 1000}` 
      } as Project)
      toast.success("Project created successfully.")
    } else if (modalMode === 'edit' && formData.id) {
      updateProject(formData.id, formData)
      toast.success("Project updated successfully.")
    }
    setIsModalOpen(false)
  }

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id)
      setProjectToDelete(null)
      toast.success(`Project deleted successfully.`)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      case 'On Hold': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      case 'Completed': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      case 'Archived': return 'text-slate-500 bg-slate-500/10 border-slate-500/20'
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20'
    }
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground mt-1">All Projects</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <button 
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* Project Grid & Empty State */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground border border-dashed border-border rounded-xl p-12">
            <Briefcase className="w-16 h-16 mb-4 opacity-20" />
            <h2 className="text-xl font-semibold text-foreground">No projects yet</h2>
            <p className="text-sm mt-2 mb-6">Create a project to start managing tasks and sprints.</p>
            <button 
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const isCurrent = currentProjectId === project.id

              return (
                <div 
                  key={project.id}
                  className={`group flex flex-col bg-card rounded-xl shadow-sm transition-all overflow-hidden ${
                    isCurrent 
                      ? "border-2 border-dashed border-amber-500 shadow-md" 
                      : "border border-border hover:shadow-md hover:border-primary/50"
                  }`}
                >
                  <div className="p-5 flex-1 relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold tracking-wide ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        {isCurrent && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Active Context
                          </span>
                        )}
                      </div>
                      
                      {/* Robust Dropdown Menu with render prop to avoid asChild errors */}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button className="text-muted-foreground hover:bg-muted hover:text-foreground p-1.5 rounded-md transition-colors outline-none focus:ring-2 focus:ring-primary/50" />
                          }
                        >
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => {
                              setCurrentProjectId(project.id)
                              toast.success(`${project.name} set as current project.`)
                            }}
                            className="cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Set as current project
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditModal(project)} className="cursor-pointer">
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setProjectToDelete(project)} 
                            className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2 text-foreground line-clamp-1">{project.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description || "No description provided."}</p>
                  </div>
                  
                  <div className="px-5 py-3 bg-muted/30 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <span>Priority:</span>
                      <span className={project.priority === 'Critical' ? 'text-red-500' : project.priority === 'High' ? 'text-orange-500' : 'text-foreground'}>
                        {project.priority}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* --- UNIFIED CREATE/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4" onClick={handleBackdropClick}>
          <div className="bg-card border border-border shadow-xl rounded-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold">{modalMode === 'create' ? 'Create New Project' : 'Edit Project'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSaveProject} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="e.g., UI Redesign" value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"/>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea rows={3} placeholder="Briefly describe the project goals..." value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                  <select required value={formData.status || "Active"} onChange={(e) => setFormData({...formData, status: e.target.value as Project['status']})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer">
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority <span className="text-red-500">*</span></label>
                  <select required value={formData.priority || "Medium"} onChange={(e) => setFormData({...formData, priority: e.target.value as Project['priority']})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                  {modalMode === 'create' ? 'Create Project' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DESTRUCTIVE DELETE CONFIRMATION --- */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(isOpen) => !isOpen && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete '{projectToDelete?.name}'?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}