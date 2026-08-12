import { useEffect, useState } from "react"
import { Outlet, useParams, Navigate, useLocation, Link, useNavigate } from "react-router-dom"
import { useProjectStore } from "@/store/useProjectStore"
import { toast } from "sonner"
import { ChevronDown, Check } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  
  const { projects, currentProjectId, setCurrentProjectId } = useProjectStore()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const activeProject = projects.find(p => p.id === projectId)

  // 1. Sync URL to Global Store
  useEffect(() => {
    if (activeProject && currentProjectId !== projectId) {
      setCurrentProjectId(projectId || null)
    }
  }, [projectId, currentProjectId, activeProject, setCurrentProjectId])

  // 2. Edge Case: Project not found
  if (!activeProject) {
    toast.error("Project not found.")
    return <Navigate to="/projects" replace />
  }

  const handleSwitchProject = (newProjectId: string) => {
    setIsPopoverOpen(false)
    // Navigate to the exact same tab, but for the new project
    const currentTab = location.pathname.split('/').pop()
    navigate(`/projects/${newProjectId}/${currentTab}`)
  }

  const tabs = [
    { name: 'Kanban Board', path: 'kanban' },
    { name: 'Product Backlog', path: 'backlog' },
    { name: 'Calendar', path: 'calendar' },
    { name: 'AI Sprint Planner', path: 'ai-sprint-planner' },
    { name: 'AI Story Generator', path: 'ai-story-generator' },
  ]

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      
      {/* Contextual Sub-Nav Bar */}
      <div className="border-b border-border bg-background pt-2 px-6 flex flex-col gap-4 shrink-0">
        
        {/* Project Identity Pill with Popover Switcher */}
        <div className="flex items-center">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger 
              render={<button className="outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full" />}
            >
              <div className="flex items-center gap-1.5 border border-dashed border-amber-500 text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 transition-colors rounded-full px-3 py-1 text-sm font-medium cursor-pointer shadow-sm">
                <span className="truncate max-w-[200px]">{activeProject.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPopoverOpen ? 'rotate-180' : ''}`} />
              </div>
            </PopoverTrigger>
            
            <PopoverContent align="start" className="w-64 p-1 rounded-xl shadow-lg mt-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Switch Project</div>
              <div className="flex flex-col max-h-64 overflow-y-auto custom-scrollbar mt-1">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSwitchProject(project.id)}
                    className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-muted transition-colors text-left text-sm"
                  >
                    <span className="font-medium truncate pr-2">{project.name}</span>
                    {projectId === project.id && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Horizontal Tab List */}
        <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar no-scrollbar-on-mobile">
          {tabs.map(tab => {
            const isActive = location.pathname.includes(`/projects/${projectId}/${tab.path}`)
            return (
              <Link
                key={tab.path}
                to={`/projects/${projectId}/${tab.path}`}
                className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  isActive 
                    ? 'border-primary text-foreground' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.name}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Feature Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  )
}