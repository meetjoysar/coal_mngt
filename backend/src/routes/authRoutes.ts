import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ApiError } from "../middleware/errorHandler";
import { requireAuth, signAuthToken } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1)
});

function serializeUser(user: { id: string; name: string; username: string; role: string }) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role
  };
}

export const authRoutes = Router();

authRoutes.post(
  "/login",
  asyncHandler(async (req, res) => {
    const credentials = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { username: credentials.username }
    });

    if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
      throw new ApiError(401, "Invalid username or password.");
    }

    const token = signAuthToken({
      sub: user.id,
      username: user.username,
      role: user.role
    });

    res.json({
      token,
      user: serializeUser(user)
    });
  })
);

authRoutes.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id }
    });

    res.json({ data: serializeUser(user) });
  })
);
