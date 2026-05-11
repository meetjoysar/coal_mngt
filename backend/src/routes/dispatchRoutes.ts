import { Router } from "express";
import { deleteDispatchHandler, updateDispatchHandler } from "../controllers/purchaseOrderController";
import { asyncHandler } from "../utils/asyncHandler";

export const dispatchRoutes = Router();

dispatchRoutes.put("/:id", asyncHandler(updateDispatchHandler));
dispatchRoutes.delete("/:id", asyncHandler(deleteDispatchHandler));
