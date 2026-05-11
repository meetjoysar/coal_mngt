import {
  BadgeIndianRupee,
  ChartNoAxesCombined,
  ClipboardList,
  PackageCheck,
  PackageMinus,
  PackagePlus,
  Timer,
  WalletCards
} from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { formatCurrency, formatDate, formatMt, numberValue } from "../lib/format";
import { useApiList } from "../hooks/useApiResource";
import type { PurchaseOrder } from "../types";

function StatCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string | number;
  icon: typeof ClipboardList;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <div className="grid size-9 place-items-center rounded-md bg-slate-100 text-slate-600">
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function RecentPoCard({ po }: { po: PurchaseOrder }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-slate-950">{po.poNumber}</h3>
          <p className="mt-1 truncate text-sm text-slate-600">{po.customer?.name ?? "-"}</p>
        </div>
        <StatusBadge status={po.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md bg-slate-50 p-2">
          <p className="text-xs font-semibold text-slate-500">Ordered</p>
          <p className="mt-1 font-bold text-slate-950">{formatMt(po.totalQuantityMt)}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <p className="text-xs font-semibold text-slate-500">Pending</p>
          <p className="mt-1 font-bold text-slate-950">{formatMt(po.summary.pendingQuantity)}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-600">Date: <span className="font-semibold text-slate-900">{formatDate(po.poDate)}</span></p>
    </article>
  );
}

export function Dashboard() {
  const { data: purchaseOrders, loading, error } = useApiList<PurchaseOrder>("/purchase-orders");

  const totals = purchaseOrders.reduce(
    (sum, po) => ({
      totalOrderedQuantity: sum.totalOrderedQuantity + numberValue(po.totalQuantityMt),
      dispatchedQuantity: sum.dispatchedQuantity + po.summary.dispatchedQuantity,
      pendingQuantity: sum.pendingQuantity + po.summary.pendingQuantity,
      saleAmount: sum.saleAmount + po.summary.saleAmount,
      purchaseAmount: sum.purchaseAmount + po.summary.purchaseAmount,
      totalNetProfit: sum.totalNetProfit + po.summary.totalNetProfit
    }),
    {
      totalOrderedQuantity: 0,
      dispatchedQuantity: 0,
      pendingQuantity: 0,
      saleAmount: 0,
      purchaseAmount: 0,
      totalNetProfit: 0
    }
  );

  const activeCount = purchaseOrders.filter((po) => po.status === "ACTIVE").length;
  const recentOrders = purchaseOrders.slice(0, 6);

  return (
    <>
      <PageHeader title="Dashboard" description="Operational snapshot for coal purchase orders." />

      {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total POs" value={loading ? "-" : purchaseOrders.length} icon={ClipboardList} />
        <StatCard label="Active POs" value={loading ? "-" : activeCount} icon={Timer} />
        <StatCard label="Total Ordered Quantity" value={loading ? "-" : formatMt(totals.totalOrderedQuantity)} icon={PackagePlus} />
        <StatCard label="Dispatched Quantity" value={loading ? "-" : formatMt(totals.dispatchedQuantity)} icon={PackageCheck} />
        <StatCard label="Pending Quantity" value={loading ? "-" : formatMt(totals.pendingQuantity)} icon={PackageMinus} />
        <StatCard label="Total Sales Value" value={loading ? "-" : formatCurrency(totals.saleAmount)} icon={BadgeIndianRupee} />
        <StatCard label="Total Purchase Value" value={loading ? "-" : formatCurrency(totals.purchaseAmount)} icon={WalletCards} />
        <StatCard label="Total Net Profit" value={loading ? "-" : formatCurrency(totals.totalNetProfit)} icon={ChartNoAxesCombined} />
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Recent Purchase Orders</h2>
        </div>
        {recentOrders.length === 0 && !loading ? (
          <EmptyState label="No purchase orders found." />
        ) : (
          <>
          <div className="space-y-3 md:hidden">
            {recentOrders.map((po) => (
              <RecentPoCard key={po.id} po={po} />
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-md border border-slate-200 bg-white shadow-panel md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">PO No.</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Ordered</th>
                    <th className="px-4 py-3">Pending</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((po) => (
                    <tr key={po.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{po.poNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{po.customer?.name ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(po.poDate)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatMt(po.totalQuantityMt)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatMt(po.summary.pendingQuantity)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={po.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}
      </section>
    </>
  );
}
