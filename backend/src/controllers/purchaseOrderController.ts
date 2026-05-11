import type { Request, Response } from "express";
import {
  createDispatch,
  createPurchaseOrder,
  deleteDispatch,
  deletePurchaseOrder,
  getPurchaseOrder,
  listPurchaseOrders,
  updateDispatch,
  updatePurchaseOrder
} from "../services/purchaseOrderService";
import { idParamSchema } from "../validators/masterSchemas";
import {
  createDispatchSchema,
  createPurchaseOrderSchema,
  updateDispatchSchema,
  updatePurchaseOrderSchema
} from "../validators/purchaseOrderSchemas";

export async function listPurchaseOrdersHandler(_req: Request, res: Response) {
  res.json({ data: await listPurchaseOrders() });
}

export async function getPurchaseOrderHandler(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json({ data: await getPurchaseOrder(id) });
}

export async function createPurchaseOrderHandler(req: Request, res: Response) {
  const data = createPurchaseOrderSchema.parse(req.body);
  res.status(201).json({ data: await createPurchaseOrder(data) });
}

export async function updatePurchaseOrderHandler(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const data = updatePurchaseOrderSchema.parse(req.body);
  res.json({ data: await updatePurchaseOrder(id, data) });
}

export async function deletePurchaseOrderHandler(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await deletePurchaseOrder(id));
}

export async function createDispatchHandler(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const data = createDispatchSchema.parse(req.body);
  const result = await createDispatch(id, data);
  res.status(201).json({
    warning: result.warning,
    status: result.status,
    data: result.purchaseOrder
  });
}

export async function updateDispatchHandler(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const data = updateDispatchSchema.parse(req.body);
  res.json({ data: await updateDispatch(id, data) });
}

export async function deleteDispatchHandler(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json({ data: await deleteDispatch(id) });
}
