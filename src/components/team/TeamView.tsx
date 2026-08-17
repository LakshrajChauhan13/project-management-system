"use client"

import React, { useState } from "react"
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Zap, 
  CheckCircle2, 
  Clock, 
  MoreVertical, 
  Trash2, 
  X,
  CircleDot // Added for the status toggle
} from "lucide-react"
import { toast } from "sonner"
import { 
  useTeamStore, 
  type Role, 
  type Availability 
} from "@/store/useTeamStore"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"

const ROLES: Role[] = ['Admin', 'Product Owner', 'Scrum Master', 'Developer', 'Designer']
const AVAILABILITY_OPTIONS: Availability[] = ['Available', 'Busy', 'In Meeting', 'On Leave']

export function TeamView() {
  const { members, addMember, removeMember, updateMemberRole, updateMemberAvailability } = useTeamStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("All")
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  // Assuming MEM-101 is the currently logged-in user
  const loggedInUserId = 'MEM-101'
  const currentUser = members.find(m => m.id === loggedInUserId)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Developer" as Role,
    currentSprint: "Sprint 5: Core Features",
    productivity: 90,
    tasksAssigned: 0,
  })

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === "All" || member.role === selectedRole
    return matchesSearch && matchesRole
  })

  const totalMembers = members.length
  const availableCount = members.filter((m) => m.availability === "Available").length
  const avgProductivity = Math.round(
    members.reduce((acc, m) => acc + m.productivity, 0) / (totalMembers || 1)
  )

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) return

    const initials = formData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

    addMember({
      ...formData,
      availability: "Available",
      avatar: initials || "U",
    })

    toast.success(`${formData.name} invited to the team!`)
    setIsInviteModalOpen(false)
    setFormData({
      name: "",
      email: "",
      role: "Developer",
      currentSprint: "Sprint 5: Core Features",
      productivity: 90,
      tasksAssigned: 0,
    })
  }

  const getAvailabilityBadge = (availability: Availability) => {
    switch (availability) {
      case "Available": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "Busy": return "bg-red-500/10 text-red-600 border-red-500/20"
      case "In Meeting": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "On Leave": return "bg-slate-500/10 text-slate-500 border-slate-500/20"
    }
  }

  const getStatusColor = (status: Availability) => {
    switch (status) {
      case "Available": return "text-emerald-500"
      case "Busy": return "text-red-500"
      case "In Meeting": return "text-amber-500"
      case "On Leave": return "text-slate-500"
    }
  }

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case "Admin": return "bg-purple-500/10 text-purple-600 border-purple-500/20"
      case "Product Owner": return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "Scrum Master": return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
      case "Developer": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "Designer": return "bg-pink-500/10 text-pink-600 border-pink-500/20"
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Team Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage team members, roles, availability, and sprint productivity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* --- PERSONAL STATUS TOGGLE --- */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm font-medium outline-none shadow-sm">
                  <CircleDot className={`w-4 h-4 ${getStatusColor(currentUser.availability)}`} />
                  {currentUser.availability}
                </button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">My Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {AVAILABILITY_OPTIONS.map((status) => (
                  <DropdownMenuItem 
                    key={status} 
                    onClick={() => {
                      updateMemberAvailability(currentUser.id, status)
                      toast.success(`Your status is now ${status}`)
                    }}
                    className="cursor-pointer text-sm flex items-center gap-2"
                  >
                    <CircleDot className={`w-3.5 h-3.5 ${getStatusColor(status)}`} />
                    {status}
                  </DropdownMenuItem>
                ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-card border border-border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Members</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalMembers}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl">
            <Users className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active & Available</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{availableCount}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Productivity</p>
            <p className="text-2xl font-bold text-foreground mt-1">{avgProductivity}%</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto custom-scrollbar pb-1 sm:pb-0">
          {["All", ...ROLES].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedRole === role
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {member.avatar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-sm truncate">{member.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate mt-0.5">
                      <Mail className="w-3 h-3 shrink-0" />
                      {member.email}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none" /> 
                    }
                  >
                    <MoreVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Change Role</DropdownMenuLabel>
                      {ROLES.map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => {
                            updateMemberRole(member.id, role)
                            toast.success(`Updated ${member.name}'s role to ${role}`)
                          }}
                          className="text-xs cursor-pointer"
                        >
                          {role}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    
                    {/* <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Change Availability</DropdownMenuLabel>
                      {AVAILABILITY_OPTIONS.map((avail) => (
                        <DropdownMenuItem
                          key={avail}
                          onClick={() => {
                            updateMemberAvailability(member.id, avail)
                            toast.success(`Updated ${member.name}'s status to ${avail}`)
                          }}
                          className="text-xs cursor-pointer"
                        >
                          {avail}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup> */}
                    
                    {/* <DropdownMenuSeparator /> */}
                    
                    <DropdownMenuItem
                      onClick={() => {
                        removeMember(member.id)
                        toast.success(`${member.name} removed from team.`)
                      }}
                      className="text-xs text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide ${getRoleBadge(member.role)}`}>
                  {member.role}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide ${getAvailabilityBadge(member.availability)}`}>
                  {member.availability}
                </span>
              </div>

              <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50 text-xs">
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" /> Current Sprint
                  </span>
                  <span className="font-semibold text-foreground">{member.tasksAssigned} Tasks</span>
                </div>
                <p className="font-medium text-foreground truncate">{member.currentSprint}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Productivity
                </span>
                <span className="font-bold text-foreground">{member.productivity}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${member.productivity}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODIFIED INVITE MEMBER MODAL --- */}
      {isInviteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsInviteModalOpen(false)
          }}
        >
          <div className="bg-card border border-border shadow-xl rounded-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" /> Invite Team Member
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Alex Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="alex@sprintai.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role <span className="text-red-500">*</span></label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}