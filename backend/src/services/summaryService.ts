import { Prisma, PurchaseOrderStatus, RateInputMethod } from "@prisma/client";
import { roundMoney, roundQuantity, toDecimal } from "../utils/money";

type DispatchForSummary = {
  id: string;
  netQuantityMt: Prisma.Decimal;
  purchaseRate: Prisma.Decimal;
  purchaseRateInputMethod: RateInputMethod;
  purchaseGstPercent: Prisma.Decimal;
  saleRate: Prisma.Decimal;
  saleRateInputMethod: RateInputMethod;
  saleGstPercent: Prisma.Decimal;
  transportCost: Prisma.Decimal;
  otherExpensesPercent: Prisma.Decimal;
  goodwillPerMt: Prisma.Decimal;
  taxationBasePercent: Prisma.Decimal;
  taxationRatePercent: Prisma.Decimal;
};

type PurchaseOrderForSummary = {
  totalQuantityMt: Prisma.Decimal;
  dispatches: DispatchForSummary[];
};

function splitRateByInputMethod(
  rate: Prisma.Decimal,
  gstPercent: Prisma.Decimal,
  inputMethod: RateInputMethod
) {
  const decimalRate = toDecimal(rate);
  const decimalGstPercent = toDecimal(gstPercent);
  const divisor = toDecimal(1).plus(decimalGstPercent.div(100));
  const baseRate =
    inputMethod === RateInputMethod.WITH_GST_INCLUSIVE
      ? decimalRate.div(divisor)
      : decimalRate;
  const gstAmount = baseRate.mul(decimalGstPercent).div(100);
  const totalWithGst = baseRate.plus(gstAmount);

  return {
    baseRate,
    gstAmount,
    totalWithGst
  };
}

export function calculateDispatchSummary(dispatch: DispatchForSummary) {
  const netQuantity = toDecimal(dispatch.netQuantityMt);
  const purchase = splitRateByInputMethod(
    toDecimal(dispatch.purchaseRate),
    toDecimal(dispatch.purchaseGstPercent),
    dispatch.purchaseRateInputMethod
  );
  const sale = splitRateByInputMethod(
    toDecimal(dispatch.saleRate),
    toDecimal(dispatch.saleGstPercent),
    dispatch.saleRateInputMethod
  );
  const transportCostPerMt = toDecimal(dispatch.transportCost);
  const otherExpensesPerMt = sale.baseRate.mul(dispatch.otherExpensesPercent).div(100);
  const goodwillPerMt = toDecimal(dispatch.goodwillPerMt);
  const grossProfitPerMt = sale.baseRate.minus(purchase.baseRate);
  const profitBeforeTaxPerMt = grossProfitPerMt
    .minus(transportCostPerMt)
    .minus(otherExpensesPerMt)
    .minus(goodwillPerMt);
  const taxationPerMt = sale.baseRate
    .mul(dispatch.taxationBasePercent)
    .div(100)
    .mul(dispatch.taxationRatePercent)
    .div(100);
  const netProfitPerMt = profitBeforeTaxPerMt.minus(taxationPerMt);
  const totalNetProfit = netProfitPerMt.mul(netQuantity);
  const saleAmount = netQuantity.mul(sale.totalWithGst);
  const purchaseAmount = netQuantity.mul(purchase.totalWithGst);
  const transportAmount = netQuantity.mul(transportCostPerMt);
  const grossProfit = grossProfitPerMt.mul(netQuantity);
  const gstDifference = sale.gstAmount.minus(purchase.gstAmount);

  return {
    purchaseBaseRate: roundMoney(purchase.baseRate),
    purchaseGstAmount: roundMoney(purchase.gstAmount),
    purchaseTotalWithGst: roundMoney(purchase.totalWithGst),
    saleBaseRate: roundMoney(sale.baseRate),
    saleGstAmount: roundMoney(sale.gstAmount),
    saleTotalWithGst: roundMoney(sale.totalWithGst),
    gstDifference: roundMoney(gstDifference),
    grossProfitPerMt: roundMoney(grossProfitPerMt),
    transportCostPerMt: roundMoney(transportCostPerMt),
    otherExpensesPerMt: roundMoney(otherExpensesPerMt),
    goodwillPerMt: roundMoney(goodwillPerMt),
    profitBeforeTaxPerMt: roundMoney(profitBeforeTaxPerMt),
    taxationPerMt: roundMoney(taxationPerMt),
    netProfitPerMt: roundMoney(netProfitPerMt),
    totalNetProfit: roundMoney(totalNetProfit),
    saleRateWithGst: roundMoney(sale.totalWithGst),
    purchaseRateWithGst: roundMoney(purchase.totalWithGst),
    saleAmount: roundMoney(saleAmount),
    purchaseAmount: roundMoney(purchaseAmount),
    transportAmount: roundMoney(transportAmount),
    grossProfit: roundMoney(grossProfit),
    profitPerMt: roundMoney(netProfitPerMt)
  };
}

