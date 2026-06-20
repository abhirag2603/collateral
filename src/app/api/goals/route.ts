import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Goal } from "@/models/Goal";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const goals = await Goal.find({ userId: session.user.id }).sort({ deadline: 1 });
    return NextResponse.json(goals);
  } catch (error: any) {
    console.error("GET goals error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { title, progress, deadline } = await req.json();
    if (!title || progress === undefined || !deadline) {
      return NextResponse.json({ message: "Title, progress, and deadline are required" }, { status: 400 });
    }

    await connectDB();
    const userId = session.user.id;

    const goal = await Goal.create({
      userId,
      title,
      progress: Math.min(Math.max(Number(progress) || 0, 0), 100),
      deadline: new Date(deadline),
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error: any) {
    console.error("POST goal error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { id, progress } = await req.json();
    if (!id || progress === undefined) {
      return NextResponse.json({ message: "Goal ID and progress are required" }, { status: 400 });
    }

    await connectDB();
    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { progress: Math.min(Math.max(Number(progress) || 0, 0), 100) },
      { new: true }
    );

    if (!goal) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error: any) {
    console.error("PUT goal error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Goal ID is required" }, { status: 400 });
    }

    await connectDB();
    const deleted = await Goal.findOneAndDelete({ _id: id, userId: session.user.id });

    if (!deleted) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Goal deleted successfully" });
  } catch (error: any) {
    console.error("DELETE goal error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
