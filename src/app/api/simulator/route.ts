import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { FinancialData } from "@/models/FinancialData";
import { Skill } from "@/models/Skill";
import { Execution } from "@/models/Execution";
import { Goal } from "@/models/Goal";
import { Decision } from "@/models/Decision";
import { calculateCollateralScore, RawMetrics } from "@/lib/scoring";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const decisions = await Decision.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json(decisions);
  } catch (error: any) {
    console.error("GET decisions error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { scenarioInput } = await req.json();
    if (!scenarioInput) {
      return NextResponse.json({ message: "Scenario input is required" }, { status: 400 });
    }

    await connectDB();
    const userId = session.user.id;

    // Load actual current stats
    let financial = await FinancialData.findOne({ userId });
    if (!financial) {
      financial = await FinancialData.create({ userId, income: 0, expenses: 0, savings: 0, investments: 0 });
    }
    const skills = await Skill.find({ userId });
    const execDoc = await Execution.findOne({ userId });
    const goalsList = await Goal.find({ userId });

    // 1. Calculate current score
    const habitsCount = execDoc?.habits?.length || 3;
    let totalCompletions = 0;
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });
    execDoc?.habits?.forEach((h: any) => {
      h.completedDates.forEach((d: Date) => {
        const t = new Date(d).setHours(0, 0, 0, 0);
        if (last7Days.includes(t)) totalCompletions++;
      });
    });
    const completionRate = Math.min(Math.round((totalCompletions / (habitsCount * 7)) * 100), 100);

    const avgGoalProgress = goalsList.length > 0
      ? goalsList.reduce((sum, g) => sum + g.progress, 0) / goalsList.length
      : 50;

    const currentMetrics: RawMetrics = {
      financial: {
        income: financial.income,
        expenses: financial.expenses,
        savings: financial.savings,
        investments: financial.investments
      },
      skills: skills.map(s => ({ level: s.level, marketDemand: s.marketDemand })),
      execution: { habitCompletionRate: completionRate },
      opportunity: {
        networkReach: Math.min(skills.length * 8 + 30, 100),
        optionsValue: Math.round(avgGoalProgress)
      }
    };

    const currentScore = calculateCollateralScore(currentMetrics);

    // 2. Compute hypothetical scenario impact deterministically
    let hypIncome = financial.income;
    let hypExpenses = financial.expenses;
    let hypSavings = financial.savings;
    let hypInvestments = financial.investments;
    let hypSkills = skills.map(s => ({ level: s.level, marketDemand: s.marketDemand }));

    const text = scenarioInput.toLowerCase();
    let recoveryTime = "3 months";
    let riskLevel: "Low" | "Medium" | "High" = "Medium";

    if (text.includes("quit") || text.includes("resign") || text.includes("leave job")) {
      hypIncome = 0;
      // Assume finding a job takes 6 months, depleting savings
      hypSavings = Math.max(0, financial.savings - (financial.expenses * 6));
      recoveryTime = "12 months";
      riskLevel = "High";
    } else if (text.includes("downsize") || text.includes("cheaper") || text.includes("move in")) {
      hypExpenses = Math.round(financial.expenses * 0.75); // 25% rent drop
      hypSavings = financial.savings + 500;
      recoveryTime = "Immediate";
      riskLevel = "Low";
    } else if (text.includes("buy a house") || text.includes("mortgage") || text.includes("down payment")) {
      hypSavings = Math.max(0, financial.savings - 20000); // Assume down payment
      hypExpenses = Math.round(financial.expenses * 1.25); // mortgage interest increase
      recoveryTime = "18 months";
      riskLevel = "High";
    } else if (text.includes("bootcamp") || text.includes("course") || text.includes("learn")) {
      hypSavings = Math.max(0, financial.savings - 3000);
      hypSkills.push({ level: 75, marketDemand: 80 }); // Add hypothetical skill
      recoveryTime = "4 months";
      riskLevel = "Low";
    } else {
      // Default hypothetical impact
      hypSavings = Math.max(0, financial.savings * 0.9);
      recoveryTime = "6 months";
      riskLevel = "Medium";
    }

    const hypMetrics: RawMetrics = {
      financial: {
        income: hypIncome,
        expenses: hypExpenses,
        savings: hypSavings,
        investments: hypInvestments
      },
      skills: hypSkills,
      execution: { habitCompletionRate: completionRate },
      opportunity: currentMetrics.opportunity
    };

    const hypScore = calculateCollateralScore(hypMetrics);
    const scoreImpact = hypScore.total - currentScore.total;

    // 3. Generate AI explanation using Gemini (fallback if key is missing or fails)
    let aiExplanation = "";
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `You are a professional life risk and financial stability AI consultant. Be concise and analytical.

The user wants to simulate: "${scenarioInput}".
Current Financial Profile: Income = $${financial.income}/mo, Expenses = $${financial.expenses}/mo, Savings = $${financial.savings}, Investments = $${financial.investments}.
Deterministic Impact analysis:
- Score changed from ${currentScore.total} to ${hypScore.total} (Impact: ${scoreImpact} points).
- Projected Risk Level is ${riskLevel}.
- Recovery Time is ${recoveryTime}.

Provide a brief 2-sentence explanation of why the score shifts and a recommendation.`;
        
        const result = await model.generateContent(prompt);
        aiExplanation = result.response.text().trim();
      } catch (err: any) {
        console.error("Gemini error in Decision Simulator:", err);
        aiExplanation = `Quitting your job or changing income streams immediately alters cashflow. With current savings runway of ${
          financial.expenses > 0 ? Math.round(financial.savings / financial.expenses) : 0
        } months, this moves your stability indicators.`;
      }
    } else {
      aiExplanation = `A change in cashflow or savings impacts your liquid runway. With current expenses at $${financial.expenses}/mo, a drop in reserves reduces your risk buffer and drops your stability score.`;
    }

    // Save decision to database
    const decision = await Decision.create({
      userId,
      scenarioInput,
      scoreImpact,
      riskLevel,
      recoveryTime,
      explanation: aiExplanation, // Save the reasoning
    });

    return NextResponse.json(decision);
  } catch (error: any) {
    console.error("POST decisions simulator error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
