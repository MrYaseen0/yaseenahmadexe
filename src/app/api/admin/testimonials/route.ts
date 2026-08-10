import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

// GET — list ALL testimonials (including pending) for admin review
export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const testimonials = await db.testimonial.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ testimonials });
  } catch (error) {
    return NextResponse.json({ testimonials: [] });
  }
}

// PATCH — approve or reject a testimonial
export async function PATCH(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: "id and action are required" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const updated = await db.testimonial.update({
        where: { id },
        data: { approved: true },
      });
      return NextResponse.json({
        success: true,
        message: "Testimonial approved",
        testimonial: updated,
      });
    } else if (action === "delete") {
      await db.testimonial.delete({ where: { id } });
      return NextResponse.json({
        success: true,
        message: "Testimonial deleted",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'delete'." },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Admin testimonial action error:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}
