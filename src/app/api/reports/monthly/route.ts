import { NextResponse } from "next/server";
import { getAuthUser, isAdminRole } from "@/lib/auth";
import { getMonthlyReport } from "@/lib/reports";

export async function GET() {
  try {
    const actor = await getAuthUser();
    if (!actor) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminRole(actor.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const report = await getMonthlyReport();

    return NextResponse.json(
      { success: true, data: report },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}