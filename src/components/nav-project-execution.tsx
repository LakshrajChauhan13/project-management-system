"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, KanbanSquare, ListTodo, Calendar, Check } from "lucide-react"
import { useProjectStore } from "@/store/useProjectStore"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function NavProjectExecution() {
  const navigate = useNavigate()
  const { isMobile } = useSidebar()
  const [isOpen, setIsOpen] = useState(false)
  
  // Pulling global state
  const { projects, currentProjectId, setCurrentProjectId } = useProjectStore()
  const activeProject = projects.find(p => p.id === currentProjectId)

  const handleSelectProject = (projectId: string) => {
    setCurrentProjectId(projectId)
    setIsOpen(false)
  }

  // Child navigation items scoped to the active project
  const navItems = [
    { title: "Kanban Board", url: `/projects/${currentProjectId}/kanban`, icon: KanbanSquare },
    { title: "Product Backlog", url: `/projects/${currentProjectId}/backlog`, icon: ListTodo },
    { title: "Calendar", url: `/projects/${currentProjectId}/calendar`, icon: Calendar },
  ]

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'On Hold': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      case 'Completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }
  }

  return (
    <SidebarGroup>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        {/* FIXED: Replaced asChild with the render prop pattern */}
        <PopoverTrigger 
          render={
            <div className="flex flex-col cursor-pointer px-2 py-2 mb-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors group/trigger outline-none" />
          }
        >
          <div className="flex items-center justify-between text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
            <span>Project Execution</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {/* Dynamic Project Pill */}
          <div className="mt-1.5">
            {activeProject ? (
              <span className="inline-block border border-dashed border-amber-500 text-amber-600 bg-amber-500/10 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide shadow-sm truncate max-w-full">
                {activeProject.name}
              </span>
            ) : (
              <span className="inline-block border border-dashed border-muted-foreground/40 text-muted-foreground bg-muted/50 rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide">
                No project selected
              </span>
            )}
          </div>
        </PopoverTrigger>

        {/* Project Selection Listbox */}
        <PopoverContent 
          className="w-56 p-1 rounded-xl shadow-lg" 
          side={isMobile ? "bottom" : "right"} 
          align="start"
          sideOffset={8}
        >
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Select Project</div>
          <div className="flex flex-col max-h-64 overflow-y-auto custom-scrollbar">
            {projects.length === 0 ? (
              <div className="px-2 py-4 text-center text-xs text-muted-foreground">No projects available.</div>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleSelectProject(project.id)}
                  className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-muted transition-colors text-left text-sm"
                >
                  <span className="font-medium truncate pr-2">{project.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <div className="w-4 h-4 flex items-center justify-center">
                      {currentProjectId === project.id && <Check className="w-3.5 h-3.5 text-primary" />}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* FIXED: Removed delayDuration to satisfy strict types */}
      <TooltipProvider>
        <SidebarMenu>
          {navItems.map((item) => {
            const isDisabled = !currentProjectId
            return (
              <SidebarMenuItem key={item.title}>
                <Tooltip>
                  {/* FIXED: Replaced asChild with the render prop pattern */}
                  <TooltipTrigger 
                    render={<div className={isDisabled ? "cursor-not-allowed opacity-50" : ""} />}
                  >
                    <SidebarMenuButton 
                      onClick={(e) => {
                        if (isDisabled) {
                          e.preventDefault()
                        } else {
                          navigate(item.url)
                        }
                      }}
                      className={isDisabled ? "pointer-events-none" : "cursor-pointer"}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  
                  {isDisabled && (
                    <TooltipContent side="right" className="bg-primary text-primary-foreground font-medium text-xs">
                      Select a project first
                    </TooltipContent>
                  )}
                </Tooltip>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </TooltipProvider>
    </SidebarGroup>
  )
}