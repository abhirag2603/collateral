import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { FinancialData } from "@/models/FinancialData";
import { Skill } from "@/models/Skill";
import { Execution } from "@/models/Execution";
import { Goal } from "@/models/Goal";
import { AIInsight } from "@/models/AIInsight";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const insights = await AIInsight.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json(insights);
  } catch (error: any) {
    console.error("GET insights error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    // Calculate completion rate
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

    const skillsSummary = skills.map(s => `${s.name} (Lvl ${s.level})`).join(", ") || "None";
    const goalsSummary = goalsList.map(g => `${g.title} (${g.progress}% done)`).join(", ") || "None";

    let jsonResponse: any = {
      report: "Your stability indicators are looking stable. Keep tracking habits to boost execution scores.",
      alert: "Monitor expenses relative to income. Building a 6-month runway remains standard guidance.",
      pathway: "Focus on adding high-demand market skills to improve your professional leverage."
    };

    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-flash-latest",
          generationConfig: { responseMimeType: "application/json" }
        });
        
        const prompt = `You are an expert personal risk consultant. You are the Collateral Risk & Growth engine. Analyze the user's data:
- Financials: Income = $${financial.income}/mo, Expenses = $${financial.expenses}/mo, Savings = $${financial.savings}, Investments = $${financial.investments}.
- Skills: ${skillsSummary}.
- Habit Completion: ${completionRate}% over the last 7 days.
- Active Goals: ${goalsSummary}.

Generate stability report advice. You MUST return ONLY a JSON object with these exact keys:
"report": A general status report (2 sentences).
"alert": A risk alert regarding runway, expenses, or bad habits (2 sentences).
"pathway": A clear growth pathway to build skills or increase savings (2 sentences).`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim() || "{}";
        const parsed = JSON.parse(text);
        
        if (parsed.report && parsed.alert && parsed.pathway) {
          jsonResponse = parsed;
        }
      } catch (err: any) {
        console.error("Gemini error generating report:", err);
      }
    }

    // Save individual insights
    const infoInsight = await AIInsight.create({
      userId,
      message: jsonResponse.report,
      type: "info"
    });

    await AIInsight.create({
      userId,
      message: jsonResponse.alert,
      type: "warning"
    });

    await AIInsight.create({
      userId,
      message: jsonResponse.pathway,
      type: "growth"
    });

    return NextResponse.json(infoInsight);
  } catch (error: any) {
    console.error("POST insights generation error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
