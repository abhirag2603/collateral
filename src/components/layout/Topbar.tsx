"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Bell, Target, TrendingUp, CheckSquare, Brain, Loader2 } from "lucide-react"
import Link from "next/link"

export function Topbar() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query || query.trim() === "") {
      setResults([])
      setIsOpen(false)
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results || [])
          setIsOpen(true)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const getIcon = (type: string) => {
    switch (type) {
      case "Skill": return <TrendingUp className="w-4 h-4 text-emerald-400" />
      case "Goal": return <Target className="w-4 h-4 text-blue-400" />
      case "Habit": return <CheckSquare className="w-4 h-4 text-purple-400" />
      case "Simulation": return <Brain className="w-4 h-4 text-orange-400" />
      default: return <Search className="w-4 h-4" />
    }
  }

  return (
    <header className="h-16 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="relative w-1/3" ref={dropdownRef}>
        <div className="flex items-center gap-2 text-muted-foreground bg-white/5 border border-white/10 px-3 py-2 rounded-xl focus-within:border-primary/50 focus-within:text-foreground transition-colors">
          <Search className="w-4 h-4" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setIsOpen(true) }}
            placeholder="Search parameters, scenarios..." 
            className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder:text-muted-foreground/50 text-white"
          />
          {loading && <Loader2 className="w-3 h-3 animate-spin absolute right-3" />}
        </div>

        {/* Search Dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#111113] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              <div className="px-2 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Search Results</div>
              {results.map((r, i) => (
                <Link 
                  key={i} 
                  href={r.url} 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-black transition-colors">
                    {getIcon(r.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{r.type} • {r.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        {isOpen && results.length === 0 && query.length > 2 && !loading && (
           <div className="absolute top-full left-0 right-0 mt-2 bg-[#111113] border border-white/10 rounded-xl shadow-2xl p-4 z-50 text-center">
              <p className="text-sm text-muted-foreground">No parameters matched.</p>
           </div>
        )}
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
