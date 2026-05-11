import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertUser(name: string, username: string, password: string, role: UserRole) {
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { username },
    create: {
      name,
      username,
      passwordHash,
      role
    },
    update: {
      name,
      passwordHash,
      role
    }
  });
}

async function main() {
  await upsertUser("Admin", "admin", "admin123", UserRole.ADMIN);
  await upsertUser("Viewer", "viewer", "view123", UserRole.VIEWER);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
