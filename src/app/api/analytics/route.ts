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
    
    // If no snapshots exist, we can pre-seed a starting snapshot based on the current date
    if (snapshots.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(snapshots);
  } catch (error: any) {
    console.error("GET analytics history snapshots error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
