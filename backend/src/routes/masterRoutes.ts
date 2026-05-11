import { Router } from "express";
import { createMasterController } from "../controllers/masterController";
import { asyncHandler } from "../utils/asyncHandler";
import {
  coalSizeSchema,
  customerSchema,
  firmSchema,
  supplierSchema,
  transporterSchema
} from "../validators/masterSchemas";

function buildCrudRoutes(controller: ReturnType<typeof createMasterController>) {
  const router = Router();

  router.get("/", asyncHandler(controller.list));
  router.get("/:id", asyncHandler(controller.get));
  router.post("/", asyncHandler(controller.create));
  router.put("/:id", asyncHandler(controller.update));
  router.delete("/:id", asyncHandler(controller.remove));

  return router;
}

export const firmRoutes = buildCrudRoutes(createMasterController("firm", firmSchema));
export const customerRoutes = buildCrudRoutes(createMasterController("customer", customerSchema));
export const supplierRoutes = buildCrudRoutes(createMasterController("supplier", supplierSchema));
export const coalSizeRoutes = buildCrudRoutes(createMasterController("coalSize", coalSizeSchema));
export const transporterRoutes = buildCrudRoutes(createMasterController("transporter", transporterSchema));
