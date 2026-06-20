"use client"

import { useEffect, useState } from "react"
import { Brain, ArrowRight, Loader2, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react"

interface Decision {
  _id: string;
  scenarioInput: string;
  scoreImpact: number;
  riskLevel: "Low" | "Medium" | "High";
  recoveryTime: string;
  explanation?: string;
  createdAt: string;
}

export default function SimulatorPage() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [scenarioInput, setScenarioInput] = useState("")
  const [running, setRunning] = useState(false)
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(true)

  async function loadHistory() {
    try {
      setLoadingHistory(true)
      const res = await fetch("/api/simulator")
      if (res.ok) {
        const data = await res.json()
        setDecisions(data)
        if (data.length > 0 && !selectedDecision) {
          setSelectedDecision(data[0])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  async function handleForecast(e: React.FormEvent) {
    e.preventDefault()
    if (!scenarioInput.trim()) return

    try {
      setRunning(true)
      const res = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioInput: scenarioInput.trim() })
      })

      if (res.ok) {
        const newDecision = await res.json()
        setDecisions([newDecision, ...decisions])
        setSelectedDecision(newDecision)
        setScenarioInput("")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-[#111113] p-6 rounded-2xl border border-white/5 shadow-xl">
        <h1 className="text-2xl font-medium text-white flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-primary" />
          Decision Simulations
        </h1>
        <p className="text-sm text-muted-foreground">Forecast how major shifts (quitting a job, moving, downsizing, retraining) impact your Collateral Score prior to making them.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Left Column: Forecast Input & Result Explanations */}
        <div className="space-y-6">
          <div className="bg-[#111113] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-lg font-medium text-white">New Simulation</h2>
            
            <form onSubmit={handleForecast} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase font-semibold">Scenario Query</label>
                <textarea 
                  value={scenarioInput}
                  onChange={(e) => setScenarioInput(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 min-h-[100px]" 
                  placeholder="Describe a potential career, financial, or geographic decision (e.g. 'Can I quit my job?', 'Buy a house', 'Downsize my rent')" 
                  disabled={running}
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={running || !scenarioInput.trim()}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-black font-semibold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                {running ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating Impacts...
                  </>
                ) : (
                  <>
                    Forecast Impact <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Forecast details selected from history/result */}
          {selectedDecision && (
            <div className="bg-[#111113] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="border-b border-white/5 pb-4">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Simulated Scenario</span>
                <h3 className="text-md font-semibold text-white mt-1">"{selectedDecision.scenarioInput}"</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className={`${
                  selectedDecision.scoreImpact >= 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                } border p-4 rounded-xl text-center`}>
                  <div className="text-[10px] uppercase font-bold tracking-wider mb-1">Score Shift</div>
                  <div className="text-xl font-bold">
                    {selectedDecision.scoreImpact >= 0 ? "+" : ""}{selectedDecision.scoreImpact} pts
                  </div>
                </div>

                <div className={`${
                  selectedDecision.riskLevel === 'High' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : selectedDecision.riskLevel === 'Medium' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                } border p-4 rounded-xl text-center`}>
                  <div className="text-[10px] uppercase font-bold tracking-wider mb-1">Risk Level</div>
                  <div className="text-xl font-bold">{selectedDecision.riskLevel}</div>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center text-white">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Recovery</div>
                  <div className="text-xl font-bold">{selectedDecision.recoveryTime}</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                <h4 className="text-xs text-primary font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" />
                  AI Reasoning Summary
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedDecision.explanation || "Gemini was unable to generate explanation. Stability scoring is deterministic."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Historical Simulations */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            Simulation History
          </h2>

          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-xs">Loading past forecast entries...</p>
            </div>
          ) : decisions.length === 0 ? (
            <p className="text-xs text-muted-foreground bg-[#111113] border border-white/5 p-6 rounded-2xl text-center">
              No simulation logs. Type in a query to generate your first forecast report.
            </p>
          ) : (
            <div className="space-y-4 max-h-[550px] overflow-y-auto no-scrollbar">
              {decisions.map((decision) => {
                const isSelected = selectedDecision?._id === decision._id
                return (
                  <button
                    key={decision._id}
                    onClick={() => setSelectedDecision(decision)}
                    className={`w-full text-left bg-[#111113] border rounded-2xl p-5 transition-all flex justify-between items-center ${
                      isSelected ? "border-primary/50 bg-[#161619]" : "border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="space-y-1 pr-4">
                      <div className="text-sm text-white font-medium truncate max-w-[280px]">
                        {decision.scenarioInput}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-semibold">
                        {new Date(decision.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {decision.recoveryTime} recovery
                      </div>
                    </div>
                    <div className={`${
                      decision.scoreImpact >= 0 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                    } border text-xs px-2.5 py-1 rounded font-bold whitespace-nowrap`}>
                      {decision.scoreImpact >= 0 ? "+" : ""}{decision.scoreImpact} pts
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
