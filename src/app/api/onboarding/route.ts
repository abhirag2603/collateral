import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { FinancialData } from "@/models/FinancialData";
import { Skill } from "@/models/Skill";
import { ScoreSnapshot } from "@/models/ScoreSnapshot";
import { Execution } from "@/models/Execution";
import { calculateCollateralScore, RawMetrics } from "@/lib/scoring";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { jobTitle, industry, bio, financial, skills } = body;

    await connectDB();

    // 1. Update User Profile & mark onboarding completed
    await User.findByIdAndUpdate(userId, {
      $set: {
        jobTitle: jobTitle?.trim() || "Professional",
        industry: industry?.trim() || "",
        bio: bio?.trim() || "",
        onboardingCompleted: true,
      },
    });

    // 2. Upsert Financial Data
    const income = Math.max(0, Number(financial?.income) || 0);
    const expenses = Math.max(0, Number(financial?.expenses) || 0);
    const savings = Math.max(0, Number(financial?.savings) || 0);
    const investments = Math.max(0, Number(financial?.investments) || 0);

    const financialDoc = await FinancialData.findOneAndUpdate(
      { userId },
      { $set: { income, expenses, savings, investments } },
      { upsert: true, new: true }
    );

    // 3. Upsert Skills
    const parsedSkills: { name: string; level: number; marketDemand: number }[] = [];
    if (Array.isArray(skills) && skills.length > 0) {
      for (const s of skills) {
        if (!s.name || !s.name.trim()) continue;
        const name = s.name.trim();
        const level = Math.min(100, Math.max(0, Number(s.level) || 50));
        const marketDemand = Math.min(100, Math.max(0, Number(s.marketDemand) || 70));

        await Skill.findOneAndUpdate(
          { userId, name: { $regex: new RegExp(`^${name}$`, "i") } },
          { $set: { userId, name, level, marketDemand } },
          { upsert: true, new: true }
        );

        parsedSkills.push({ name, level, marketDemand });
      }
    }

    // 4. Ensure Execution baseline exists
    let execDoc = await Execution.findOne({ userId });
    if (!execDoc) {
      execDoc = await Execution.create({
        userId,
        habits: [
          { name: "Financial Tracking", completedDates: [] },
          { name: "Skill Practice (30m)", completedDates: [] },
          { name: "Goal Review", completedDates: [] },
        ],
      });
    }

    // 5. Calculate Baseline Collateral Scores
    const networkReach = Math.min(parsedSkills.length * 8 + 30, 100);
    const optionsValue = 50;

    const metrics: RawMetrics = {
      financial: {
        income: financialDoc.income,
        expenses: financialDoc.expenses,
        savings: financialDoc.savings,
        investments: financialDoc.investments,
      },
      skills: parsedSkills.map((s) => ({ level: s.level, marketDemand: s.marketDemand })),
      execution: {
        habitCompletionRate: 0,
      },
      opportunity: {
        networkReach,
        optionsValue,
      },
    };

    const scores = calculateCollateralScore(metrics);

    // 6. Record Initial Score Snapshot
    await ScoreSnapshot.create({
      userId,
      totalScore: scores.total,
      breakdown: {
        financial: scores.financial,
        skill: scores.skill,
        execution: scores.execution,
        opportunity: scores.opportunity,
        risk: scores.risk,
      },
    });

    return NextResponse.json({
      success: true,
      scores,
      message: "Onboarding successfully completed and baseline initialized.",
    });
  } catch (error: any) {
    console.error("POST /api/onboarding error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
