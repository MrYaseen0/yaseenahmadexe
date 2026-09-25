import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin, verifyToken } from "@/lib/auth";
import { logAudit } from "@/lib/security";

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

    const actor =
      verifyToken(
        (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")
      )?.email || "admin";
    if (action === "approve") {
      const updated = await db.testimonial.update({
        where: { id },
        data: { approved: true },
      });
      await logAudit({
        event: "ADMIN_ACTION",
        request,
        actor,
        path: "/api/admin/testimonials",
        detail: `testimonial approved — "${String(updated.name).slice(0, 60)}" (${String(updated.email).slice(0, 60)})`,
      });
      return NextResponse.json({
        success: true,
        message: "Testimonial approved",
        testimonial: updated,
      });
    } else if (action === "delete") {
      const doomed = await db.testimonial.findUnique({ where: { id } });
      await db.testimonial.delete({ where: { id } });
      await logAudit({
        event: "ADMIN_ACTION",
        request,
        actor,
        path: "/api/admin/testimonials",
        detail: `testimonial deleted — "${String(doomed?.name ?? "?").slice(0, 60)}" (${String(doomed?.email ?? "?").slice(0, 60)})`,
      });
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
