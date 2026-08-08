"use client"

import * as React from "react"
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
import { 
  FolderKanban,
  Zap,
  Bot,
  Sparkles,
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Briefcase 
} from "lucide-react"

// Updated: Using absolute paths for React Router and un-invoked icon component references
const data = {
  user: {
    name: "Lakshraj Chauhan",
    email: "lakshraj@sprintai.com",
    avatar: "/avatars/lakshraj.jpg",
  },
  teams: [
    {
      name: "SprintAI OS",
      logo: <Sparkles />, 
      plan: "Enterprise",
    },
    {
      name: "Development",
      logo: <Briefcase />,
      plan: "Internal",
    }
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
      title: "Project Execution",
      url: "/execution",
      icon: FolderKanban,
      items: [
        { title: "All Projects", url: "/projects" },
        { title: "Kanban Board", url: "/kanban" },
        { title: "Calendar", url: "/calendar" },
      ],
    },
    {
      title: "AI Tools",
      url: "/ai-tools",
      icon: Bot,
      items: [
        { title: "AI Story Generator", url: "/ai-story" },
        { title: "AI Sprint Planner", url: "/ai-planner" },
      ],
    },
  ],
  projects: [
    {
      name: "OORLY Analytics",
      url: "/projects/oorly",
      icon: Zap,
    },
    {
      name: "Vaulrizz Chat",
      url: "/projects/vaulrizz",
      icon: Users,
    },
    {
      name: "SecondBrain V2",
      url: "/projects/secondbrain",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* NavMain and NavProjects will handle the routing via React Router */}
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}