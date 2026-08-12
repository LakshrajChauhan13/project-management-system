import React, { useState, useEffect } from "react"
import { User, Moon, Bell, Shield, Globe, Building, Check, Laptop } from "lucide-react"
import { toast } from "sonner"
import { useSettingsStore } from "@/store/useSettingsStore"

type Tab = 'profile' | 'appearance' | 'notifications' | 'security'

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  
  // Connect to our new settings store
  const { theme, setTheme, language, setLanguage, emailNotifications, setEmailNotifications } = useSettingsStore()

  // --- Dark Mode Logic ---
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Settings saved successfully!")
  }

  return (
    <div className="flex flex-col h-full space-y-6 max-w-6xl mx-auto w-full">
      
      {/* Header */}
      <div className="shrink-0 border-b border-border pb-6">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings and application preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
        
        {/* Sidebar Navigation */}
        <nav className="flex md:flex-col gap-2 w-full md:w-64 shrink-0 overflow-x-auto custom-scrollbar md:overflow-visible pb-2 md:pb-0">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <User className="w-4 h-4" /> Profile & Organization
          </button>
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'appearance' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Moon className="w-4 h-4" /> Appearance
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'security' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Shield className="w-4 h-4" /> Security
          </button>
        </nav>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
          <form onSubmit={handleSave} className="max-w-2xl space-y-8">
            
            {/* --- PROFILE TAB --- */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                  <p className="text-sm text-muted-foreground">Update your personal details and public profile.</p>
                </div>
                
                <div className="space-y-4 bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <input type="text" defaultValue="Lakshraj Chauhan" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"/>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Job Title</label>
                    <input type="text" defaultValue="MERN Stack Developer" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"/>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <input type="email" defaultValue="lakshraj@example.com" disabled className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm text-muted-foreground cursor-not-allowed"/>
                    <p className="text-xs text-muted-foreground">To change your email, please contact the administrator.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Organization</h3>
                  <p className="text-sm text-muted-foreground">Manage your workspace settings.</p>
                </div>

                <div className="space-y-4 bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium flex items-center gap-2"><Building className="w-4 h-4 text-muted-foreground"/> Workspace Name</label>
                    <input type="text" defaultValue="Eximatic Technologies" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"/>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground"/> Timezone</label>
                    <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer">
                      <option value="IST">Asia/Kolkata (IST)</option>
                      <option value="UTC">Coordinated Universal Time (UTC)</option>
                      <option value="EST">Eastern Standard Time (EST)</option>
                      <option value="PST">Pacific Standard Time (PST)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* --- APPEARANCE TAB --- */}
            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-lg font-semibold">Appearance</h3>
                  <p className="text-sm text-muted-foreground">Customize how the application looks on your device.</p>
                </div>
                
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Theme Preference</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* Light Theme Button */}
                      <button type="button" onClick={() => setTheme('light')} className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-background'}`}>
                        <div className="p-2 bg-slate-100 text-slate-900 rounded-full mb-3"><Moon className="w-5 h-5 fill-transparent" /></div>
                        <span className="text-sm font-medium">Light</span>
                      </button>

                      {/* Dark Theme Button */}
                      <button type="button" onClick={() => setTheme('dark')} className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-background'}`}>
                        <div className="p-2 bg-slate-900 text-slate-100 rounded-full mb-3"><Moon className="w-5 h-5 fill-current" /></div>
                        <span className="text-sm font-medium">Dark</span>
                      </button>

                      {/* System Theme Button */}
                      <button type="button" onClick={() => setTheme('system')} className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-background'}`}>
                        <div className="p-2 bg-muted text-muted-foreground rounded-full mb-3"><Laptop className="w-5 h-5" /></div>
                        <span className="text-sm font-medium">System</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2 pt-4 border-t border-border">
                    <label className="text-sm font-medium">Language</label>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full sm:w-1/2 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* --- NOTIFICATIONS TAB --- */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Choose what updates you want to receive.</p>
                </div>
                
                <div className="bg-card border border-border rounded-xl p-0 shadow-sm divide-y divide-border">
                  <div className="p-6 flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium text-foreground">Email Notifications</label>
                      <p className="text-xs text-muted-foreground">Receive daily digests and major sprint updates via email.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)}/>
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="p-6 flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium text-foreground">Mention Alerts</label>
                      <p className="text-xs text-muted-foreground">Get notified immediately when someone tags you in a task.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked/>
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* --- SECURITY TAB --- */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-lg font-semibold">Security</h3>
                  <p className="text-sm text-muted-foreground">Update your password and secure your account.</p>
                </div>
                
                <div className="space-y-4 bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"/>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"/>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"/>
                  </div>
                </div>
              </div>
            )}

            {/* Global Save Button */}
            <div className="pt-4 border-t border-border flex justify-end">
              <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
                <Check className="w-4 h-4" /> Save Preferences
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}