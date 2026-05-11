import { z } from "zod";
import { optionalText } from "./masterSchemas";

const decimalInput = z.coerce.number().finite();
const positiveDecimalInput = decimalInput.positive();
const nonNegativeDecimalInput = decimalInput.min(0);

export const purchaseOrderStatusSchema = z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]);
export const rateInputMethodSchema = z.enum(["WITHOUT_GST", "WITH_GST_INCLUSIVE"]);

export const createPurchaseOrderSchema = z.object({
  poNumber: z.string().trim().min(1),
  poDate: z.coerce.date().optional(),
  firmId: z.string().trim().min(1),
  customerId: z.string().trim().min(1),
  coalSizeId: z.string().trim().min(1),
  totalQuantityMt: positiveDecimalInput,
  saleRate: positiveDecimalInput,
  saleRateInputMethod: rateInputMethodSchema.default("WITHOUT_GST"),
  saleGstPercent: nonNegativeDecimalInput.max(100).default(18),
  tcsApplicable: z.coerce.boolean().default(false),
  status: purchaseOrderStatusSchema.optional(),
  remarks: optionalText
});

export const updatePurchaseOrderSchema = createPurchaseOrderSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  "At least one field is required."
);

export const createDispatchSchema = z.object({
  supplierId: z.string().trim().min(1),
  transporterId: z.string().trim().min(1),
  vehicleNumber: z.string().trim().min(1),
  dispatchDate: z.coerce.date().optional(),
  netQuantityMt: positiveDecimalInput,
  purchaseRate: positiveDecimalInput,
  purchaseRateInputMethod: rateInputMethodSchema.default("WITHOUT_GST"),
  purchaseGstPercent: nonNegativeDecimalInput.max(100).default(18),
  saleRate: positiveDecimalInput.optional(),
  saleRateInputMethod: rateInputMethodSchema.optional(),
  saleGstPercent: nonNegativeDecimalInput.max(100).optional(),
  transportCost: nonNegativeDecimalInput.default(0),
  otherExpensesPercent: nonNegativeDecimalInput.max(100).default(0.5),
  goodwillPerMt: nonNegativeDecimalInput.default(0),
  taxationBasePercent: nonNegativeDecimalInput.max(100).default(2),
  taxationRatePercent: nonNegativeDecimalInput.max(100).default(30.4),
  remarks: optionalText
});

export const updateDispatchSchema = createDispatchSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  "At least one field is required."
);
