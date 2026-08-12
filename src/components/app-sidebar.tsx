"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { NavMain } from "@/components/nav-main"
import { NavProjectExecution } from "@/components/nav-project-execution" // Our new component
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { 
  Bot,
  Sparkles,
  LayoutDashboard,
  Briefcase, 
  FolderKanban
} from "lucide-react"

const data = {
  user: {
    name: "Lakshraj Chauhan",
    email: "lakshraj@sprintai.com",
    avatar: "/avatars/lakshraj.jpg",
  },
  teams: [
    { name: "SprintAI OS", logo: <Sparkles />, plan: "Enterprise" },
    { name: "Development", logo: <Briefcase />, plan: "Internal" }
  ],
  navMain: [
    {
      title: "Workspace",
      url: "/workspace",
      icon: LayoutDashboard, 
      isActive: true,
      items: [
        { title: "Dashboard", url: "/dashboard" },
        { title: "Reports", url: "/reports" },
      ],
    },
    {
      title: "AI Tools",
      url: "/ai-tools",
      icon: Bot,
      items: [
        { title: "AI Story Generator", url: "/ai-story" },
        { title: "AI Sprint Planner", url: "/ai-sprint-planner" },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      
      <SidebarContent>
        {/* Workspace & AI Tools */}
        <NavMain items={data.navMain} />
        
        {/* Dedicated Project Execution Group */}
        <NavProjectExecution />
      </SidebarContent>
      
      <SidebarFooter>
        {/* Standalone Manage Projects Link */}
        <SidebarGroup className="p-0 mb-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigate('/projects')}
                className="cursor-pointer text-sidebar-foreground/80 font-medium hover:text-foreground"
              >
                <FolderKanban className="w-4 h-4" />
                <span>Manage Projects</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}