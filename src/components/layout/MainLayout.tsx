import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "sonner" 

export function MainLayout() {
  const location = useLocation()
  
  const pageTitle = location.pathname === "/" 
    ? "Dashboard" 
    : location.pathname.split('/')[1].replace('-', ' ')

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground font-sans">
        <AppSidebar />
        
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border px-4 bg-background/95 backdrop-blur z-10 sticky top-0">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <div className="flex-1">
              <h1 className="text-sm font-medium capitalize text-muted-foreground">
                {pageTitle}
              </h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold tracking-tight capitalize mb-6">
                {pageTitle}
              </h2>
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>

      <Toaster position="bottom-right" richColors />
    </SidebarProvider>
  )
}