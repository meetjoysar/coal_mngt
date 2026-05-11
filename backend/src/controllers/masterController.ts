import type { Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { idParamSchema } from "../validators/masterSchemas";

type ModelName = "firm" | "customer" | "supplier" | "coalSize" | "transporter";
type Delegate = PrismaClient[ModelName];

function getDelegate(model: ModelName) {
  return prisma[model] as Delegate & {
    findMany: (args?: unknown) => Promise<unknown>;
    findUnique: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
    delete: (args: unknown) => Promise<unknown>;
  };
}

export function createMasterController(model: ModelName, schema: { parse: (payload: unknown) => unknown }) {
  const delegate = getDelegate(model);

  return {
    async list(_req: Request, res: Response) {
      const records = await delegate.findMany({ orderBy: { createdAt: "desc" } });
      res.json({ data: records });
    },

    async get(req: Request, res: Response) {
      const { id } = idParamSchema.parse(req.params);
      const record = await delegate.findUnique({ where: { id } });

      if (!record) {
        return res.status(404).json({ message: "Record not found." });
      }

      return res.json({ data: record });
    },

    async create(req: Request, res: Response) {
      const data = schema.parse(req.body);
      const record = await delegate.create({ data });
      res.status(201).json({ data: record });
    },

    async update(req: Request, res: Response) {
      const { id } = idParamSchema.parse(req.params);
      const data = schema.parse(req.body);
      const record = await delegate.update({ where: { id }, data });
      res.json({ data: record });
    },

    async remove(req: Request, res: Response) {
      const { id } = idParamSchema.parse(req.params);
      await delegate.delete({ where: { id } });
      res.status(204).send();
    }
  };
}
