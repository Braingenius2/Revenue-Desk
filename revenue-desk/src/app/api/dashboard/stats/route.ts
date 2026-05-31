import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = session.user.workspaceId;

    const [
      leadsCount, customersCount, newLeadsCount, wonLeadsCount,
      activeJobsCount, pendingJobsCount,
    ] = await Promise.all([
      prisma.lead.count({ where: { workspaceId } }),
      prisma.customer.count({ where: { workspaceId } }),
      prisma.lead.count({ where: { workspaceId, status: "NEW" } }),
      prisma.lead.count({ where: { workspaceId, status: "WON" } }),
      prisma.job.count({ where: { workspaceId, status: { in: ["PENDING", "IN_PROGRESS"] } } }),
      prisma.job.count({ where: { workspaceId, status: "PENDING" } }),
    ]);

    return NextResponse.json({
      leadsCount,
      customersCount,
      newLeadsCount,
      wonLeadsCount,
      activeJobsCount,
      pendingJobsCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}