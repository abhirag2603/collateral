"use client"

import { useEffect, useState } from "react"
import { BarChart2, Loader2, Calendar } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

interface Snapshot {
  _id: string;
  totalScore: number;
  breakdown: {
    financial: number;
    skill: number;
    execution: number;
    opportunity: number;
    risk: number;
  };
  createdAt: string;
}

interface Habit {
  name: string;
  completedDates: string[];
}

export default function AnalyticsPage() {
  const [history, setHistory] = useState<Snapshot[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"1W" | "1M" | "All">("1M")

  async function loadAnalyticsData() {
    try {
      setLoading(true)
      const [histRes, habitsRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/habits")
      ])

      if (histRes.ok) {
        const histData = await histRes.json()
        setHistory(histData)
      }

      if (habitsRes.ok) {
        const habitsData = await habitsRes.json()
        setHabits(habitsData.habits || [])
      }
    } catch (err) {
      console.error("Error loading analytics data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  // Filter history based on timeframe
  const getFilteredData = () => {
    if (history.length === 0) {
      return [
        { date: "Start", score: 50 },
        { date: "Current", score: 50 }
      ]
    }

    const now = new Date()
    let filtered = [...history]

    if (timeframe === "1W") {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(now.getDate() - 7)
      filtered = history.filter(s => new Date(s.createdAt) >= oneWeekAgo)
    } else if (timeframe === "1M") {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(now.getMonth() - 1)
      filtered = history.filter(s => new Date(s.createdAt) >= oneMonthAgo)
    }

    return filtered.map(s => ({
      date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: s.totalScore,
      Financial: s.breakdown?.financial || 0,
      Skill: s.breakdown?.skill || 0,
      Execution: s.breakdown?.execution || 0,
      Opportunity: s.breakdown?.opportunity || 0,
      Risk: s.breakdown?.risk || 0
    }))
  }

  // Generate last 30 days grid dates
  const generateHeatmapData = () => {
    const dates = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      d.setHours(0, 0, 0, 0)
      return d
    })

    return dates.map(date => {
      let completedCount = 0
      habits.forEach(h => {
        const hasCompleted = h.completedDates.some(cDateStr => {
          const cDate = new Date(cDateStr)
          cDate.setHours(0, 0, 0, 0)
          return cDate.getTime() === date.getTime()
        })
        if (hasCompleted) completedCount++
      })

      return {
        dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: completedCount,
        percent: habits.length > 0 ? (completedCount / habits.length) * 100 : 0
      }
    })
  }

  if (loading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-semibold">Retrieving progression indices...</p>
      </div>
    )
  }

  const chartData = getFilteredData()
  const heatmapData = generateHeatmapData()

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-[#111113] p-6 rounded-2xl border border-white/5 shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-white flex items-center gap-2 mb-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Collateral Analytics
          </h1>
          <p className="text-sm text-muted-foreground">Deep dive into multi-timeframe score tracking and execution heatmaps.</p>
        </div>
        <div className="flex gap-2">
          {(["1W", "1M", "All"] as const).map(tf => (
            <button 
              key={tf} 
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition ${
                timeframe === tf 
                  ? "bg-primary text-black" 
                  : "bg-white/5 text-muted-foreground hover:text-white border border-white/5"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Score Trend LineChart */}
      <div className="bg-[#111113] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-medium text-white">Stability Score Progression</h2>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.4)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.4)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(10,10,11,0.95)', 
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: '#fff'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                name="Total Score"
                stroke="oklch(0.704 0.140 153)" // Primary Emerald color
                strokeWidth={3} 
                dot={{ fill: 'oklch(0.704 0.140 153)', strokeWidth: 2 }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                dataKey="Financial" 
                stroke="#3b82f6" 
                strokeWidth={1.5} 
                dot={false}
                strokeDasharray="4 4"
              />
              <Line 
                type="monotone" 
                dataKey="Skill" 
                stroke="#6366f1" 
                strokeWidth={1.5} 
                dot={false}
                strokeDasharray="4 4"
              />
              <Line 
                type="monotone" 
                dataKey="Execution" 
                stroke="#ec4899" 
                strokeWidth={1.5} 
                dot={false}
                strokeDasharray="4 4"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Habits Heatmap */}
      <div className="bg-[#111113] border border-white/5 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Execution Consistency Heatmap
          </h2>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            Last 30 Days
          </span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-30 gap-2">
          {heatmapData.map((day, i) => {
            let colorClass = "bg-white/5 border border-white/5"
            if (day.count > 0) {
              if (day.percent >= 90) colorClass = "bg-primary border border-primary/20 shadow-emerald-500/20 shadow-sm"
              else if (day.percent >= 50) colorClass = "bg-primary/60 border border-primary/20"
              else colorClass = "bg-primary/25 border border-primary/10"
            }

            return (
              <div 
                key={i} 
                className={`h-10 rounded-lg flex flex-col items-center justify-center relative group ${colorClass}`}
              >
                <span className="text-[10px] text-white/90 font-bold">{day.count}</span>
                {/* Tooltip message */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black text-white text-[9px] px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none whitespace-nowrap z-55 font-semibold">
                  {day.dateStr}: {day.count} habit{day.count === 1 ? '' : 's'} completed
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-between items-center mt-6 text-[10px] text-muted-foreground uppercase font-bold tracking-wider border-t border-white/5 pt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-white/5" />
            <span>0 Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary/25" />
            <span>Low Completion (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary/60" />
            <span>Medium (50%-90%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>High Completion (100%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
