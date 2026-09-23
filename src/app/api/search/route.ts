import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Skill } from "@/models/Skill";
import { Goal } from "@/models/Goal";
import { Execution } from "@/models/Execution";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    await connectDB();
    const userId = session.user.id;
    const regex = new RegExp(query, "i"); // Case-insensitive regex search

    // Run searches in parallel
    const [skills, goals, execution] = await Promise.all([
      Skill.find({ userId, name: { $regex: regex } }).limit(5),
      Goal.find({ userId, title: { $regex: regex } }).limit(5),
      Execution.findOne({ userId })
    ]);

    const results = [];

    // Map Skills
    skills.forEach((s) => {
      results.push({
        type: "Skill",
        title: s.name,
        subtitle: `Level: ${s.level}/100`,
        url: "/inputs",
      });
    });

    // Map Goals
    goals.forEach((g) => {
      results.push({
        type: "Goal",
        title: g.title,
        subtitle: `Progress: ${g.progress}%`,
        url: "/inputs",
      });
    });

    // Map Habits
    if (execution && execution.habits) {
      const matchedHabits = execution.habits.filter((h: any) => regex.test(h.name)).slice(0, 5);
      matchedHabits.forEach((h: any) => {
        results.push({
          type: "Habit",
          title: h.name,
          subtitle: `${h.completedDates.length} total completions`,
          url: "/inputs",
        });
      });
    }

    // Include Simulator trigger if query looks like a scenario
    if (query.toLowerCase().startsWith("what if") || query.toLowerCase().includes("quit") || query.toLowerCase().includes("buy") || query.split(" ").length > 2) {
      results.push({
        type: "Simulation",
        title: `Run scenario: "${query}"`,
        subtitle: "Test this life change in the Simulator",
        url: "/simulator",
      });
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("GET search error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
