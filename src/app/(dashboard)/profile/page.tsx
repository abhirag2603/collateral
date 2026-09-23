"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Briefcase, FileText, Loader2, Save, CheckCircle } from "lucide-react"

export default function ProfilePage() {
  const [formData, setFormData] = useState({ name: "", jobTitle: "", bio: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile")
        if (res.ok) {
          const data = await res.json()
          setFormData({
            name: data.name || "",
            jobTitle: data.jobTitle || "",
            bio: data.bio || "",
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
      // Force reload to update sidebar instantly
      window.dispatchEvent(new Event("focus"))
      // Better yet, just reload the page for a clean refresh to get sidebar updated
      window.location.reload()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-medium text-white tracking-tight">Identity & Parameters</h1>
        <p className="text-muted-foreground text-sm">Configure your personal profile details that influence the AI Advisor.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111113] border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Full Name
            </label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> Job Title / Target Role
            </label>
            <input 
              type="text" 
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Personal Bio / Risk Tolerance
            </label>
            <textarea 
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors resize-none"
              placeholder="Describe your current situation, risk appetite, and long term strategic focus..."
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-white/5">
            <p className="text-xs text-muted-foreground">Changes will update your sidebar instantly.</p>
            <button 
              type="submit" 
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-black font-semibold text-sm px-6 py-3 rounded-xl transition flex items-center gap-2"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : saved ? (
                <><CheckCircle className="w-4 h-4" /> Saved</>
              ) : (
                <><Save className="w-4 h-4" /> Save Parameters</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
