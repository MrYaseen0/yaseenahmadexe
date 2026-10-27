import { NextResponse } from "next/server";
import { developer } from "@/lib/portfolio-data";

// Generate a .ics calendar file for a booking
// Query params: date (YYYY-MM-DD), time (e.g. "10:00 AM"), purpose, name, email
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const purpose = searchParams.get("purpose") || "Consultation";
  const name = searchParams.get("name") || "Client";
  const email = searchParams.get("email") || "";

  if (!date || !time) {
    return NextResponse.json(
      { error: "date and time query parameters are required" },
      { status: 400 }
    );
  }

  try {
    // Parse "10:00 AM" → 24h format
    const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) {
      return NextResponse.json(
        { error: "Invalid time format. Expected format like '10:00 AM'" },
        { status: 400 }
      );
    }
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3].toUpperCase();
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    // Build start datetime in PKT (UTC+5), convert to UTC for ICS
    const startLocal = new Date(`${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00+05:00`);
    const endLocal = new Date(startLocal.getTime() + 45 * 60 * 1000); // 45 min call

    const formatICS = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const dtStart = formatICS(startLocal);
    const dtEnd = formatICS(endLocal);
    const dtStamp = formatICS(new Date());
    const uid = `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@yaseenahmadexe.vercel.app`;

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Yaseen Ahmad//Booking//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeICS(`${purpose} with ${developer.name}`)}`,
      `DESCRIPTION:${escapeICS(`Call with ${developer.name} (${developer.role}).\\n\\nPurpose: ${purpose}\\nClient: ${name}${email ? ` <${email}>` : ""}\\n\\nMeeting link will be sent via email after confirmation.\\n\\nContact: ${developer.email}`)}`,
      `LOCATION:${escapeICS("Google Meet / Zoom (link sent via email)")}`,
      `ORGANIZER;CN=${escapeICS(developer.name)}:MAILTO:${developer.email}`,
      `ATTENDEE;CN=${escapeICS(name)};ROLE=REQ-PARTICIPANT:MAILTO:${email || "client@example.com"}`,
      "STATUS:TENTATIVE",
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeICS("Reminder: Call with " + developer.name)}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const filename = `yaseen-ahmad-${purpose.toLowerCase().replace(/\s+/g, "-")}-${date}.ics`;

    return new NextResponse(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Calendar generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate calendar file" },
      { status: 500 }
    );
  }
}

function escapeICS(str: string): string {
  return (str || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
