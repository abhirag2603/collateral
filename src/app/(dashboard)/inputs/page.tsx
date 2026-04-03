"use client"

import { Database, Plus } from "lucide-react"

export default function InputsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-[#111113] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-medium text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Data Inputs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Sync or manually update your collateral sources.</p>
        </div>
        <button className="relative z-10 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition">
          Sync Accounts
        </button>
      </div>

      <div className="grid gap-6">
        {/* Financial Inputs */}
        <section className="bg-[#111113] border border-white/5 rounded-2xl p-6">
           <h2 className="text-lg font-medium text-white mb-6 border-b border-white/5 pb-4">Financial Sources</h2>
           <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-xs text-muted-foreground uppercase font-medium">Monthly Income</label>
               <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50" defaultValue="$8,000" />
             </div>
             <div className="space-y-2">
               <label className="text-xs text-muted-foreground uppercase font-medium">Monthly Expenses</label>
               <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50" defaultValue="$4,000" />
             </div>
           </div>
        </section>

        {/* Skill Inventory */}
        <section className="bg-[#111113] border border-white/5 rounded-2xl p-6">
           <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
             <h2 className="text-lg font-medium text-white">Skill Inventory</h2>
             <button className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
               <Plus className="w-3 h-3" /> Add Skill
             </button>
           </div>
           
           <div className="space-y-3">
             <div className="flex justify-between items-center bg-white/5 border border-white/5 px-4 py-3 rounded-lg">
               <div className="text-sm text-white">Engineering</div>
               <div className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md">Level 80</div>
             </div>
             <div className="flex justify-between items-center bg-white/5 border border-white/5 px-4 py-3 rounded-lg">
               <div className="text-sm text-white">Product Management</div>
               <div className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md">Level 60</div>
             </div>
           </div>
        </section>
      </div>
    </div>
  )
}
