import { Router } from "express";
import {
  createDispatchHandler,
  createPurchaseOrderHandler,
  deletePurchaseOrderHandler,
  getPurchaseOrderHandler,
  listPurchaseOrdersHandler,
  updatePurchaseOrderHandler
} from "../controllers/purchaseOrderController";
import { asyncHandler } from "../utils/asyncHandler";

export const purchaseOrderRoutes = Router();

purchaseOrderRoutes.get("/", asyncHandler(listPurchaseOrdersHandler));
purchaseOrderRoutes.post("/", asyncHandler(createPurchaseOrderHandler));
purchaseOrderRoutes.get("/:id", asyncHandler(getPurchaseOrderHandler));
purchaseOrderRoutes.put("/:id", asyncHandler(updatePurchaseOrderHandler));
purchaseOrderRoutes.delete("/:id", asyncHandler(deletePurchaseOrderHandler));
purchaseOrderRoutes.post("/:id/dispatches", asyncHandler(createDispatchHandler));
