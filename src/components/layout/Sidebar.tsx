"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap, LayoutDashboard, LineChart, Brain, Settings2, ShieldCheck, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Simulations", href: "/simulator", icon: Brain },
  { name: "Insights", href: "/insights", icon: ShieldCheck },
  { name: "Inputs", href: "/inputs", icon: Settings2 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r border-white/5 bg-[#0a0a0b] h-full flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-xl block" />
        <Zap className="w-5 h-5 text-primary relative z-10" />
        <span className="ml-3 font-semibold text-foreground tracking-wide relative z-10">COLLATERAL</span>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1">
        <div className="text-xs font-medium text-muted-foreground/50 mb-4 px-2 tracking-widest uppercase">Menu</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          )
        })}
      </div>
      
      <div className="p-4 border-t border-white/5 space-y-3">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary-foreground">
            TB
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Tech Bro</p>
            <p className="text-xs text-muted-foreground truncate">Product Lead</p>
          </div>
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
