import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { FinancialData } from "@/models/FinancialData";
import { Skill } from "@/models/Skill";
import { Execution } from "@/models/Execution";
import { Goal } from "@/models/Goal";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ message: "Question is required" }, { status: 400 });
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

    let aiAnswer = "";
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `You are the Collateral Risk & Growth advisor chatbot. Answer the user's specific questions regarding their career, goals, habits, and runway stability based on their active indicators. Be concise (max 3 sentences) and action-oriented.
        
User Stats:
- Financials: Income = $${financial.income}/mo, Expenses = $${financial.expenses}/mo, Savings = $${financial.savings}, Investments = $${financial.investments}.
- Skills: ${skillsSummary}.
- Habit Completion: ${completionRate}% over last 7 days.
- Goals: ${goalsSummary}.

User's Question: "${question}"`;
        
        const result = await model.generateContent(prompt);
        aiAnswer = result.response.text().trim();
      } catch (err: any) {
        console.error("Gemini error in insights chat:", err);
        aiAnswer = "I encountered an error querying the model. Please check your API credentials.";
      }
    } else {
      aiAnswer = "Gemini key is not set. Please configure process.env.GEMINI_API_KEY to enable chat capabilities.";
    }

    return NextResponse.json({ answer: aiAnswer });
  } catch (error: any) {
    console.error("POST insights chat error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
