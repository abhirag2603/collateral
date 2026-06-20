import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { FinancialData } from "@/models/FinancialData";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const userId = session.user.id;
    let financial = await FinancialData.findOne({ userId });
    if (!financial) {
      financial = await FinancialData.create({ userId, income: 0, expenses: 0, savings: 0, investments: 0 });
    }
    return NextResponse.json(financial);
  } catch (error: any) {
    console.error("GET inputs error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { income, expenses, savings, investments } = await req.json();
    await connectDB();
    const userId = session.user.id;

    const financial = await FinancialData.findOneAndUpdate(
      { userId },
      { 
        income: Number(income) || 0, 
        expenses: Number(expenses) || 0, 
        savings: Number(savings) || 0, 
        investments: Number(investments) || 0 
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(financial);
  } catch (error: any) {
    console.error("POST inputs error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
