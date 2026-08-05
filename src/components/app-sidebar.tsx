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

// Updated: Using strings for 'url' as our tab IDs, and un-invoked icon references
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
      url: "workspace",
      icon: <LayoutDashboard />, 
      isActive: true,
      items: [
        { title: "Dashboard", url: "dashboard" },
        { title: "Reports", url: "reports" },
      ],
    },
    {
      title: "Project Execution",
      url: "execution",
      icon: <FolderKanban />,
      items: [
        { title: "All Projects", url: "projects" },
        { title: "Kanban Board", url: "kanban" },
        { title: "Calendar", url: "calendar" },
      ],
    },
    {
      title: "AI Tools",
      url: "ai-tools",
      icon: <Bot />,
      items: [
        { title: "AI Story Generator", url: "ai-story" },
        { title: "AI Sprint Planner", url: "ai-planner" },
      ],
    },
  ],
  projects: [
    {
      name: "OORLY Analytics",
      url: "oorly",
      icon: <Zap />,
    },
    {
      name: "Vaulrizz Chat",
      url: "vaulrizz",
      icon: <Users />,
    },
    {
      name: "SecondBrain V2",
      url: "secondbrain",
      icon: <Settings />,
    },
  ],
}

// 1. We define the properties this component is allowed to accept
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// 2. We extract activeTab and setActiveTab from the props
export function AppSidebar({ activeTab, setActiveTab, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* 3. We pass the state down to NavMain so it can handle the clicks */}
        <NavMain items={data.navMain} activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}