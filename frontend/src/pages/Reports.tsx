import { PageHeader } from "../components/PageHeader";
import { useApiList } from "../hooks/useApiResource";
import { formatCurrency, formatMt, numberValue } from "../lib/format";
import type { PurchaseOrder } from "../types";

function ReportCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

export function Reports() {
  const { data: purchaseOrders } = useApiList<PurchaseOrder>("/purchase-orders");
  const totals = purchaseOrders.reduce(
    (sum, po) => ({
      ordered: sum.ordered + numberValue(po.totalQuantityMt),
      dispatched: sum.dispatched + po.summary.dispatchedQuantity,
      pending: sum.pending + po.summary.pendingQuantity,
      sales: sum.sales + po.summary.saleAmount,
      purchases: sum.purchases + po.summary.purchaseAmount,
      netProfit: sum.netProfit + po.summary.totalNetProfit
    }),
    { ordered: 0, dispatched: 0, pending: 0, sales: 0, purchases: 0, netProfit: 0 }
  );

  return (
    <>
      <PageHeader title="Reports" description="Read-only business totals." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ReportCard label="Ordered Quantity" value={formatMt(totals.ordered)} />
        <ReportCard label="Dispatched Quantity" value={formatMt(totals.dispatched)} />
        <ReportCard label="Pending Quantity" value={formatMt(totals.pending)} />
        <ReportCard label="Sales Value" value={formatCurrency(totals.sales)} />
        <ReportCard label="Purchase Value" value={formatCurrency(totals.purchases)} />
        <ReportCard label="Net Profit" value={formatCurrency(totals.netProfit)} />
      </div>
    </>
  );
}
