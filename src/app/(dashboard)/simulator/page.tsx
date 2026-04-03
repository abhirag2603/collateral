"use client"

import { Brain, ArrowRight } from "lucide-react"

export default function SimulatorPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="bg-[#111113] p-6 rounded-2xl border border-white/5 shadow-xl">
        <h1 className="text-2xl font-medium text-white flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-primary" />
          Decision Simulations
        </h1>
        <p className="text-sm text-muted-foreground">Manage past life decisions and simulate new scenarios with AI-driven impact forecasting.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111113] border border-white/5 rounded-2xl p-6 h-fit space-y-6">
          <h2 className="text-lg font-medium text-white">New Simulation</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase font-medium">Scenario</label>
              <textarea 
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 min-h-[100px]" 
                placeholder="Describe a major life decision..." 
                defaultValue="Can I quit my job?" 
              />
            </div>
            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              Forecast Impact <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
           <h2 className="text-lg font-medium text-white">Decision History</h2>
           <div className="space-y-4">
             <div className="bg-[#111113] border border-white/5 p-5 rounded-xl">
               <div className="flex justify-between items-start mb-2">
                 <div className="text-sm text-white font-medium">Quit Tech Lead Role</div>
                 <div className="text-xs text-rose-400 bg-rose-500/10 px-2 py-1 rounded font-medium">-18 pts forecast</div>
               </div>
               <div className="text-xs text-muted-foreground">In Progress • 14 mo recovery</div>
             </div>

             <div className="bg-[#111113] border border-white/5 p-5 rounded-xl">
               <div className="flex justify-between items-start mb-2">
                 <div className="text-sm text-white font-medium">Downsize Apartment</div>
                 <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded font-medium">+6 pts actual</div>
               </div>
               <div className="text-xs text-muted-foreground">Complete • Boosted Risk Buffer</div>
             </div>

             <div className="bg-[#111113] border border-white/5 p-5 rounded-xl">
               <div className="flex justify-between items-start mb-2">
                 <div className="text-sm text-white font-medium">Relocate to Portugal</div>
                 <div className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded font-medium">-8 pts forecast</div>
               </div>
               <div className="text-xs text-muted-foreground">In Progress • 6 mo recovery</div>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
