"use client"

import { useEffect, useState } from "react"
import { CollateralBreakdown } from "@/components/CollateralBreakdown"
import { DashboardChart } from "@/components/DashboardChart"
import { Sparkles, ArrowRight, ShieldAlert, Award, Calendar, CheckCircle, RefreshCw, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Home() {
  const [data, setData] = useState<any>(null)
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingInsights, setGeneratingInsights] = useState(false)

  async function loadDashboardData() {
    try {
      const [dashRes, insightsRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/insights")
      ])

      if (dashRes.ok) {
        const dashData = await dashRes.json()
        setData(dashData)
      }

      if (insightsRes.ok) {
        const insightsData = await insightsRes.json()
        setInsights(insightsData)
      }
    } catch (err) {
      console.error("Error loading dashboard metrics:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function handleTriggerAIReport() {
    try {
      setGeneratingInsights(true)
      const res = await fetch("/api/insights", { method: "POST" })
      if (res.ok) {
        const updatedInsights = await fetch("/api/insights").then(r => r.json())
        setInsights(updatedInsights)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setGeneratingInsights(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-semibold">Analyzing stability indices...</p>
      </div>
    )
  }

  const scores = data?.scores || {
    total: 0,
    financial: 0,
    skill: 0,
    execution: 0,
    opportunity: 0,
    risk: 0
  }

  // Display top 3 insights
  const displayInsights = insights.slice(0, 3).map(ins => ins.message)
  const defaultInsights = [
    "Complete habit logs to calculate execution indexes.",
    "Define goals to leverage opportunity parameters.",
    "Add savings details to evaluate runway and risk buffer."
  ]
  const topInsights = displayInsights.length > 0 ? displayInsights : defaultInsights;

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
                animate={{ strokeDashoffset: 376.99 - (376.99 * (scores.total / 100)) }}
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
            <p className="text-sm text-muted-foreground mb-4">Your life stability index evaluation.</p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="flex gap-2 items-start">
                <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-xs text-primary/90 leading-relaxed">
                  <span className="font-semibold text-primary">AI RECOMMENDATION</span>
                  <br />
                  {scores.total < 50
                    ? "Establish a larger liquid savings runway to safeguard parameters."
                    : "Stable status. Diversify high-demand skills to optimize growth metrics."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Insights Panel */}
        <div className="bg-[#111113] rounded-2xl border border-white/5 p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-white">Stability Insights</h2>
            <button
              onClick={handleTriggerAIReport}
              disabled={generatingInsights}
              className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded-full flex items-center gap-2 transition"
            >
              {generatingInsights ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  Re-evaluate AI Reports
                </>
              )}
            </button>
          </div>
          <ul className="space-y-3">
            {topInsights.map((insight, i) => (
              <li key={i} className="flex items-center gap-4 text-sm text-muted-foreground bg-white/5 p-4 rounded-xl border border-white/5">
                <ArrowRight className="w-4 h-4 text-primary/50 flex-shrink-0" />
                <span className="line-clamp-2">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Breakdown Component */}
      <CollateralBreakdown
        financial={scores.financial}
        skill={scores.skill}
        execution={scores.execution}
        opportunity={scores.opportunity}
        risk={scores.risk}
      />

      {/* Action Items CTA Banner */}
      <div className="bg-[#111113] rounded-2xl border border-white/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Active Capabilities Setup
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl">
            You currently have {data?.skillsCount || 0} skills, {data?.goalsCount || 0} strategic goals, and {data?.habitsCount || 0} tracked habits. Keep them updated to monitor execution logs.
          </p>
        </div>
        <Link href="/inputs" className="relative z-10 bg-primary hover:bg-primary/90 text-black font-semibold text-sm px-6 py-3 rounded-xl transition flex items-center gap-2 self-start md:self-auto">
          Manage Stability Inputs <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Score Progression & Scenario Simulator row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart />
        
        <div className="bg-[#111113] rounded-2xl border border-white/5 p-6 flex flex-col justify-between min-h-[400px]">
          <div>
            <h2 className="text-lg font-medium text-white mb-2">Decision Simulator</h2>
            <p className="text-xs text-muted-foreground mb-6">Test major changes (like career shifts or downsizing) to project stability impacts before executing them.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <label className="text-xs text-muted-foreground uppercase font-medium block mb-2">Sample Decision</label>
              <div className="bg-black/50 p-3 rounded-lg border border-white/10 text-sm text-white flex justify-between items-center">
                 Can I quit my job?
                 <div className="bg-primary/20 text-primary px-2.5 py-1 rounded text-xs font-semibold">Keyword-mapped</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                 <div className="text-[10px] text-rose-400 uppercase font-bold tracking-wider mb-1">Estimated Impact</div>
                 <div className="text-2xl font-bold text-white">-18 pts</div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
                 <div className="text-[10px] text-orange-400 uppercase font-bold tracking-wider mb-1">Expected Recovery</div>
                 <div className="text-2xl font-bold text-white">12 mo</div>
              </div>
            </div>
            <Link href="/simulator" className="w-full bg-primary hover:bg-primary/95 text-black font-semibold text-sm py-3 rounded-xl transition flex items-center justify-center gap-1.5 mt-4">
              Run Real Scenario Simulations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
