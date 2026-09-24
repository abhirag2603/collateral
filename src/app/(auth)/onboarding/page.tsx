"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Zap, 
  ArrowRight, 
  ArrowLeft, 
  Briefcase, 
  DollarSign, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Loader2,
  TrendingUp,
  Sliders
} from "lucide-react"

interface SkillItem {
  name: string
  level: number
  marketDemand: number
}

const PRESET_INDUSTRIES = [
  "Software & AI",
  "Fintech & Quantitative Finance",
  "Product & Venture Capital",
  "Biotech & Healthcare",
  "Consulting & Strategy",
  "Design & Creative Tech",
  "Media & Creator Economy",
  "Engineering & Robotics",
  "Other"
]

const QUICK_SKILL_SUGGESTIONS = [
  { name: "Full-Stack Engineering", level: 80, marketDemand: 90 },
  { name: "AI & LLM Integration", level: 75, marketDemand: 95 },
  { name: "System Architecture", level: 70, marketDemand: 85 },
  { name: "Financial Modeling", level: 65, marketDemand: 80 },
  { name: "Product Strategy", level: 75, marketDemand: 85 },
  { name: "Data Engineering", level: 70, marketDemand: 88 },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Step 1: Career
  const [jobTitle, setJobTitle] = useState("")
  const [industry, setIndustry] = useState("Software & AI")
  const [bio, setBio] = useState("")

  // Step 2: Financials
  const [income, setIncome] = useState("6000")
  const [expenses, setExpenses] = useState("3500")
  const [savings, setSavings] = useState("15000")
  const [investments, setInvestments] = useState("10000")

  // Step 3: Skills
  const [skills, setSkills] = useState<SkillItem[]>([
    { name: "System Design", level: 75, marketDemand: 85 },
    { name: "Full-Stack Development", level: 80, marketDemand: 90 },
    { name: "Product Engineering", level: 70, marketDemand: 80 }
  ])

  // Custom new skill input
  const [newSkillName, setNewSkillName] = useState("")
  const [newSkillLevel, setNewSkillLevel] = useState(70)
  const [newSkillDemand, setNewSkillDemand] = useState(80)

  // Real-time calculated metrics for feedback
  const numIncome = Math.max(0, parseFloat(income) || 0)
  const numExpenses = Math.max(0, parseFloat(expenses) || 0)
  const numSavings = Math.max(0, parseFloat(savings) || 0)
  const numInvestments = Math.max(0, parseFloat(investments) || 0)

  const netCashflow = numIncome - numExpenses
  const savingsRate = numIncome > 0 ? Math.round((netCashflow / numIncome) * 100) : 0
  const runwayMonths = numExpenses > 0 ? ((numSavings + numInvestments) / numExpenses).toFixed(1) : "12+"
  const liquidRunwayMonths = numExpenses > 0 ? (numSavings / numExpenses).toFixed(1) : "12+"

  // Quick estimation for preview
  const estimatedScores = useMemo(() => {
    // Financial estimation
    const cashflowRateScore = numIncome > 0 && netCashflow >= 0
      ? Math.min(100, Math.round(30 + Math.pow(Math.max(0, netCashflow / numIncome), 0.7) * 70))
      : Math.max(0, Math.round(30 + (netCashflow / (numIncome || 1)) * 50))
    const runwayVal = Math.min(100, Math.round(100 * (1 - Math.exp(-(parseFloat(runwayMonths) || 1) / 5.5))))
    const finScore = Math.min(100, Math.max(10, Math.round(cashflowRateScore * 0.45 + runwayVal * 0.55)))

    // Skill estimation
    let skillScore = 40
    if (skills.length > 0) {
      const avg = skills.reduce((s, k) => s + k.level * (0.35 + 0.65 * (k.marketDemand / 100)), 0) / skills.length
      const breadth = [0, 45, 70, 85, 95, 100][Math.min(skills.length, 5)]
      skillScore = Math.round(avg * 0.65 + breadth * 0.35)
    }

    // Risk buffer
    const riskScore = Math.min(100, Math.round(100 * (1 - Math.exp(-(parseFloat(liquidRunwayMonths) || 1) / 4.2))))

    const total = Math.round(finScore * 0.30 + skillScore * 0.25 + 50 * 0.20 + 55 * 0.15 + riskScore * 0.10)

    return { finScore, skillScore, riskScore, total }
  }, [numIncome, numExpenses, netCashflow, runwayMonths, liquidRunwayMonths, skills])

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return
    setSkills(prev => [
      ...prev,
      { name: newSkillName.trim(), level: newSkillLevel, marketDemand: newSkillDemand }
    ])
    setNewSkillName("")
    setNewSkillLevel(70)
    setNewSkillDemand(80)
  }

  const handleRemoveSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddPresetSkill = (preset: SkillItem) => {
    if (skills.some(s => s.name.toLowerCase() === preset.name.toLowerCase())) return
    setSkills(prev => [...prev, preset])
  }

  const handleFinalSubmit = async () => {
    setIsLoading(true)
    setError("")

    try {
      const payload = {
        jobTitle: jobTitle || "Professional",
        industry,
        bio,
        financial: {
          income: numIncome,
          expenses: numExpenses,
          savings: numSavings,
          investments: numInvestments,
        },
        skills: skills.length > 0 ? skills : [
          { name: "Professional Competence", level: 70, marketDemand: 75 }
        ],
      }

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Failed to initialize account")
      }

      // Update NextAuth JWT token & session state
      if (update) {
        await update({ onboardingCompleted: true })
      }

      // Navigate to main dashboard
      router.push("/")
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="font-bold tracking-wider text-sm sm:text-base text-white">COLLATERAL OS</span>
            <span className="block text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Setup Protocol</span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((stepNum) => (
            <div 
              key={stepNum}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === stepNum 
                  ? "w-8 bg-primary" 
                  : step > stepNum 
                    ? "w-5 bg-primary/40" 
                    : "w-3 bg-white/10"
              }`}
            />
          ))}
          <span className="text-xs font-mono text-muted-foreground ml-2">Step {step}/4</span>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-2xl w-full mx-auto my-6 z-10">
        <div className="bg-[#111113]/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative">
          
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-4 rounded-xl mb-6 text-center">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: CAREER & IDENTITY */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Professional Baseline</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Establish your career foundation
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Collateral calculates your professional equity and opportunity horizon based on your role and industry dynamics.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                      Current Job Title / Role
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Software Engineer / Founder"
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                      Primary Industry / Domain
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/60 transition-colors"
                    >
                      {PRESET_INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind} className="bg-[#111113] text-white">
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                      Current Focus or Career Objective (Optional)
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="e.g. Scaling engineering leadership, building a 12-month freedom runway, or transitioning into AI ventures."
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-primary/60 transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      if (!jobTitle.trim()) {
                        setError("Please enter your current job title or role.")
                        return
                      }
                      setError("")
                      setStep(2)
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    <span>Continue to Financial Base</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: FINANCIAL FOUNDATION */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Financial Runway & Cashflow</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Calibrate your financial engine
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your baseline numbers determine your runway durability, savings rate curve, and vulnerability buffer.
                  </p>
                </div>

                {/* Live simulation banner */}
                <div className="grid grid-cols-3 gap-3 p-3.5 bg-black/40 border border-white/5 rounded-2xl text-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Net Cashflow</span>
                    <span className={`text-sm font-bold font-mono ${netCashflow >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {netCashflow >= 0 ? `+$${netCashflow.toLocaleString()}/mo` : `-$${Math.abs(netCashflow).toLocaleString()}/mo`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Savings Rate</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {savingsRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Total Runway</span>
                    <span className="text-sm font-bold font-mono text-primary">
                      {runwayMonths} mo
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                      Monthly Take-Home Income ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-muted-foreground text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/60 transition-colors font-mono"
                        placeholder="5000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                      Monthly Expenses ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-muted-foreground text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        value={expenses}
                        onChange={(e) => setExpenses(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/60 transition-colors font-mono"
                        placeholder="3000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                      Liquid Savings / Cash ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-muted-foreground text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        value={savings}
                        onChange={(e) => setSavings(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/60 transition-colors font-mono"
                        placeholder="10000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                      Investments & Assets ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-muted-foreground text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        value={investments}
                        onChange={(e) => setInvestments(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/60 transition-colors font-mono"
                        placeholder="5000"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="text-muted-foreground hover:text-white text-sm px-4 py-2 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => {
                      setError("")
                      setStep(3)
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    <span>Continue to Skill Base</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SKILLS PORTFOLIO */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Skill Breadth & Demand</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Map your core leverage skills
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Having 3+ diversified, high-demand skills prevents career fragility and creates compounding opportunity.
                  </p>
                </div>

                {/* Quick Add Suggestions */}
                <div className="space-y-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block">
                    Quick suggestions
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_SKILL_SUGGESTIONS.map((preset) => {
                      const alreadyAdded = skills.some(s => s.name.toLowerCase() === preset.name.toLowerCase())
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() => handleAddPresetSkill(preset)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                            alreadyAdded 
                              ? "bg-white/5 border-white/5 text-muted-foreground/40 cursor-default" 
                              : "bg-white/5 border-white/10 hover:border-primary/50 text-white hover:bg-white/10"
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>{preset.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Current Skills List */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                      Your Skills ({skills.length})
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Target: at least 3 skills
                    </span>
                  </div>

                  {skills.length === 0 ? (
                    <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center text-sm text-muted-foreground">
                      No skills added yet. Add your core competencies below.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                      {skills.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="text-sm font-medium text-white truncate">{s.name}</p>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                              <span>Proficiency: <strong className="text-emerald-400 font-mono">{s.level}%</strong></span>
                              <span>•</span>
                              <span>Demand: <strong className="text-blue-400 font-mono">{s.marketDemand}%</strong></span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(idx)}
                            className="text-muted-foreground hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Custom Skill Form */}
                <div className="p-4 bg-black/30 border border-white/10 rounded-2xl space-y-3">
                  <span className="text-xs text-white font-medium block">Add Custom Skill</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Skill name (e.g. Distributed Systems)"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill() } }}
                      className="flex-1 bg-black/70 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                        <span>Proficiency</span>
                        <span className="font-mono text-white">{newSkillLevel}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={newSkillLevel}
                        onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                        <span>Market Demand</span>
                        <span className="font-mono text-white">{newSkillDemand}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={newSkillDemand}
                        onChange={(e) => setNewSkillDemand(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="text-muted-foreground hover:text-white text-sm px-4 py-2 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => {
                      if (skills.length === 0) {
                        setError("Please add at least 1 core skill to continue.")
                        return
                      }
                      setError("")
                      setStep(4)
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    <span>Review Calibration</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: REVIEW & LAUNCH */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>System Calibration</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Baseline Collateral Ready
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your initial metrics are synthesized. Here is your baseline stability projection.
                  </p>
                </div>

                {/* Score Hero Card */}
                <div className="p-6 bg-gradient-to-br from-primary/10 via-black/40 to-emerald-500/5 border border-primary/20 rounded-2xl relative overflow-hidden text-center">
                  <div className="relative z-10">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                      Estimated Initial Collateral Score
                    </span>
                    <div className="text-5xl sm:text-6xl font-black text-white font-mono my-2 flex items-center justify-center gap-2">
                      <span className="text-primary">{estimatedScores.total}</span>
                      <span className="text-lg text-muted-foreground font-normal">/ 100</span>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Based on 30% Financial, 25% Skills, 20% Execution, 15% Opportunity, and 10% Risk Buffer.
                    </p>
                  </div>
                </div>

                {/* Breakdown Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Career Base</span>
                    <p className="text-sm font-semibold text-white truncate">{jobTitle}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{industry}</p>
                  </div>

                  <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Financial Score</span>
                    <p className="text-sm font-semibold text-emerald-400 font-mono">{estimatedScores.finScore}/100</p>
                    <p className="text-[11px] text-muted-foreground">{runwayMonths} mo runway</p>
                  </div>

                  <div className="p-3 bg-black/40 border border-white/5 rounded-xl sm:col-span-1 col-span-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Skill Score</span>
                    <p className="text-sm font-semibold text-blue-400 font-mono">{estimatedScores.skillScore}/100</p>
                    <p className="text-[11px] text-muted-foreground">{skills.length} tracked skills</p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    disabled={isLoading}
                    onClick={() => setStep(3)}
                    className="text-muted-foreground hover:text-white text-sm px-4 py-2 rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <button
                    disabled={isLoading}
                    onClick={handleFinalSubmit}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Initializing OS...</span>
                      </>
                    ) : (
                      <>
                        <span>Initialize Collateral OS</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground z-10 py-2">
        Collateral OS • Deterministic Risk & Growth Operating System
      </footer>
    </div>
  )
}
