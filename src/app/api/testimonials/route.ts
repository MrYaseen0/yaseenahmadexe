import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET — fetch approved testimonials (public)
export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ testimonials });
  } catch (error) {
    return NextResponse.json({ testimonials: [] });
  }
}

// POST — submit a new testimonial (pending approval)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, company, email, rating, message } = body;

    if (!name || !role || !email || !message) {
      return NextResponse.json(
        { error: "Name, role, email, and message are required" },
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

    const ratingNum = Math.max(1, Math.min(5, Number(rating) || 5));

    if (String(message).trim().length < 10) {
      return NextResponse.json(
        { error: "Please write at least 10 characters in your message" },
        { status: 400 }
      );
    }

    const saved = await db.testimonial.create({
      data: {
        name: String(name).slice(0, 120),
        role: String(role).slice(0, 120),
        company: company ? String(company).slice(0, 200) : null,
        email: String(email).slice(0, 200),
        rating: ratingNum,
        message: String(message).slice(0, 2000),
        // Assign a color based on name hash for avatar variety
        color: ["sky", "pink", "wood"][name.charCodeAt(0) % 3],
      },
    });

    return NextResponse.json({
      success: true,
      id: saved.id,
      message:
        "Thank you for your testimonial! It will appear publicly after a quick review.",
    });
  } catch (error: any) {
    console.error("Testimonial submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit testimonial. Please try again." },
      { status: 500 }
    );
  }
}
