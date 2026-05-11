import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { useApiList } from "../hooks/useApiResource";
import { formatCurrency, formatDate, formatMt } from "../lib/format";
import type { PurchaseOrder } from "../types";

export function Dispatches() {
  const { data: purchaseOrders, loading } = useApiList<PurchaseOrder>("/purchase-orders");
  const dispatches = purchaseOrders.flatMap((po) =>
    po.dispatches.map((dispatch) => ({
      ...dispatch,
      poNumber: po.poNumber,
      customerName: po.customer?.name ?? "-"
    }))
  );

  return (
    <>
      <PageHeader title="Dispatches" description="Read-only dispatch register." />

      {!loading && dispatches.length === 0 ? (
        <EmptyState label="No dispatches found." />
      ) : (
        <>
        <div className="space-y-3 md:hidden">
          {dispatches.map((dispatch) => (
            <article key={dispatch.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-slate-950">{dispatch.vehicleNumber}</h2>
                  <p className="mt-1 text-sm text-slate-500">{dispatch.poNumber} · {formatDate(dispatch.dispatchDate)}</p>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                  {formatMt(dispatch.netQuantityMt)}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Customer</span>
                  <span className="text-right font-semibold text-slate-900">{dispatch.customerName}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Supplier</span>
                  <span className="text-right font-semibold text-slate-900">{dispatch.supplier?.name ?? "-"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Transporter</span>
                  <span className="text-right font-semibold text-slate-900">{dispatch.transporter?.name ?? "-"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Purchase Rate</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(dispatch.purchaseRate)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Sale Rate</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(dispatch.saleRate)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Transport / MT</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(dispatch.transportCost)}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-slate-100 pt-2">
                  <span className="text-slate-500">Net Profit</span>
                  <span className="font-bold text-slate-950">{formatCurrency(dispatch.summary?.totalNetProfit)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="table-card hidden md:block">
          <div className="table-scroll">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">PO No.</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Transporter</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Purchase Rate</th>
                  <th className="px-4 py-3">Sale Rate</th>
                  <th className="px-4 py-3">Transport / MT</th>
                  <th className="px-4 py-3">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dispatches.map((dispatch) => (
                  <tr key={dispatch.id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{dispatch.poNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{dispatch.customerName}</td>
                    <td className="px-4 py-3 text-slate-600">{dispatch.vehicleNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(dispatch.dispatchDate)}</td>
                    <td className="px-4 py-3 text-slate-600">{dispatch.supplier?.name ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{dispatch.transporter?.name ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{formatMt(dispatch.netQuantityMt)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.purchaseRate)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.saleRate)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.transportCost)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(dispatch.summary?.totalNetProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}
    </>
  );
}
