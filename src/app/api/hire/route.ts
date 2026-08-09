import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, projectType, budget, timeline, description } =
      body;

    if (!name || !email || !projectType || !description) {
      return NextResponse.json(
        { error: "Name, email, project type and description are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const saved = await db.hireRequest.create({
      data: {
        name: String(name).slice(0, 120),
        email: String(email).slice(0, 200),
        company: company ? String(company).slice(0, 200) : null,
        projectType: String(projectType).slice(0, 100),
        budget: budget ? String(budget).slice(0, 100) : null,
        timeline: timeline ? String(timeline).slice(0, 100) : null,
        description: String(description).slice(0, 5000),
      },
    });

    return NextResponse.json({
      success: true,
      id: saved.id,
      message:
        "Your hiring request has been submitted! I'll review and respond within 24 hours.",
    });
  } catch (error: any) {
    console.error("Hire request error:", error);
    return NextResponse.json(
      { error: "Failed to submit request. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const requests = await db.hireRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json({ requests: [] });
  }
}
