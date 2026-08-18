import React, { useState } from "react"
import { Bot, Sparkles, Loader2, CheckCircle2, ListTodo, AlignLeft, AlertCircle, Copy, Pencil } from "lucide-react"
import { useTaskStore } from "@/store/useTaskStore"
import { useProjectStore } from "@/store/useProjectStore" // NEW IMPORT
import { toast } from "sonner"

// Mock AI response based on the PRD example
const MOCK_AI_RESPONSE = {
  userStory: "As a user, I want to be able to log in to my account securely so that I can access my personalized dashboard and private data.",
  acceptanceCriteria: [
    "User can enter email and password.",
    "System validates email format.",
    "System displays error for incorrect credentials.",
    "Successful login redirects to the dashboard.",
    "Password input is masked (hidden)."
  ],
  storyPoints: 5,
  priority: "High",
  tasks: [
    "Design login UI component",
    "Implement form validation logic",
    "Create JWT authentication API endpoint",
    "Integrate frontend form with backend API",
    "Write unit tests for authentication flow"
  ]
}

export function AIStoryGenerator() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  
  // State to hold the editable form data
  const [editableResult, setEditableResult] = useState<typeof MOCK_AI_RESPONSE | null>(null)
  const [copied, setCopied] = useState(false)
  
  // Unified store actions
  const addMultipleTasks = useTaskStore((state) => state.addMultipleTasks)
  const { currentProjectId } = useProjectStore() // Get the active project

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsGenerating(true)
    setEditableResult(null)

    // Simulate network delay for AI generation
    setTimeout(() => {
      setEditableResult(JSON.parse(JSON.stringify(MOCK_AI_RESPONSE))) // Deep copy mock data
      setIsGenerating(false)
    }, 2000)
  }

  // Handlers for editing the AI output arrays
  const handleUpdateArrayItem = (field: 'acceptanceCriteria' | 'tasks', index: number, value: string) => {
    if (!editableResult) return
    const newArray = [...editableResult[field]]
    newArray[index] = value
    setEditableResult({ ...editableResult, [field]: newArray })
  }

  const handleSaveToBacklog = () => {
    if (!editableResult) return

    // SAFETY GUARD: Ensure a project is selected before saving tasks
    if (!currentProjectId) {
      toast.error("Please select a project from the sidebar first!")
      return
    }

    // Convert the EDITED AI text tasks into proper Task objects mapped to the current project
    const newTasks = editableResult.tasks.map((taskTitle) => ({
      id: `TSK-${Math.floor(Math.random() * 9000) + 1000}`,
      projectId: currentProjectId, // FIXED: Now strictly matches the Task interface
      title: taskTitle,
      status: "Backlog",
      priority: editableResult.priority,
      points: Math.max(1, Math.floor(editableResult.storyPoints / editableResult.tasks.length)),
      assignee: "UN"
    }))

    addMultipleTasks(newTasks)
    toast.success(`${newTasks.length} tasks successfully added to your Backlog!`)
    setEditableResult(null)
    setPrompt("")
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(editableResult, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Story Generator</h2>
          <p className="text-muted-foreground text-sm mt-1">Transform simple ideas into structured agile user stories and tasks.</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          <label htmlFor="prompt" className="text-sm font-medium">Describe the feature</label>
          <div className="relative">
            <textarea
              id="prompt"
              rows={3}
              placeholder="e.g., Create a secure login feature with email and password..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
            <Sparkles className="absolute right-4 bottom-4 w-5 h-5 text-muted-foreground opacity-50" />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Story
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Editable Results Section */}
      {editableResult && (
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Review & Refine Output
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy JSON"}
              </button>
              <button 
                onClick={handleSaveToBacklog}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm"
              >
                <ListTodo className="w-4 h-4" />
                Send to Backlog
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Editable User Story */}
            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlignLeft className="w-4 h-4" /> User Story
                </h4>
                <span className="text-xs text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil className="w-3 h-3" /> Click to edit
                </span>
              </div>
              <textarea 
                value={editableResult.userStory}
                onChange={(e) => setEditableResult({...editableResult, userStory: e.target.value})}
                className="w-full p-4 bg-background border-2 border-dashed border-border/60 hover:border-solid hover:border-primary/50 rounded-lg text-foreground font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y"
                rows={2}
              />
            </div>

            {/* Editable Meta Data Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-background border-2 border-dashed border-border/60 hover:border-solid hover:border-primary/50 rounded-lg flex items-center justify-between gap-4 transition-all">
                <label className="text-sm text-muted-foreground flex items-center gap-2 whitespace-nowrap">
                  <AlertCircle className="w-4 h-4" /> Priority
                </label>
                <select 
                  value={editableResult.priority}
                  onChange={(e) => setEditableResult({...editableResult, priority: e.target.value})}
                  className="px-3 py-1.5 rounded-md text-sm font-medium bg-muted/50 border border-transparent hover:border-border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="p-4 bg-background border-2 border-dashed border-border/60 hover:border-solid hover:border-primary/50 rounded-lg flex items-center justify-between gap-4 transition-all">
                <label className="text-sm text-muted-foreground flex items-center gap-2 whitespace-nowrap">
                  <Bot className="w-4 h-4" /> Story Points
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    min="1"
                    max="21"
                    value={editableResult.storyPoints}
                    onChange={(e) => setEditableResult({...editableResult, storyPoints: parseInt(e.target.value) || 0})}
                    className="w-20 pl-2 pr-6 py-1.5 rounded-md text-sm font-bold text-center bg-muted/50 border border-transparent hover:border-border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Pencil className="absolute right-2 top-2.5 w-3 h-3 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Editable Acceptance Criteria & Tasks */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Acceptance Criteria
                  </h4>
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Edit below</span>
                </div>
                <div className="space-y-2">
                  {editableResult.acceptanceCriteria.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 group/item">
                      <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <div className="relative w-full">
                        <input 
                          type="text"
                          value={item}
                          onChange={(e) => handleUpdateArrayItem('acceptanceCriteria', idx, e.target.value)}
                          className="w-full px-3 py-1.5 text-sm bg-background border-2 border-dashed border-border/60 hover:border-solid hover:border-primary/50 focus:border-solid focus:border-primary/50 rounded-md transition-all outline-none"
                        />
                        <Pencil className="absolute right-3 top-2.5 w-3 h-3 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="group">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ListTodo className="w-4 h-4" /> Recommended Tasks
                  </h4>
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Edit below</span>
                </div>
                <div className="space-y-2">
                  {editableResult.tasks.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-1 rounded-md border-2 border-dashed border-border/60 bg-background hover:border-solid hover:border-primary/50 focus-within:border-solid focus-within:border-primary/50 transition-all group/item">
                      <div className="pl-2 min-w-6 text-xs font-bold text-muted-foreground">{idx + 1}.</div>
                      <input 
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateArrayItem('tasks', idx, e.target.value)}
                        className="w-full px-2 py-1.5 text-sm bg-transparent outline-none"
                      />
                      <Pencil className="w-3 h-3 mr-3 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}