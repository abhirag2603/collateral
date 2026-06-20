"use client"

import { useEffect, useState } from "react"
import { Database, Plus, Trash2, Award, CheckSquare, Calendar, Loader2, ArrowRight } from "lucide-react"

interface Skill {
  _id: string;
  name: string;
  level: number;
  marketDemand: number;
}

interface Habit {
  name: string;
  completedDates: string[];
}

interface Goal {
  _id: string;
  title: string;
  progress: number;
  deadline: string;
}

export default function InputsPage() {
  // Financial Data state
  const [income, setIncome] = useState("")
  const [expenses, setExpenses] = useState("")
  const [savings, setSavings] = useState("")
  const [investments, setInvestments] = useState("")
  const [savingFinance, setSavingFinance] = useState(false)
  const [financeMsg, setFinanceMsg] = useState("")

  // Skills state
  const [skills, setSkills] = useState<Skill[]>([])
  const [skillName, setSkillName] = useState("")
  const [skillLevel, setSkillLevel] = useState(70)
  const [skillDemand, setSkillDemand] = useState(60)
  const [addingSkill, setAddingSkill] = useState(false)

  // Habits/Execution state
  const [habits, setHabits] = useState<any[]>([])
  const [newHabitName, setNewHabitName] = useState("")
  const [addingHabit, setAddingHabit] = useState(false)

  // Goals state
  const [goals, setGoals] = useState<Goal[]>([])
  const [goalTitle, setGoalTitle] = useState("")
  const [goalProgress, setGoalProgress] = useState(0)
  const [goalDeadline, setGoalDeadline] = useState("")
  const [addingGoal, setAddingGoal] = useState(false)

  // Loading
  const [loading, setLoading] = useState(true)

  async function loadAllData() {
    try {
      setLoading(true)
      const [finRes, skillsRes, habitsRes, goalsRes] = await Promise.all([
        fetch("/api/inputs"),
        fetch("/api/skills"),
        fetch("/api/habits"),
        fetch("/api/goals")
      ])

      if (finRes.ok) {
        const finData = await finRes.json()
        setIncome(finData.income.toString())
        setExpenses(finData.expenses.toString())
        setSavings(finData.savings.toString())
        setInvestments(finData.investments.toString())
      }

      if (skillsRes.ok) {
        const skillsData = await skillsRes.json()
        setSkills(skillsData)
      }

      if (habitsRes.ok) {
        const habitsData = await habitsRes.json()
        setHabits(habitsData.habits || [])
      }

      if (goalsRes.ok) {
        const goalsData = await goalsRes.json()
        setGoals(goalsData)
      }
    } catch (err) {
      console.error("Error loading inputs data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  // 1. Save Finances
  async function handleSaveFinances(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSavingFinance(true)
      setFinanceMsg("")
      const res = await fetch("/api/inputs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          income: Number(income) || 0,
          expenses: Number(expenses) || 0,
          savings: Number(savings) || 0,
          investments: Number(investments) || 0
        })
      })
      if (res.ok) {
        setFinanceMsg("Finances updated successfully!")
        // Sync calculations
        fetch("/api/dashboard")
      } else {
        setFinanceMsg("Failed to update finances.")
      }
    } catch (err) {
      setFinanceMsg("Network error occurred.")
    } finally {
      setSavingFinance(false)
    }
  }

  // 2. Manage Skills
  async function handleAddSkill(e: React.FormEvent) {
    e.preventDefault()
    if (!skillName.trim()) return
    try {
      setAddingSkill(true)
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: skillName.trim(),
          level: skillLevel,
          marketDemand: skillDemand
        })
      })
      if (res.ok) {
        setSkillName("")
        setSkillLevel(70)
        setSkillDemand(60)
        const updated = await fetch("/api/skills").then(r => r.json())
        setSkills(updated)
        // Sync calculations
        fetch("/api/dashboard")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setAddingSkill(false)
    }
  }

  async function handleDeleteSkill(id: string) {
    try {
      const res = await fetch(`/api/skills?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setSkills(skills.filter(s => s._id !== id))
        fetch("/api/dashboard")
      }
    } catch (err) {
      console.error(err)
    }
  }

  // 3. Manage Habits
  async function handleAddHabit(e: React.FormEvent) {
    e.preventDefault()
    if (!newHabitName.trim()) return
    try {
      setAddingHabit(true)
      const res = await fetch("/api/habits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", name: newHabitName.trim() })
      })
      if (res.ok) {
        setNewHabitName("")
        const updated = await res.json()
        setHabits(updated.habits || [])
        fetch("/api/dashboard")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setAddingHabit(false)
    }
  }

  async function handleDeleteHabit(name: string) {
    try {
      const res = await fetch("/api/habits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", name })
      })
      if (res.ok) {
        const updated = await res.json()
        setHabits(updated.habits || [])
        fetch("/api/dashboard")
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleToggleHabitToday(name: string) {
    try {
      const todayStr = new Date().toISOString();
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dateStr: todayStr })
      })
      if (res.ok) {
        const updated = await res.json()
        setHabits(updated.habits || [])
        fetch("/api/dashboard")
      }
    } catch (err) {
      console.error(err)
    }
  }

  function isHabitCompletedToday(completedDates: string[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return completedDates.some(d => {
      const cmp = new Date(d);
      cmp.setHours(0, 0, 0, 0);
      return cmp.getTime() === today.getTime();
    });
  }

  // 4. Manage Goals
  async function handleAddGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!goalTitle.trim() || !goalDeadline) return
    try {
      setAddingGoal(true)
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goalTitle.trim(),
          progress: goalProgress,
          deadline: goalDeadline
        })
      })
      if (res.ok) {
        setGoalTitle("")
        setGoalProgress(0)
        setGoalDeadline("")
        const updated = await fetch("/api/goals").then(r => r.json())
        setGoals(updated)
        fetch("/api/dashboard")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setAddingGoal(false)
    }
  }

  async function handleUpdateGoalProgress(id: string, currentVal: number, dir: "up" | "down") {
    try {
      const newVal = dir === "up" ? Math.min(currentVal + 10, 100) : Math.max(currentVal - 10, 0);
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, progress: newVal })
      })
      if (res.ok) {
        setGoals(goals.map(g => g._id === id ? { ...g, progress: newVal } : g))
        fetch("/api/dashboard")
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDeleteGoal(id: string) {
    try {
      const res = await fetch(`/api/goals?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setGoals(goals.filter(g => g._id !== id))
        fetch("/api/dashboard")
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-semibold">Loading your stability sources...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-[#111113] p-6 rounded-2xl border border-white/5 shadow-xl">
        <h1 className="text-2xl font-medium text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Stability Data Inputs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configure and manage your financial sources, capabilities, habits, and goals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Financials & Habits */}
        <div className="space-y-8">
          
          {/* Financial Sources Form */}
          <section className="bg-[#111113] border border-white/5 rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
              <Database className="w-5 h-5 text-primary" />
              Financial Sources
            </h2>
            <form onSubmit={handleSaveFinances} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Monthly Income ($)</label>
                  <input 
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Monthly Expenses ($)</label>
                  <input 
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Savings Balance ($)</label>
                  <input 
                    type="number"
                    value={savings}
                    onChange={(e) => setSavings(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Investments ($)</label>
                  <input 
                    type="number"
                    value={investments}
                    onChange={(e) => setInvestments(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={savingFinance}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-black font-semibold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                {savingFinance ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Financial Parameters"}
              </button>
              {financeMsg && <p className="text-xs text-emerald-400 font-semibold text-center mt-2">{financeMsg}</p>}
            </form>
          </section>

          {/* Habit Tracker */}
          <section className="bg-[#111113] border border-white/5 rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
              <CheckSquare className="w-5 h-5 text-primary" />
              Daily Habit Tracker
            </h2>
            
            {/* Quick Add Habit */}
            <form onSubmit={handleAddHabit} className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="New habit name..."
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-primary/50"
              />
              <button 
                type="submit"
                disabled={addingHabit || !newHabitName.trim()}
                className="bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary px-4 rounded-xl transition text-xs font-semibold"
              >
                Add
              </button>
            </form>

            <div className="space-y-3">
              {habits.map((habit) => {
                const completed = isHabitCompletedToday(habit.completedDates)
                return (
                  <div key={habit.name} className="flex justify-between items-center bg-white/5 border border-white/5 hover:border-white/10 px-4 py-3 rounded-xl transition">
                    <button 
                      onClick={() => handleToggleHabitToday(habit.name)}
                      className="flex items-center gap-3 text-left"
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        completed ? "bg-primary border-primary text-black" : "border-white/20 hover:border-primary"
                      }`}>
                        {completed && "✓"}
                      </div>
                      <span className={`text-xs font-medium text-white ${completed ? "line-through text-muted-foreground" : ""}`}>
                        {habit.name}
                      </span>
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {habit.completedDates.length} completions
                      </span>
                      <button 
                        onClick={() => handleDeleteHabit(habit.name)}
                        className="text-muted-foreground hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

        </div>

        {/* Right Column: Skills & Goals */}
        <div className="space-y-8">
          
          {/* Skills Form */}
          <section className="bg-[#111113] border border-white/5 rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
              <Award className="w-5 h-5 text-primary" />
              Capability Inventory
            </h2>

            {/* Add Skill form */}
            <form onSubmit={handleAddSkill} className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5 mb-6">
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] text-muted-foreground uppercase font-bold">Skill Name</label>
                <input 
                  type="text" 
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. Next.js, Financial Modeling, Public Relations"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-primary/50"
                  required
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold">
                  <span>Level Mastery</span>
                  <span className="text-primary font-bold">{skillLevel}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold">
                  <span>Market Demand</span>
                  <span className="text-primary font-bold">{skillDemand}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={skillDemand}
                  onChange={(e) => setSkillDemand(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                />
              </div>
              <button 
                type="submit"
                disabled={addingSkill || !skillName.trim()}
                className="col-span-2 bg-primary hover:bg-primary/95 text-black font-semibold text-xs py-2 rounded-lg transition"
              >
                Add Skill
              </button>
            </form>

            <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
              {skills.map((skill) => (
                <div key={skill._id} className="flex justify-between items-center bg-white/5 border border-white/5 hover:border-white/10 px-4 py-3 rounded-xl transition">
                  <div>
                    <div className="text-xs text-white font-semibold">{skill.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Market Demand: {skill.marketDemand}%</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md font-semibold">
                      Lvl {skill.level}%
                    </span>
                    <button 
                      onClick={() => handleDeleteSkill(skill._id)}
                      className="text-muted-foreground hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Goals Form */}
          <section className="bg-[#111113] border border-white/5 rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
              <Calendar className="w-5 h-5 text-primary" />
              Strategic Goals
            </h2>

            {/* Add Goal form */}
            <form onSubmit={handleAddGoal} className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5 mb-6">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase font-bold">Goal Title</label>
                <input 
                  type="text" 
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Save $10k, Complete Next.js Portfolio"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-primary/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold font-semibold">Deadline</label>
                  <input 
                    type="date" 
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-primary/50"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold">
                    <span>Initial Progress</span>
                    <span className="text-primary font-bold">{goalProgress}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="10"
                    value={goalProgress}
                    onChange={(e) => setGoalProgress(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={addingGoal || !goalTitle.trim()}
                className="w-full bg-primary hover:bg-primary/95 text-black font-semibold text-xs py-2 rounded-lg transition"
              >
                Add Goal
              </button>
            </form>

            <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
              {goals.map((goal) => (
                <div key={goal._id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col justify-between transition hover:border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs text-white font-semibold">{goal.title}</h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        Deadline: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="text-muted-foreground hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-4 mt-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${goal.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-white w-8 text-right">{goal.progress}%</span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleUpdateGoalProgress(goal._id, goal.progress, "down")}
                        className="w-5 h-5 bg-white/5 border border-white/10 text-white rounded text-[10px] flex items-center justify-center hover:bg-white/10"
                      >
                        -
                      </button>
                      <button 
                        onClick={() => handleUpdateGoalProgress(goal._id, goal.progress, "up")}
                        className="w-5 h-5 bg-white/5 border border-white/10 text-white rounded text-[10px] flex items-center justify-center hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}
