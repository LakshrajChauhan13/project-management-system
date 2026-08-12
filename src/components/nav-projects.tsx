"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { 
  ChevronRight, 
  Plus, 
  MoreHorizontal, 
  X,
  Layers,
  Settings
} from "lucide-react"
import { toast } from "sonner"
import { useProjectStore, type Project } from "@/store/useProjectStore"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible"

export function NavProjects({ projects }: { projects: Project[] }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentProjectId, setCurrentProjectId, addProject } = useProjectStore()

  // --- Local Storage Persistence for Collapsible State ---
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebar-projects-expanded')
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    localStorage.setItem('sidebar-projects-expanded', JSON.stringify(isExpanded))
  }, [isExpanded])

  // --- Inline Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const defaultProject: Partial<Project> = { name: "", description: "", status: "Active", priority: "Medium" }
  const [formData, setFormData] = useState<Partial<Project>>(defaultProject)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsModalOpen(false) }
    if (isModalOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isModalOpen])

  const openCreateModal = () => {
    setFormData({ ...defaultProject })
    setIsModalOpen(true)
  }

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) return

    addProject({ 
      ...formData, 
      id: `PRJ-${Math.floor(Math.random() * 9000) + 1000}` 
    } as Project)
    
    toast.success("Project created successfully.")
    setIsModalOpen(false)
  }

  return (
    <>
      {/* FIXED: Removed group-data-[collapsible=icon]:hidden so it stays visible */}
      <SidebarGroup>
        
        <SidebarGroupLabel>Project Execution</SidebarGroupLabel>
        
        <SidebarMenu>
          <SidebarMenuItem>
            {/* NATIVE COLLAPSIBLE WRAPPER */}
            <Collapsible 
              open={isExpanded} 
              onOpenChange={setIsExpanded}
              className="group/collapsible w-full"
            >
              {/* TRIGGER USING RENDER PROP & TOOLTIP */}
              <CollapsibleTrigger 
                className="group/projects-header w-full"
                render={<SidebarMenuButton tooltip="Projects" />}
              >
                {/* FIXED: Icon is now a direct child for Shadcn collapsed state */}
                <Layers />
                <span>Projects</span>
                
                {/* FIXED: ml-auto pushes actions to the right, and this div hides when collapsed */}
                <div className="ml-auto flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                  
                  {/* Hover Action Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover/projects-header:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); openCreateModal(); }} 
                      className="hover:bg-sidebar-accent-foreground/10 text-sidebar-foreground p-1 rounded-md transition-colors"
                      title="Create Project"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/projects'); }} 
                      className="hover:bg-sidebar-accent-foreground/10 text-sidebar-foreground p-1 rounded-md transition-colors"
                      title="Manage Projects"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {/* Chevron Toggle driven securely by our React state */}
                  <ChevronRight 
                    className={`transition-transform duration-200 ${
                      isExpanded ? 'rotate-90' : ''
                    }`} 
                  />
                </div>
              </CollapsibleTrigger>

              {/* ANIMATED CONTENT WRAPPER */}
              <CollapsibleContent>
                <SidebarMenuSub>
                  {projects.length === 0 ? (
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton className="text-muted-foreground opacity-50">
                        No projects found
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ) : (
                    projects.map((project) => {
                      const isProjectActive = currentProjectId === project.id && location.pathname.includes(`/projects/${project.id}`)

                      return (
                        <SidebarMenuSubItem key={project.id}>
                          <SidebarMenuSubButton 
                            isActive={isProjectActive}
                            onClick={() => {
                              setCurrentProjectId(project.id)
                              navigate(`/projects/${project.id}/kanban`)
                            }}
                            className={`cursor-pointer transition-colors ${
                              isProjectActive 
                                ? 'text-foreground font-medium' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <span className="truncate">{project.name}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })
                  )}

                  <div className="h-px bg-border my-2 mx-2 opacity-50" />

                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton 
                      onClick={() => navigate('/projects')}
                      className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Settings className="w-4 h-4 shrink-0" />
                      <span>Manage Projects</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* --- CREATE PROJECT MODAL --- */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4" 
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}
        >
          <div className="bg-card border border-border shadow-xl rounded-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Create New Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProject} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., UI Redesign" 
                  value={formData.name || ""} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  rows={3} 
                  placeholder="Briefly describe the project goals..." 
                  value={formData.description || ""} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                  <select 
                    required 
                    value={formData.status || "Active"} 
                    onChange={(e) => setFormData({...formData, status: e.target.value as Project['status']})} 
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority <span className="text-red-500">*</span></label>
                  <select 
                    required 
                    value={formData.priority || "Medium"} 
                    onChange={(e) => setFormData({...formData, priority: e.target.value as Project['priority']})} 
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}