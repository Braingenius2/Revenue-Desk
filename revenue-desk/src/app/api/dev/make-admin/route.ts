import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, adminSecret } = body;

    if (adminSecret !== "admin-secret-key") {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    return NextResponse.json({ success: true, user: { email: user.email, role: user.role } });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}