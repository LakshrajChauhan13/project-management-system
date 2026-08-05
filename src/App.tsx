import { useState } from "react"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardOverview } from "@/components/dashboard/DashboardOverview" 

function App() {
  // State to manage which module is currently selected
  const [activeTab, setActiveTab] = useState<string>("dashboard")

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground font-sans">
        
        {/* Pass the state and setter to the sidebar so it can trigger view changes later */}
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* SidebarInset ensures the content area adjusts when the sidebar collapses */}
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          
          <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border px-4 bg-background/95 backdrop-blur">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <div className="flex-1">
              <h1 className="text-sm font-medium capitalize text-muted-foreground">
                {activeTab.replace('-', ' ')}
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold tracking-tight capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
              
              {/* Conditional Rendering based on active tab */}
              {activeTab === 'dashboard' ? (
                <DashboardOverview />
              ) : (
                <div className="h-[500px] rounded-xl border border-dashed border-border flex items-center justify-center bg-muted/30">
                  <p className="text-muted-foreground text-sm">
                    The <span className="font-semibold text-foreground capitalize">{activeTab.replace('-', ' ')}</span> module will be built here.
                  </p>
                </div>
              )}
              
            </div>
          </div>
          
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default App