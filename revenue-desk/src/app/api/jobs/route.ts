import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await prisma.job.findMany({
      where: { workspaceId: session.user.workspaceId },
      include: { customer: { select: { name: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      customerId,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehiclePlate,
      labourCost,
      partsCost,
      dateDue,
      notes,
    } = body;

    const totalCost = (Number(labourCost) || 0) + (Number(partsCost) || 0);

    const job = await prisma.job.create({
      data: {
        title,
        description,
        customerId,
        vehicleMake,
        vehicleModel,
        vehicleYear: vehicleYear ? Number(vehicleYear) : null,
        vehiclePlate,
        labourCost: Number(labourCost) || 0,
        partsCost: Number(partsCost) || 0,
        totalCost,
        dateDue: dateDue ? new Date(dateDue) : null,
        notes,
        workspaceId: session.user.workspaceId,
      },
      include: { customer: { select: { name: true, phone: true } } },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
