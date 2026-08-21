import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { hashPassword } from "../utils/password.js";

export const ensureSuperAdmin = async () => {
  const email = env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD not set — skipping Super Admin bootstrap",
    );
    return;
  }

  if (password.length < 8) {
    console.warn("SUPER_ADMIN_PASSWORD must be at least 8 characters — skipping bootstrap");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== "SUPER_ADMIN" || existing.tenantId !== null) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: "SUPER_ADMIN", tenantId: null },
      });
      if (env.NODE_ENV !== "test") {
        console.log(`Promoted ${email} to SUPER_ADMIN`);
      }
    }
    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      name: env.SUPER_ADMIN_NAME?.trim() || "Super Admin",
      role: "SUPER_ADMIN",
    },
  });

  if (env.NODE_ENV !== "test") {
    console.log(`Created Super Admin ${email}`);
  }
};
