import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { env } from "../config/env";
import { ApiError } from "./errorHandler";

type AuthTokenPayload = {
  sub: string;
  username: string;
  role: UserRole;
};

export function signAuthToken(payload: AuthTokenPayload) {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, "Authentication required."));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role
    };
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token."));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required."));
  }

  if (req.user.role !== UserRole.ADMIN) {
    return next(new ApiError(403, "Admin access required."));
  }

  return next();
}

export function requireAdminForMutations(req: Request, res: Response, next: NextFunction) {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return requireAdmin(req, res, next);
  }

  return next();
}
