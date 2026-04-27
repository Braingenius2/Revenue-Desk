import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  workspaceName: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, workspaceName } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const slug = workspaceName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug: `${slug}-${Date.now()}`,
      },
    });

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        workspaceId: workspace.id,
        role: "OWNER",
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Something went wrong: " + message },
      { status: 500 }
    );
  }
}