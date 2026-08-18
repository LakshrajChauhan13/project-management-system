"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Sparkles, LayoutDashboard, Briefcase } from "lucide-react"
import { useProjectStore } from "@/store/useProjectStore"

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
        { title: "Team", url: "/team" },
        { title: "Calendar", url: "/calendar" }, // <-- ADDED THIS LINE
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { projects } = useProjectStore()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      
      <SidebarContent>
        {/* Global Workspace Nav */}
        <NavMain items={data.navMain} />
        
        {/* Collapsible Projects Group */}
        <NavProjects projects={projects} />
      </SidebarContent>
      
      <SidebarFooter>
        {/* Removed the standalone Manage Projects link to match the new Jira-style IA */}
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}