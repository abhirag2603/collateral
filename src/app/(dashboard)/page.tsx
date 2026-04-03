"use client"

import { CollateralBreakdown } from "@/components/CollateralBreakdown"
import { DashboardChart } from "@/components/DashboardChart"
import { Sparkles, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
  const scores = {
    total: 72,
    financial: 84,
    skill: 62,
    execution: 78,
    opportunity: 55,
    risk: 91
  }

  const actions = [
    { priority: "PRIORITY 01", title: "Diversify skill set in AI Ethics & Governance", impact: "+5.8%", difficulty: "Medium", time: "4 weeks" },
    { priority: "PRIORITY 02", title: "Increase risk buffer by $5,000", impact: "+4.2%", difficulty: "Low", time: "2 weeks" },
    { priority: "PRIORITY 03", title: "Secure external technical mentorship", impact: "+3.8%", difficulty: "High", time: "8 weeks" }
  ]

  const insights = [
    "Savings sustain for 4 months at current burn.",
    "Skill growth slowing in Engineering core.",
    "Market Opportunity up 12% in your sector."
  ]

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Total Score Panel */}
        <div className="bg-[#111113] rounded-2xl border border-white/5 p-6 flex items-center gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 blur-[80px]" />
          <div className="relative z-10 w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="60" className="stroke-white/5" strokeWidth="6" fill="none" />
              <motion.circle 
                cx="64" cy="64" r="60" 
                className="stroke-primary" 
                strokeWidth="6" fill="none" 
                strokeDasharray="376.99" 
                initial={{ strokeDashoffset: 376.99 }}
                animate={{ strokeDashoffset: 376.99 - (376.99 * 0.72) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white tracking-tighter">{scores.total}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">SCORE</span>
            </div>
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-medium text-white mb-2">Collateral Score</h2>
            <p className="text-sm text-muted-foreground mb-4">Your life stability score is trending upwards.</p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="flex gap-2 items-start">
                <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-xs text-primary/90 leading-relaxed">
                  <span className="font-semibold text-primary">AI INSIGHT</span>
                  <br />Increasing your Risk Buffer by $2,400 would push your score into the 'Elite' (80+) bracket within 60 days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Insights Panel */}
        <div className="bg-[#111113] rounded-2xl border border-white/5 p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-white">Top Insights</h2>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              System Live
            </span>
          </div>
          <ul className="space-y-4">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-center gap-4 text-sm text-muted-foreground bg-white/5 p-4 rounded-xl border border-white/5">
                <ArrowRight className="w-4 h-4 text-primary/50" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Breakdown Component */}
      <CollateralBreakdown {...scores} />

      {/* Top 3 Actions */}
      <div className="bg-[#111113] rounded-2xl border border-white/5 p-6">
        <div className="flex justify-between items-center gap-2 mb-6">
           <h2 className="text-lg font-medium text-white flex items-center gap-2">
             <Sparkles className="w-5 h-5 text-primary" />
             Top 3 Actions to Improve Your Score
           </h2>
           <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-2">
             Optimized by AI
           </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((action, i) => (
            <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] text-emerald-500 font-bold tracking-widest">{action.priority}</span>
                  <span className="text-sm font-semibold text-emerald-400">{action.impact}</span>
                </div>
                <h3 className="text-sm font-medium text-white mb-6 leading-relaxed">{action.title}</h3>
              </div>
              <div className="flex justify-between items-end border-t border-white/5 pt-4">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">Difficulty</div>
                  <div className={`text-xs font-medium mt-1 ${action.difficulty === 'High' ? 'text-rose-400' : action.difficulty === 'Medium' ? 'text-orange-400' : 'text-emerald-400'}`}>{action.difficulty}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground uppercase">Est. Time</div>
                  <div className="text-xs font-medium text-white mt-1">{action.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Score Progression & Scenario Simulator row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart />
        
        <div className="bg-[#111113] rounded-2xl border border-white/5 p-6 h-[400px]">
          <h2 className="text-lg font-medium text-white mb-6">Decision Simulator</h2>
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <label className="text-xs text-muted-foreground uppercase font-medium block mb-2">Hypothetical Scenario</label>
              <div className="bg-black/50 p-3 rounded-lg border border-white/10 text-sm text-white flex justify-between items-center">
                 Can I quit my job?
                 <div className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-medium">Auto-filled</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                 <div className="text-[10px] text-rose-400 uppercase font-bold tracking-wider mb-1">Score Impact</div>
                 <div className="text-2xl font-bold text-white">-18 pts</div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
                 <div className="text-[10px] text-orange-400 uppercase font-bold tracking-wider mb-1">Recovery Time</div>
                 <div className="text-2xl font-bold text-white">14 mo</div>
              </div>
            </div>
            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm py-3 rounded-xl transition-colors mt-4">
              RUN FULL SCENARIO
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
