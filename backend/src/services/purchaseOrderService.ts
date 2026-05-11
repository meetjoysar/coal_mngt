import { Prisma, RateInputMethod } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../middleware/errorHandler";
import {
  calculateDispatchSummary,
  calculatePurchaseOrderSummary,
  getStatusForDispatchedQuantity
} from "./summaryService";
import { toDecimal } from "../utils/money";

const purchaseOrderInclude = {
  firm: true,
  customer: true,
  coalSize: true,
  dispatches: {
    include: {
      supplier: true,
      transporter: true
    },
    orderBy: {
      dispatchDate: "desc" as const
    }
  }
};

type PurchaseOrderWithRelations = Prisma.PurchaseOrderGetPayload<{
  include: typeof purchaseOrderInclude;
}>;

type CreateDispatchData = Omit<
  Prisma.DispatchUncheckedCreateInput,
  "purchaseOrderId" | "saleRate" | "saleRateInputMethod" | "saleGstPercent"
> & {
  saleRate?: Prisma.Decimal | number | string;
  saleRateInputMethod?: RateInputMethod;
  saleGstPercent?: Prisma.Decimal | number | string;
};

function decoratePurchaseOrder(purchaseOrder: PurchaseOrderWithRelations) {
  return {
    ...purchaseOrder,
    dispatches: purchaseOrder.dispatches.map((dispatch) => ({
      ...dispatch,
      summary: calculateDispatchSummary(dispatch)
    })),
    summary: calculatePurchaseOrderSummary(purchaseOrder)
  };
}

async function getPurchaseOrderOrThrow(id: string) {
  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: purchaseOrderInclude
  });

  if (!purchaseOrder) {
    throw new ApiError(404, "Purchase order not found.");
  }

  return purchaseOrder;
}

async function refreshPurchaseOrderStatus(purchaseOrderId: string, tx: Prisma.TransactionClient = prisma) {
  const purchaseOrder = await tx.purchaseOrder.findUnique({
    where: { id: purchaseOrderId },
    include: {
      dispatches: {
        select: {
          netQuantityMt: true
        }
      }
    }
  });

  if (!purchaseOrder) {
    throw new ApiError(404, "Purchase order not found.");
  }

  const dispatchedQuantity = purchaseOrder.dispatches.reduce(
    (sum, dispatch) => sum.plus(dispatch.netQuantityMt),
    toDecimal(0)
  );
  const nextStatus = getStatusForDispatchedQuantity(
    purchaseOrder.status,
    purchaseOrder.totalQuantityMt,
    dispatchedQuantity
  );

  if (nextStatus !== purchaseOrder.status) {
    await tx.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: nextStatus }
    });
  }

  return {
    dispatchedQuantity,
    nextStatus
  };
}

export async function listPurchaseOrders() {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    include: purchaseOrderInclude,
    orderBy: {
      poDate: "desc"
    }
  });

  return purchaseOrders.map(decoratePurchaseOrder);
}

export async function getPurchaseOrder(id: string) {
  return decoratePurchaseOrder(await getPurchaseOrderOrThrow(id));
}

export async function createPurchaseOrder(data: Prisma.PurchaseOrderUncheckedCreateInput) {
  const purchaseOrder = await prisma.purchaseOrder.create({
    data,
    include: purchaseOrderInclude
  });

  return decoratePurchaseOrder(purchaseOrder);
}

export async function updatePurchaseOrder(
  id: string,
  data: Prisma.PurchaseOrderUncheckedUpdateInput
) {
  await prisma.purchaseOrder.update({
    where: { id },
    data
  });

  await refreshPurchaseOrderStatus(id);
  return getPurchaseOrder(id);
}

export async function deletePurchaseOrder(id: string) {
  await getPurchaseOrderOrThrow(id);

  await prisma.purchaseOrder.delete({
    where: { id }
  });

  return { message: "PO deleted successfully" };
}

export async function createDispatch(
  purchaseOrderId: string,
  data: CreateDispatchData
) {
  const result = await prisma.$transaction(async (tx) => {
    const purchaseOrder = await tx.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        dispatches: {
          select: {
            netQuantityMt: true
          }
        }
      }
    });

    if (!purchaseOrder) {
      throw new ApiError(404, "Purchase order not found.");
    }

    const dispatchedBefore = purchaseOrder.dispatches.reduce(
      (sum, dispatch) => sum.plus(dispatch.netQuantityMt),
      toDecimal(0)
    );
    const remainingBefore = purchaseOrder.totalQuantityMt.minus(dispatchedBefore);
    const requestedQuantity = toDecimal(data.netQuantityMt as Prisma.Decimal | number | string);
    const dispatchedAfter = dispatchedBefore.plus(requestedQuantity);
    const warning = dispatchedAfter.gt(purchaseOrder.totalQuantityMt)
      ? `Dispatch quantity exceeds remaining PO quantity by ${dispatchedAfter.minus(purchaseOrder.totalQuantityMt).toDecimalPlaces(3).toString()} MT.`
      : null;

    await tx.dispatch.create({
      data: {
        ...data,
        saleRate: data.saleRate ?? purchaseOrder.saleRate,
        saleRateInputMethod: data.saleRateInputMethod ?? purchaseOrder.saleRateInputMethod,
        saleGstPercent: data.saleGstPercent ?? purchaseOrder.saleGstPercent,
        purchaseOrderId
      }
    });

    const { nextStatus } = await refreshPurchaseOrderStatus(purchaseOrderId, tx);

    return {
      warning,
      status: nextStatus
    };
  });

  return {
    warning: result.warning,
    status: result.status,
    purchaseOrder: await getPurchaseOrder(purchaseOrderId)
  };
}

export async function updateDispatch(id: string, data: Prisma.DispatchUncheckedUpdateInput) {
  const existing = await prisma.dispatch.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(404, "Dispatch not found.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.dispatch.update({
      where: { id },
      data
    });

    await refreshPurchaseOrderStatus(existing.purchaseOrderId, tx);
  });

  return getPurchaseOrder(existing.purchaseOrderId);
}

export async function deleteDispatch(id: string) {
  const existing = await prisma.dispatch.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(404, "Dispatch not found.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.dispatch.delete({
      where: { id }
    });

    await refreshPurchaseOrderStatus(existing.purchaseOrderId, tx);
  });

  return getPurchaseOrder(existing.purchaseOrderId);
}
