import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { ScoreSnapshot } from "@/models/ScoreSnapshot";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const snapshots = await ScoreSnapshot.find({ userId: session.user.id }).sort({ createdAt: 1 });
    
    // If no snapshots exist, we can pre-seed 30 days of mock historical data 
    // to simulate "more and more inputs" over time for the trend chart
    if (snapshots.length === 0) {
      const generatedSnapshots = [];
      let currentScore = 40;
      
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(12, 0, 0, 0);

        currentScore = Math.min(100, Math.max(0, currentScore + (Math.random() * 8 - 3))); // slight upward bias
        
        generatedSnapshots.push({
          userId: session.user.id,
          totalScore: Math.round(currentScore),
          breakdown: {
            financial: Math.round(currentScore * 0.9),
            skill: Math.round(currentScore * 1.1),
            execution: Math.round(currentScore * 0.8),
            opportunity: Math.round(currentScore * 1.0),
            risk: Math.round(currentScore * 0.9)
          },
          createdAt: d
        });
      }
      
      // Save all snapshots
      for (const snap of generatedSnapshots) {
        await ScoreSnapshot.create(snap);
      }
      
      return NextResponse.json(generatedSnapshots);
    }

    return NextResponse.json(snapshots);
  } catch (error: any) {
    console.error("GET analytics history snapshots error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
