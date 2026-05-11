import { Eye, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { formatCurrency, formatDate, formatMt } from "../lib/format";
import { useApiList } from "../hooks/useApiResource";
import { api } from "../lib/api";
import type { PurchaseOrder } from "../types";
import { useAuth } from "../auth/AuthContext";

type ViewerTab = "ongoing" | "completed" | "all";

function isOngoing(po: PurchaseOrder) {
  return po.summary.pendingQuantity > 0 || po.status === "ACTIVE";
}

function isCompleted(po: PurchaseOrder) {
  return po.summary.pendingQuantity <= 0 || po.status === "COMPLETED";
}

export function ExistingPurchaseOrders() {
  const { data: loadedPurchaseOrders, loading, error, reload } = useApiList<PurchaseOrder>("/purchase-orders");
  const { isAdmin } = useAuth();
  const [viewerTab, setViewerTab] = useState<ViewerTab>("ongoing");
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [poToDelete, setPoToDelete] = useState<PurchaseOrder | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const purchaseOrders = loadedPurchaseOrders.filter((po) => !deletedIds.includes(po.id));

  const viewerCounts = useMemo(
    () => ({
      ongoing: purchaseOrders.filter(isOngoing).length,
      completed: purchaseOrders.filter(isCompleted).length,
      all: purchaseOrders.length
    }),
    [purchaseOrders]
  );

  const viewerPurchaseOrders = useMemo(() => {
    if (viewerTab === "ongoing") return purchaseOrders.filter(isOngoing);
    if (viewerTab === "completed") return purchaseOrders.filter(isCompleted);
    return purchaseOrders;
  }, [purchaseOrders, viewerTab]);

  const tabItems: Array<{ id: ViewerTab; label: string; count: number }> = [
    { id: "ongoing", label: "Ongoing POs", count: viewerCounts.ongoing },
    { id: "completed", label: "Completed POs", count: viewerCounts.completed },
    { id: "all", label: "All POs", count: viewerCounts.all }
  ];

  async function confirmDelete() {
    if (!poToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    setDeleteMessage(null);

    try {
      await api.remove(`/purchase-orders/${poToDelete.id}`);
      setDeletedIds((current) => [...current, poToDelete.id]);
      setPoToDelete(null);
      setDeleteMessage("PO deleted successfully");
      await reload();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Unable to delete PO.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Existing POs"
        description="Review customer coal purchase orders and dispatch progress."
        action={isAdmin ? (
          <Link className="btn-primary" to="/purchase-orders/create">
            <Plus size={17} />
            Create PO
          </Link>
        ) : null}
      />

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      {deleteMessage && <div className="mb-4"><Alert tone="success">{deleteMessage}</Alert></div>}
      {deleteError && <div className="mb-4"><Alert>{deleteError}</Alert></div>}

      {!loading && purchaseOrders.length === 0 ? (
        <EmptyState label="No purchase orders found." />
      ) : !isAdmin ? (
        <>
          <div className="-mx-3 mb-4 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition sm:h-10 ${
                  viewerTab === tab.id
                    ? "border-ember bg-orange-50 text-ember"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
                onClick={() => setViewerTab(tab.id)}
                type="button"
              >
                <span className="sm:hidden">
                  {tab.id === "ongoing" ? "Ongoing" : tab.id === "completed" ? "Completed" : "All"}
                </span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className={`rounded-md px-2 py-0.5 text-xs ${
                  viewerTab === tab.id ? "bg-white text-ember" : "bg-slate-100 text-slate-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {viewerPurchaseOrders.length === 0 ? (
            <EmptyState label="No purchase orders found for this tab." />
          ) : (
            <>
            <div className="space-y-3 md:hidden">
              {viewerPurchaseOrders.map((po) => (
                <article key={po.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold text-slate-950">{po.poNumber}</h2>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-700">{po.customer?.name ?? "-"}</p>
                    </div>
                    <StatusBadge status={po.status} />
                  </div>
                  <div className="mt-3 text-sm text-slate-600">
                    <p>Coal Size: <span className="font-semibold text-slate-900">{po.coalSize?.name ?? "-"}</span></p>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-md bg-slate-50 p-2">
                      <p className="text-xs font-semibold text-slate-500">Ordered</p>
                      <p className="mt-1 font-bold text-slate-950">{formatMt(po.totalQuantityMt)}</p>
                    </div>
                    <div className="rounded-md bg-slate-50 p-2">
                      <p className="text-xs font-semibold text-slate-500">Dispatched</p>
                      <p className="mt-1 font-bold text-slate-950">{formatMt(po.summary.dispatchedQuantity)}</p>
                    </div>
                    <div className="rounded-md bg-slate-50 p-2">
                      <p className="text-xs font-semibold text-slate-500">Pending</p>
                      <p className="mt-1 font-bold text-slate-950">{formatMt(po.summary.pendingQuantity)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">Date: <span className="font-semibold text-slate-900">{formatDate(po.poDate)}</span></p>
                    <Link className="btn-primary h-9 px-3" to={`/purchase-orders/${po.id}`}>
                      View Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <div className="table-card hidden md:block">
              <div className="table-scroll">
                <table className="w-full min-w-[760px] table-fixed text-left text-sm">
                  <colgroup>
                    <col className="w-[105px]" />
                    <col />
                    <col className="w-[130px]" />
                    <col className="w-[105px]" />
                    <col className="w-[125px]" />
                    <col className="w-[135px]" />
                    <col className="w-[125px]" />
                    <col className="w-[95px]" />
                  </colgroup>
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-3">PO No.</th>
                      <th className="px-3 py-3">Customer</th>
                      <th className="px-3 py-3">Coal Size</th>
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Ordered Qty</th>
                      <th className="px-3 py-3">Dispatched Qty</th>
                      <th className="px-3 py-3">Pending Qty</th>
                      <th className="px-3 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewerPurchaseOrders.map((po) => (
                      <tr key={po.id} className="align-top">
                        <td className="px-3 py-3 font-semibold text-slate-900">{po.poNumber}</td>
                        <td className="truncate px-3 py-3 text-slate-600" title={po.customer?.name ?? undefined}>{po.customer?.name ?? "-"}</td>
                        <td className="truncate px-3 py-3 text-slate-600" title={po.coalSize?.name ?? undefined}>{po.coalSize?.name ?? "-"}</td>
                        <td className="px-3 py-3 text-slate-600">{formatDate(po.poDate)}</td>
                        <td className="px-3 py-3 text-slate-600">{formatMt(po.totalQuantityMt)}</td>
                        <td className="px-3 py-3 text-slate-600">{formatMt(po.summary.dispatchedQuantity)}</td>
                        <td className="px-3 py-3 text-slate-600">{formatMt(po.summary.pendingQuantity)}</td>
                        <td className="px-3 py-3 text-right">
                          <Link className="btn-secondary h-9 px-3" to={`/purchase-orders/${po.id}`}>
                            <Eye size={16} />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </>
          )}
        </>
      ) : (
        <div className="table-card">
          <div className="table-scroll">
            <table className="w-full min-w-[1120px] table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[110px]" />
                <col className="w-[170px]" />
                <col className="w-[120px]" />
                <col className="w-[105px]" />
                <col className="w-[130px]" />
                <col className="w-[140px]" />
                <col className="w-[125px]" />
                <col className="w-[115px]" />
                <col className="w-[130px]" />
                <col className="w-[110px]" />
                <col className="w-[160px]" />
              </colgroup>
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3">PO No.</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Coal Size</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Ordered Qty</th>
                  <th className="px-3 py-3">Dispatched Qty</th>
                  <th className="px-3 py-3">Pending Qty</th>
                  <th className="px-3 py-3">Sale Rate</th>
                  <th className="px-3 py-3">Purchase Rate</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => {
                  const latestDispatch = po.dispatches[0];

                  return (
                    <tr key={po.id} className="align-top">
                      <td className="px-3 py-3 font-semibold text-slate-900">{po.poNumber}</td>
                      <td className="truncate px-3 py-3 text-slate-600" title={po.customer?.name ?? undefined}>{po.customer?.name ?? "-"}</td>
                      <td className="truncate px-3 py-3 text-slate-600" title={po.coalSize?.name ?? undefined}>{po.coalSize?.name ?? "-"}</td>
                      <td className="px-3 py-3 text-slate-600">{formatDate(po.poDate)}</td>
                      <td className="px-3 py-3 text-slate-600">{formatMt(po.totalQuantityMt)}</td>
                      <td className="px-3 py-3 text-slate-600">{formatMt(po.summary.dispatchedQuantity)}</td>
                      <td className="px-3 py-3 text-slate-600">{formatMt(po.summary.pendingQuantity)}</td>
                      <td className="px-3 py-3 text-slate-600">{formatCurrency(po.saleRate)}</td>
                      <td className="px-3 py-3 text-slate-600">{latestDispatch ? formatCurrency(latestDispatch.purchaseRate) : "-"}</td>
                      <td className="px-3 py-3"><StatusBadge status={po.status} /></td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Link className="btn-secondary h-9 px-3" to={`/purchase-orders/${po.id}`}>
                            <Eye size={16} />
                            View
                          </Link>
                          <button className="btn-secondary h-9 px-3 text-rose-600 hover:bg-rose-50" onClick={() => setPoToDelete(po)}>
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {poToDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-5 shadow-panel">
            <h2 className="text-lg font-bold text-slate-950">Delete Purchase Order?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This will permanently delete this PO and all dispatches linked to it. This action cannot be undone.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button className="btn-secondary" onClick={() => setPoToDelete(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn-primary bg-rose-600 hover:bg-rose-700" onClick={() => void confirmDelete()} disabled={deleting}>
                Delete PO
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
