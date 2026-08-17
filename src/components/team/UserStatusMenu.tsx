"use client"

import { CircleDot } from "lucide-react"
import { useTeamStore, type Availability } from "@/store/useTeamStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup, // 1. Added this import!
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

const AVAILABILITY_OPTIONS: Availability[] = ['Available', 'Busy', 'In Meeting', 'On Leave']

export function UserStatusMenu() {
  // We assume the logged in user is MEM-101 based on your store initialization
  const loggedInUserId = 'MEM-101' 
  
  const { members, updateMemberAvailability } = useTeamStore()
  const currentUser = members.find(m => m.id === loggedInUserId)

  if (!currentUser) return null

  // Helper to color the dot based on status
  const getStatusColor = (status: Availability) => {
    switch (status) {
      case "Available": return "text-emerald-500"
      case "Busy": return "text-red-500"
      case "In Meeting": return "text-amber-500"
      case "On Leave": return "text-slate-500"
    }
  }

  const handleUpdateStatus = (newStatus: Availability) => {
    updateMemberAvailability(currentUser.id, newStatus)
    toast.success(`Your status is now ${newStatus}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted transition-colors text-sm font-medium outline-none">
          <CircleDot className={`w-3.5 h-3.5 ${getStatusColor(currentUser.availability)}`} />
          {currentUser.availability}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-40">
        {/* 2. Wrapped the label and items inside the Group! */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Set Status</DropdownMenuLabel>
          {/* <DropdownMenuSeparator /> */}
          
          {AVAILABILITY_OPTIONS.map((status) => (
            <DropdownMenuItem 
              key={status} 
              onClick={() => handleUpdateStatus(status)}
              className="cursor-pointer text-sm flex items-center gap-2"
            >
              <CircleDot className={`w-3.5 h-3.5 ${getStatusColor(status)}`} />
              {status}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}