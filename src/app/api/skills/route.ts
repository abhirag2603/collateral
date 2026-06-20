import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Skill } from "@/models/Skill";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const skills = await Skill.find({ userId: session.user.id }).sort({ level: -1 });
    return NextResponse.json(skills);
  } catch (error: any) {
    console.error("GET skills error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { name, level, marketDemand } = await req.json();
    if (!name || level === undefined) {
      return NextResponse.json({ message: "Name and level are required" }, { status: 400 });
    }

    await connectDB();
    const userId = session.user.id;

    // Check if skill exists (case-insensitive)
    let skill = await Skill.findOne({ userId, name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });

    if (skill) {
      skill.level = Number(level);
      if (marketDemand !== undefined) skill.marketDemand = Number(marketDemand);
      await skill.save();
    } else {
      skill = await Skill.create({
        userId,
        name: name.trim(),
        level: Number(level),
        marketDemand: Number(marketDemand) || 50,
      });
    }

    return NextResponse.json(skill);
  } catch (error: any) {
    console.error("POST skill error:", error);
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
      return NextResponse.json({ message: "Skill ID is required" }, { status: 400 });
    }

    await connectDB();
    const deleted = await Skill.findOneAndDelete({ _id: id, userId: session.user.id });

    if (!deleted) {
      return NextResponse.json({ message: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Skill deleted successfully" });
  } catch (error: any) {
    console.error("DELETE skill error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
