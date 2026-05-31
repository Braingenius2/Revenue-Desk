import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await prisma.job.findFirst({
      where: { id, workspaceId: session.user.workspaceId },
      include: { customer: { select: { name: true, phone: true, email: true } } },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      title,
      description,
      status,
      customerId,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehiclePlate,
      labourCost,
      partsCost,
      dateDue,
      dateCompleted,
      dateDelivered,
      notes,
    } = body;

    const data: Record<string, unknown> = {};

    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (customerId !== undefined) data.customerId = customerId;
    if (vehicleMake !== undefined) data.vehicleMake = vehicleMake;
    if (vehicleModel !== undefined) data.vehicleModel = vehicleModel;
    if (vehicleYear !== undefined) data.vehicleYear = Number(vehicleYear);
    if (vehiclePlate !== undefined) data.vehiclePlate = vehiclePlate;
    if (labourCost !== undefined) data.labourCost = Number(labourCost);
    if (partsCost !== undefined) data.partsCost = Number(partsCost);
    if (dateDue !== undefined) data.dateDue = dateDue ? new Date(dateDue) : null;
    if (dateCompleted !== undefined) data.dateCompleted = dateCompleted ? new Date(dateCompleted) : null;
    if (dateDelivered !== undefined) data.dateDelivered = dateDelivered ? new Date(dateDelivered) : null;
    if (notes !== undefined) data.notes = notes;

    if (labourCost !== undefined || partsCost !== undefined) {
      const current = await prisma.job.findUnique({ where: { id } });
      if (current) {
        data.totalCost =
          (Number(labourCost ?? current.labourCost)) +
          (Number(partsCost ?? current.partsCost));
      }
    }

    if (status === "COMPLETED" && !data.dateCompleted) {
      data.dateCompleted = new Date();
    }
    if (status === "DELIVERED" && !data.dateDelivered) {
      data.dateDelivered = new Date();
    }

    const job = await prisma.job.updateMany({
      where: { id, workspaceId: session.user.workspaceId },
      data,
    });

    if (job.count === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const updated = await prisma.job.findUnique({
      where: { id },
      include: { customer: { select: { name: true, phone: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await prisma.job.deleteMany({
      where: { id, workspaceId: session.user.workspaceId },
    });

    if (job.count === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
