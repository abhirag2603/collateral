"use client"

import { LineChart, BarChart2 } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="bg-[#111113] p-6 rounded-2xl border border-white/5 shadow-xl">
        <h1 className="text-2xl font-medium text-white flex items-center gap-2 mb-2">
          <BarChart2 className="w-5 h-5 text-primary" />
          Collateral Analytics
        </h1>
        <p className="text-sm text-muted-foreground">Deep dive into multi-timeframe score tracking and execution heatmaps.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#111113] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px]">
          <LineChart className="w-12 h-12 text-white/10 mb-4" />
          <p className="text-muted-foreground text-sm font-medium">Growth Analytics chart will be rendered here (Recharts)</p>
          <div className="flex gap-2 mt-6">
            {['1W', '1M', '3M', '6M', '1Y'].map(tf => (
              <button key={tf} className="px-3 py-1 bg-white/5 text-xs text-muted-foreground rounded hover:text-white transition">
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#111113] border border-white/5 rounded-2xl p-6 min-h-[250px]">
          <h2 className="text-lg font-medium text-white mb-6">Execution Consistency</h2>
          <div className="grid grid-cols-12 gap-1 opacity-50">
           {/* Mock Heatmap blocks */}
           {Array.from({ length: 120 }).map((_, i) => {
             const pseudoRand = (i * 17) % 10;
             const colorClass = pseudoRand > 7 ? 'bg-primary' : pseudoRand > 4 ? 'bg-primary/50' : 'bg-white/5';
             return (
               <div 
                 key={i} 
                 className={`h-4 rounded-sm ${colorClass}`} 
               />
             )
           })}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4 uppercase tracking-widest font-medium">
            Daily Execution Heatmap (Mocked data)
          </p>
        </div>
      </div>
    </div>
  )
}
