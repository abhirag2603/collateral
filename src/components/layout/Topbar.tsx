"use client"

import { Search, Bell } from "lucide-react"

export function Topbar() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })

  return (
    <header className="h-16 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2 text-muted-foreground w-1/3">
        <Search className="w-4 h-4" />
        <input 
          type="text" 
          placeholder="Search parameters..." 
          className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="flex flex-1 justify-center">
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground tracking-wide font-medium">
          {currentDate} • UTC-00:00
        </div>
      </div>

      <div className="flex items-center justify-end w-1/3 gap-4">
        <button className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
        </button>
      </div>
    </header>
  )
}
