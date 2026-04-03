"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Wallet, Lightbulb, CheckSquare, Target, ShieldAlert } from "lucide-react"

interface BreakdownProps {
  financial: number;
  skill: number;
  execution: number;
  opportunity: number;
  risk: number;
}

export function CollateralBreakdown({ financial, skill, execution, opportunity, risk }: BreakdownProps) {
  const items = [
    { label: "Financial Collateral", value: financial, weight: "30%", icon: Wallet, color: "bg-emerald-500" },
    { label: "Skill Collateral", value: skill, weight: "25%", icon: Lightbulb, color: "bg-blue-500" },
    { label: "Execution Collateral", value: execution, weight: "20%", icon: CheckSquare, color: "bg-indigo-500" },
    { label: "Opportunity Collateral", value: opportunity, weight: "15%", icon: Target, color: "bg-purple-500" },
    { label: "Risk Buffer", value: risk, weight: "10%", icon: ShieldAlert, color: "bg-rose-500" },
  ]

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-xl text-foreground font-medium">Collateral Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    {item.weight}
                  </span>
                </div>
                <span className="font-medium text-foreground">{Math.round(item.value)} / 100</span>
              </div>
              <Progress value={item.value} className="h-2 bg-white/5" indicatorClassName={item.color} />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