export function calculatePurchaseOrderSummary(purchaseOrder: PurchaseOrderForSummary) {
  const totalQuantity = toDecimal(purchaseOrder.totalQuantityMt);
  const dispatchedQuantity = purchaseOrder.dispatches.reduce(
    (sum, dispatch) => sum.plus(dispatch.netQuantityMt),
    toDecimal(0)
  );
  const pendingQuantity = Prisma.Decimal.max(totalQuantity.minus(dispatchedQuantity), toDecimal(0));

  const totals = purchaseOrder.dispatches.reduce(
    (sum, dispatch) => {
      const dispatchSummary = calculateDispatchSummary(dispatch);

      return {
        saleAmount: sum.saleAmount.plus(dispatchSummary.saleAmount),
        purchaseAmount: sum.purchaseAmount.plus(dispatchSummary.purchaseAmount),
        transportAmount: sum.transportAmount.plus(dispatchSummary.transportAmount),
        grossProfit: sum.grossProfit.plus(dispatchSummary.grossProfit),
        totalNetProfit: sum.totalNetProfit.plus(dispatchSummary.totalNetProfit)
      };
    },
    {
      saleAmount: toDecimal(0),
      purchaseAmount: toDecimal(0),
      transportAmount: toDecimal(0),
      grossProfit: toDecimal(0),
      totalNetProfit: toDecimal(0)
    }
  );

  const profitPerMt = dispatchedQuantity.gt(0) ? totals.totalNetProfit.div(dispatchedQuantity) : toDecimal(0);
  const excessQuantity = Prisma.Decimal.max(dispatchedQuantity.minus(totalQuantity), toDecimal(0));

  return {
    dispatchedQuantity: roundQuantity(dispatchedQuantity),
    pendingQuantity: roundQuantity(pendingQuantity),
    saleAmount: roundMoney(totals.saleAmount),
    purchaseAmount: roundMoney(totals.purchaseAmount),
    transportAmount: roundMoney(totals.transportAmount),
    grossProfit: roundMoney(totals.grossProfit),
    profitPerMt: roundMoney(profitPerMt),
    totalNetProfit: roundMoney(totals.totalNetProfit),
    totalPoProfit: roundMoney(totals.totalNetProfit),
    isOverDispatched: dispatchedQuantity.gt(totalQuantity),
    excessQuantity: roundQuantity(excessQuantity)
  };
}

export function getStatusForDispatchedQuantity(
  currentStatus: PurchaseOrderStatus,
  totalQuantityMt: Prisma.Decimal,
  dispatchedQuantityMt: Prisma.Decimal
) {
  if (currentStatus === PurchaseOrderStatus.CANCELLED) {
    return currentStatus;
  }

  return dispatchedQuantityMt.greaterThanOrEqualTo(totalQuantityMt)
    ? PurchaseOrderStatus.COMPLETED
    : PurchaseOrderStatus.ACTIVE;
}
