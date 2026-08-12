"use client"

import * as React from "react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { FolderKanbanIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useProjectStore, type Project } from "@/store/useProjectStore"

export function NavProjects({ projects }: { projects: Project[] }) {
  const navigate = useNavigate()
  const { currentProjectId } = useProjectStore()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {projects.map((project) => {
          const isProjectActive = project.id === currentProjectId

          return (
            <SidebarMenuItem key={project.id}>
              <SidebarMenuButton 
                isActive={isProjectActive}
                onClick={() => navigate(`/projects/${project.id}/kanban`)}
                className="cursor-pointer"
              >
                <FolderKanbanIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{project.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}