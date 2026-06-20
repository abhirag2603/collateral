import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Execution } from "@/models/Execution";

const DEFAULT_HABITS = ["Financial Tracking", "Skill Practice (30m)", "Goal Review"];

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const userId = session.user.id;
    let exec = await Execution.findOne({ userId });

    if (!exec) {
      exec = await Execution.create({
        userId,
        habits: DEFAULT_HABITS.map(h => ({ name: h, completedDates: [] })),
      });
    }

    return NextResponse.json(exec);
  } catch (error: any) {
    console.error("GET habits error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

// Toggle habit completion on a specific date
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { name, dateStr } = await req.json();
    if (!name || !dateStr) {
      return NextResponse.json({ message: "Habit name and date string are required" }, { status: 400 });
    }

    await connectDB();
    const userId = session.user.id;
    const dateToToggle = new Date(dateStr);
    dateToToggle.setHours(0, 0, 0, 0);

    const exec = await Execution.findOne({ userId });
    if (!exec) {
      return NextResponse.json({ message: "Execution document not found" }, { status: 404 });
    }

    const habit = exec.habits.find((h: any) => h.name === name);
    if (!habit) {
      return NextResponse.json({ message: "Habit not found" }, { status: 404 });
    }

    // Check if the date is already in the completedDates
    const existingIndex = habit.completedDates.findIndex((d: Date) => {
      const cmpDate = new Date(d);
      cmpDate.setHours(0, 0, 0, 0);
      return cmpDate.getTime() === dateToToggle.getTime();
    });

    if (existingIndex > -1) {
      // Remove it (toggle off)
      habit.completedDates.splice(existingIndex, 1);
    } else {
      // Add it (toggle on)
      habit.completedDates.push(dateToToggle);
    }

    await exec.save();
    return NextResponse.json(exec);
  } catch (error: any) {
    console.error("POST habits error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

// Add or remove a habit category
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { action, name } = await req.json();
    if (!action || !name) {
      return NextResponse.json({ message: "Action and name are required" }, { status: 400 });
    }

    await connectDB();
    const userId = session.user.id;
    const exec = await Execution.findOne({ userId });

    if (!exec) {
      return NextResponse.json({ message: "Execution document not found" }, { status: 404 });
    }

    if (action === "add") {
      const exists = exec.habits.some((h: any) => h.name.toLowerCase() === name.toLowerCase());
      if (!exists) {
        exec.habits.push({ name: name.trim(), completedDates: [] });
        await exec.save();
      }
    } else if (action === "delete") {
      exec.habits = exec.habits.filter((h: any) => h.name.toLowerCase() !== name.toLowerCase());
      await exec.save();
    }

    return NextResponse.json(exec);
  } catch (error: any) {
    console.error("PUT habits error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
