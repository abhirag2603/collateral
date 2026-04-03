"use client"

import { Bot, Lightbulb, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react"

export default function InsightsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 h-full flex flex-col">
      <div className="bg-[#111113] p-6 rounded-2xl border border-white/5 shadow-xl flex-shrink-0">
        <h1 className="text-2xl font-medium text-white flex items-center gap-2 mb-2">
          <Bot className="w-5 h-5 text-primary" />
          AI Insights Engine
        </h1>
        <p className="text-sm text-muted-foreground">Personalized reports and growth strategies generated from your Collateral metrics.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 flex-shrink-0">
        <button className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl text-left bg-white/5 transition-colors">
           <Lightbulb className="w-4 h-4 mb-2" />
           <div className="text-sm font-medium">Weekly Report</div>
        </button>
        <button className="border border-white/5 p-4 rounded-xl text-left text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
           <AlertTriangle className="w-4 h-4 mb-2" />
           <div className="text-sm font-medium">Risk Alerts</div>
        </button>
        <button className="border border-white/5 p-4 rounded-xl text-left text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
           <TrendingUp className="w-4 h-4 mb-2" />
           <div className="text-sm font-medium">Growth Pathways</div>
        </button>
        <button className="border border-white/5 p-4 rounded-xl text-left text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
           <Bot className="w-4 h-4 mb-2" />
           <div className="text-sm font-medium">Scenario Analysis</div>
        </button>
      </div>

      <div className="flex-1 bg-[#111113] border border-white/5 rounded-2xl flex flex-col overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-white/5 bg-white/5">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
               <Bot className="w-4 h-4 text-primary" />
             </div>
             <div>
               <div className="text-sm font-medium text-white">System Intelligence</div>
               <div className="text-xs text-primary font-medium">Current Intel • Generated Today</div>
             </div>
           </div>
        </div>
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
           <div className="bg-white/5 p-5 rounded-xl border border-white/5 rounded-tl-none relative">
             <p className="text-sm text-white/90 leading-relaxed">
               Your Skill Collateral is the primary bottleneck. While your Financial Collateral is in the top 10% for your demographic (Product Lead), your skills in AI Ethics need diversification to maintain premium market demand ratios.
               <br/><br/>
               Consider utilizing your 4 months of financial runway to invest deeply into this specific sector—it would act as a strong hedge and boost your overall score by ~4 points.
             </p>
           </div>
        </div>
        <div className="p-4 border-t border-white/5 bg-black/20">
           <div className="bg-black/50 border border-white/10 rounded-full px-4 py-3 flex items-center gap-2">
             <input type="text" placeholder="Ask AI about your collateral..." className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-muted-foreground" />
             <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
               <ArrowRight className="w-4 h-4 text-white" />
             </button>
           </div>
        </div>
      </div>
    </div>
  )
}
