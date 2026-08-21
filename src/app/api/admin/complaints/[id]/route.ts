import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/require-admin";
import { updateComplaintStatus, isComplaintStatus } from "@/db/orders-repo";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }
  const status = String(body.status ?? "");
  if (!isComplaintStatus(status)) {
    return NextResponse.json({ ok: false, message: "Invalid status." }, { status: 400 });
  }
  const complaint = await updateComplaintStatus(id, status);
  if (!complaint) {
    return NextResponse.json({ ok: false, message: "Complaint not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, complaint });
}
