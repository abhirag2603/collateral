import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { FinancialData } from "@/models/FinancialData";
import { Skill } from "@/models/Skill";
import { Execution } from "@/models/Execution";
import { Goal } from "@/models/Goal";
import { ScoreSnapshot } from "@/models/ScoreSnapshot";
import { calculateCollateralScore, RawMetrics } from "@/lib/scoring";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = session.user.id;

    // 1. Fetch Financial Data
    let financialDoc = await FinancialData.findOne({ userId });
    if (!financialDoc) {
      financialDoc = await FinancialData.create({ userId, income: 0, expenses: 0, savings: 0, investments: 0 });
    }

    // 2. Fetch Skills
    const skillsList = await Skill.find({ userId });

    // 3. Fetch Execution/Habits to calculate completion rate
    let execDoc = await Execution.findOne({ userId });
    if (!execDoc) {
      execDoc = await Execution.create({ userId, habits: [
        { name: "Financial Tracking", completedDates: [] },
        { name: "Skill Practice (30m)", completedDates: [] },
        { name: "Goal Review", completedDates: [] }
      ]});
    }

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });

    let totalCompletions = 0;
    execDoc.habits.forEach((h: any) => {
      h.completedDates.forEach((d: Date) => {
        const t = new Date(d).setHours(0, 0, 0, 0);
        if (last7Days.includes(t)) {
          totalCompletions++;
        }
      });
    });
    const maxCompletions = (execDoc.habits.length || 1) * 7;
    const completionRate = Math.min(Math.round((totalCompletions / maxCompletions) * 100), 100);

    // 4. Fetch Goals to calculate Opportunity parameters
    const goalsList = await Goal.find({ userId });
    const avgGoalProgress = goalsList.length > 0
      ? goalsList.reduce((sum, g) => sum + g.progress, 0) / goalsList.length
      : 50;

    const networkReach = Math.min(skillsList.length * 8 + 30, 100);
    const optionsValue = Math.round(avgGoalProgress);

    // Assemble metrics
    const metrics: RawMetrics = {
      financial: {
        income: financialDoc.income,
        expenses: financialDoc.expenses,
        savings: financialDoc.savings,
        investments: financialDoc.investments
      },
      skills: skillsList.map(s => ({ level: s.level, marketDemand: s.marketDemand })),
      execution: {
        habitCompletionRate: completionRate
      },
      opportunity: {
        networkReach,
        optionsValue
      }
    };

    // Calculate score
    const collateralScores = calculateCollateralScore(metrics);

    // Check if score snapshot is different or if today doesn't have a snapshot yet
    const allSnapshots = await ScoreSnapshot.find({ userId });
    allSnapshots.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const lastSnapshot = allSnapshots[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let shouldSaveSnapshot = false;
    if (!lastSnapshot) {
      shouldSaveSnapshot = true;
    } else {
      const lastSnapshotDate = new Date(lastSnapshot.createdAt);
      lastSnapshotDate.setHours(0, 0, 0, 0);
      const isDifferentScore = lastSnapshot.totalScore !== collateralScores.total;
      const isNewDay = lastSnapshotDate.getTime() !== today.getTime();

      if (isDifferentScore || isNewDay) {
        shouldSaveSnapshot = true;
      }
    }

    if (shouldSaveSnapshot) {
      await ScoreSnapshot.create({
        userId,
        totalScore: collateralScores.total,
        breakdown: {
          financial: collateralScores.financial,
          skill: collateralScores.skill,
          execution: collateralScores.execution,
          opportunity: collateralScores.opportunity,
          risk: collateralScores.risk
        }
      });
    }

    return NextResponse.json({
      scores: collateralScores,
      financial: financialDoc,
      skillsCount: skillsList.length,
      habitsCount: execDoc.habits.length,
      goalsCount: goalsList.length,
      completionRate
    });
  } catch (error: any) {
    console.error("GET dashboard calculations error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
