export type Status = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type UserRole = "ADMIN" | "VIEWER";
export type RateInputMethod = "WITHOUT_GST" | "WITH_GST_INCLUSIVE";

export type Summary = {
  dispatchedQuantity: number;
  pendingQuantity: number;
  saleAmount: number;
  purchaseAmount: number;
  transportAmount: number;
  grossProfit: number;
  profitPerMt: number;
  totalNetProfit: number;
  totalPoProfit: number;
  isOverDispatched: boolean;
  excessQuantity: number;
};

export type Firm = {
  id: string;
  name: string;
  gstNumber?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type Customer = {
  id: string;
  name: string;
  gstNumber?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

export type Supplier = Customer;

export type Transporter = {
  id: string;
  name: string;
  location?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  vehicleOwnerType?: string | null;
  remarks?: string | null;
};

export type CoalSize = {
  id: string;
  name: string;
  description?: string | null;
};

export type Dispatch = {
  id: string;
  purchaseOrderId: string;
  supplierId: string;
  supplier?: Supplier;
  transporterId?: string | null;
  transporter?: Transporter | null;
  vehicleNumber: string;
  dispatchDate: string;
  netQuantityMt: string | number;
  purchaseRate: string | number;
  purchaseRateInputMethod: RateInputMethod;
  purchaseGstPercent: string | number;
  saleRate: string | number;
  saleRateInputMethod: RateInputMethod;
  saleGstPercent: string | number;
  transportCost: string | number;
  otherExpensesPercent: string | number;
  goodwillPerMt: string | number;
  taxationBasePercent: string | number;
  taxationRatePercent: string | number;
  remarks?: string | null;
  summary?: {
    purchaseBaseRate: number;
    purchaseGstAmount: number;
    purchaseTotalWithGst: number;
    saleBaseRate: number;
    saleGstAmount: number;
    saleTotalWithGst: number;
    gstDifference: number;
    grossProfitPerMt: number;
    transportCostPerMt: number;
    otherExpensesPerMt: number;
    goodwillPerMt: number;
    profitBeforeTaxPerMt: number;
    taxationPerMt: number;
    netProfitPerMt: number;
    totalNetProfit: number;
    saleRateWithGst: number;
    purchaseRateWithGst: number;
    saleAmount: number;
    purchaseAmount: number;
    transportAmount: number;
    grossProfit: number;
    profitPerMt: number;
  };
};

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  poDate: string;
  firmId: string;
  firm?: Firm;
  customerId: string;
  customer?: Customer;
  coalSizeId: string;
  coalSize?: CoalSize;
  totalQuantityMt: string | number;
  saleRate: string | number;
  saleRateInputMethod: RateInputMethod;
  saleGstPercent: string | number;
  tcsApplicable: boolean;
  status: Status;
  remarks?: string | null;
  dispatches: Dispatch[];
  summary: Summary;
};

export type ApiList<T> = {
  data: T[];
};

export type ApiItem<T> = {
  data: T;
  warning?: string | null;
  status?: Status;
};

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
};
