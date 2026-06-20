"use client"

import { useEffect, useState } from "react"
import { Bot, Lightbulb, TrendingUp, AlertTriangle, ArrowRight, Loader2, Sparkles } from "lucide-react"

interface Insight {
  _id: string;
  message: string;
  type: "info" | "warning" | "growth";
  createdAt: string;
}

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [activeTab, setActiveTab] = useState<"info" | "warning" | "growth">("info")
  const [chatInput, setChatInput] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { sender: "bot", text: "Hello! I am your personal growth consultant. Ask me any details regarding your savings runway, skill demands, or execution trends." }
  ])
  const [sendingChat, setSendingChat] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [loading, setLoading] = useState(true)

  async function loadInsights() {
    try {
      const res = await fetch("/api/insights")
      if (res.ok) {
        const data = await res.json()
        setInsights(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInsights()
  }, [])

  async function handleTriggerReport() {
    try {
      setGeneratingReport(true)
      const res = await fetch("/api/insights", { method: "POST" })
      if (res.ok) {
        await loadInsights()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setGeneratingReport(false)
    }
  }

  async function handleSendChat(e: React.FormEvent) {
    e.preventDefault()
    if (!chatInput.trim() || sendingChat) return

    const userMsg = chatInput.trim()
    setChatInput("")
    setChatHistory(prev => [...prev, { sender: "user", text: userMsg }])
    
    try {
      setSendingChat(true)
      const res = await fetch("/api/insights/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg })
      })

      if (res.ok) {
        const data = await res.json()
        setChatHistory(prev => [...prev, { sender: "bot", text: data.answer }])
      } else {
        setChatHistory(prev => [...prev, { sender: "bot", text: "Sorry, I am having trouble connecting to my reasoning modules." }])
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: "bot", text: "Network error occurred." }])
    } finally {
      setSendingChat(false)
    }
  }

  // Filter insights based on active tab
  const filteredInsights = insights.filter(ins => ins.type === activeTab)

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-[#111113] p-6 rounded-2xl border border-white/5 shadow-xl flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-2xl font-medium text-white flex items-center gap-2 mb-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Insights Engine
          </h1>
          <p className="text-sm text-muted-foreground">Personalized reports and growth strategies generated from your Collateral metrics.</p>
        </div>
        <button
          onClick={handleTriggerReport}
          disabled={generatingReport}
          className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-4 py-2.5 rounded-xl transition flex items-center gap-2"
        >
          {generatingReport ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Generate Report
            </>
          )}
        </button>
      </div>

      {/* Tabs Row */}
      <div className="grid grid-cols-3 gap-4 flex-shrink-0">
        <button 
          onClick={() => setActiveTab("info")}
          className={`p-4 rounded-xl text-left transition border ${
            activeTab === "info" 
              ? "bg-primary/5 border-primary/30 text-primary" 
              : "border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white"
          }`}
        >
          <Lightbulb className="w-4 h-4 mb-2" />
          <div className="text-sm font-semibold">Weekly Report</div>
        </button>
        <button 
          onClick={() => setActiveTab("warning")}
          className={`p-4 rounded-xl text-left transition border ${
            activeTab === "warning" 
              ? "bg-rose-500/5 border-rose-500/30 text-rose-400" 
              : "border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white"
          }`}
        >
          <AlertTriangle className="w-4 h-4 mb-2" />
          <div className="text-sm font-semibold">Risk Alerts</div>
        </button>
        <button 
          onClick={() => setActiveTab("growth")}
          className={`p-4 rounded-xl text-left transition border ${
            activeTab === "growth" 
              ? "bg-blue-500/5 border-blue-500/30 text-blue-400" 
              : "border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white"
          }`}
        >
          <TrendingUp className="w-4 h-4 mb-2" />
          <div className="text-sm font-semibold">Growth Pathways</div>
        </button>
      </div>

      {/* Reports Display & Chat Area */}
      <div className="flex-1 bg-[#111113] border border-white/5 rounded-2xl flex flex-col overflow-hidden min-h-[450px] shadow-xl">
        <div className="p-6 border-b border-white/5 bg-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">System Intelligence Reports</div>
              <div className="text-xs text-primary font-medium capitalize">{activeTab === "info" ? "Weekly Status Checks" : activeTab === "warning" ? "Critical Risk Checks" : "Opportunity Mapping"}</div>
            </div>
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 min-h-[150px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <p className="text-xs">Loading insights history...</p>
            </div>
          ) : filteredInsights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs font-medium bg-white/5 rounded-xl border border-white/5 p-6">
              No report logs for this category. Click 'Generate Report' above to run AI calculations.
            </div>
          ) : (
            filteredInsights.map((ins) => (
              <div key={ins._id} className="bg-white/5 p-4 rounded-xl border border-white/5 relative">
                <p className="text-xs text-muted-foreground font-semibold mb-2">
                  {new Date(ins.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-sm text-white/90 leading-relaxed font-medium">{ins.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Chat Interface Section */}
        <div className="border-t border-white/5 bg-black/30 p-4 space-y-4">
          <div className="max-h-[140px] overflow-y-auto no-scrollbar space-y-3 px-2">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-black font-semibold rounded-br-none' 
                    : 'bg-white/5 text-muted-foreground rounded-bl-none border border-white/5'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {sendingChat && (
              <div className="flex justify-start">
                <div className="bg-white/5 text-muted-foreground rounded-xl p-3 text-xs rounded-bl-none border border-white/5 flex items-center gap-1.5 font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  Growth advisor is analyzing stats...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="bg-black/50 border border-white/10 rounded-full px-4 py-2.5 flex items-center gap-2">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask AI Growth Advisor (e.g. 'How is my savings runway?')" 
              className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-muted-foreground/50"
              disabled={sendingChat}
            />
            <button 
              type="submit"
              disabled={sendingChat || !chatInput.trim()}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0 disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
