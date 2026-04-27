import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminEmail = "admin@revenuedesk.com";
  const adminPassword = "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    // Create a workspace for the admin
    const workspace = await prisma.workspace.create({
      data: {
        name: "Revenue Desk",
        slug: "revenue-desk-admin",
      },
    });

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
        workspaceId: workspace.id,
      },
    });

    console.log(`Admin created:`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Role: ADMIN`);
  } else {
    console.log("Admin user already exists");
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });