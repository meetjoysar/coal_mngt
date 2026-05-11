import { ArrowLeft, Plus, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../lib/api";
import { formatCurrency, formatDate, formatMt, formatNumber } from "../lib/format";
import type { PurchaseOrder } from "../types";
import { useAuth } from "../auth/AuthContext";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function MobileInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-slate-100 py-2 first:border-t-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export function PurchaseOrderDetails() {
  const { id } = useParams();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<PurchaseOrder>(`/purchase-orders/${id}`);
        setPurchaseOrder(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load purchase order.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [id]);

  if (loading) {
    return <PageHeader title="Purchase Order Details" description="Loading purchase order." />;
  }

  if (error || !purchaseOrder) {
    return (
      <>
        <PageHeader title="Purchase Order Details" />
        <Alert>{error ?? "Purchase order not found."}</Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`PO ${purchaseOrder.poNumber}`}
        description={`${purchaseOrder.customer?.name ?? "Customer"} · ${purchaseOrder.coalSize?.name ?? "Coal size"}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link className="btn-secondary" to="/purchase-orders">
              <ArrowLeft size={17} />
              Back
            </Link>
            {isAdmin && <Link className="btn-primary" to={`/purchase-orders/${purchaseOrder.id}/dispatches/new`}>
              <Plus size={17} />
              Add Dispatch
            </Link>}
          </div>
        }
      />

      {purchaseOrder.summary.isOverDispatched && (
        <div className="mb-4">
          <Alert tone="warning">Dispatched quantity exceeds PO quantity by {formatMt(purchaseOrder.summary.excessQuantity)}.</Alert>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Ordered Quantity" value={formatMt(purchaseOrder.totalQuantityMt)} />
        <Metric label="Dispatched Quantity" value={formatMt(purchaseOrder.summary.dispatchedQuantity)} />
        <Metric label="Pending Quantity" value={formatMt(purchaseOrder.summary.pendingQuantity)} />
        <Metric label="Total Net Profit" value={formatCurrency(purchaseOrder.summary.totalNetProfit)} />
        <Metric label="Sales Value" value={formatCurrency(purchaseOrder.summary.saleAmount)} />
        <Metric label="Purchase Value" value={formatCurrency(purchaseOrder.summary.purchaseAmount)} />
        <Metric label="Transport Amount" value={formatCurrency(purchaseOrder.summary.transportAmount)} />
        <Metric label="Net Profit Per MT" value={formatCurrency(purchaseOrder.summary.profitPerMt)} />
      </div>

      <section className="mb-6 rounded-md border border-slate-200 bg-white p-4 shadow-panel">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="label">Status</p>
            <div className="mt-2"><StatusBadge status={purchaseOrder.status} /></div>
          </div>
          <div>
            <p className="label">PO Date</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(purchaseOrder.poDate)}</p>
          </div>
          <div>
            <p className="label">Sale Rate</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(purchaseOrder.saleRate)}</p>
          </div>
          <div>
            <p className="label">Sale Input Method</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{purchaseOrder.saleRateInputMethod.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="label">Sale GST Percent</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{formatNumber(purchaseOrder.saleGstPercent)}%</p>
          </div>
          <div>
            <p className="label">Firm</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{purchaseOrder.firm?.name ?? "-"}</p>
          </div>
          <div>
            <p className="label">TCS</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{purchaseOrder.tcsApplicable ? "Applicable" : "Not applicable"}</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Truck size={19} className="text-slate-500" />
          <h2 className="text-lg font-bold text-slate-950">Dispatches</h2>
        </div>

        {purchaseOrder.dispatches.length === 0 ? (
          <EmptyState label="No dispatches found." />
        ) : (
          <>
          <div className="space-y-3 md:hidden">
            {purchaseOrder.dispatches.map((dispatch) => (
              <article key={dispatch.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-950">{dispatch.vehicleNumber}</h3>
                    <p className="mt-1 text-sm text-slate-500">{formatDate(dispatch.dispatchDate)}</p>
                  </div>
                  <div className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                    {formatMt(dispatch.netQuantityMt)}
                  </div>
                </div>
                <div className="mt-4">
                  <MobileInfoRow label="Supplier" value={dispatch.supplier?.name ?? "-"} />
                  <MobileInfoRow label="Transporter" value={dispatch.transporter?.name ?? "-"} />
                  <MobileInfoRow label="Purchase Rate" value={formatCurrency(dispatch.purchaseRate)} />
                  <MobileInfoRow label="Sale Rate" value={formatCurrency(dispatch.saleRate)} />
                  <MobileInfoRow label="Transport Cost/MT" value={formatCurrency(dispatch.transportCost)} />
                  <MobileInfoRow label="Net Profit/MT" value={formatCurrency(dispatch.summary?.netProfitPerMt)} />
                  <MobileInfoRow label="Total Net Profit" value={formatCurrency(dispatch.summary?.totalNetProfit)} />
                </div>
              </article>
            ))}
          </div>
          <div className="table-card hidden md:block">
            <div className="table-scroll">
              <table className="w-full min-w-[2100px] table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-[120px]" />
                  <col className="w-[110px]" />
                  <col className="w-[160px]" />
                  <col className="w-[160px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  <col className="w-[135px]" />
                  <col className="w-[120px]" />
                  <col className="w-[135px]" />
                  <col className="w-[120px]" />
                  <col className="w-[135px]" />
                  <col className="w-[120px]" />
                </colgroup>
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Transporter</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Purchase Base Rate</th>
                    <th className="px-4 py-3">Purchase GST</th>
                    <th className="px-4 py-3">Purchase With GST</th>
                    <th className="px-4 py-3">Sale Base Rate</th>
                    <th className="px-4 py-3">Sale GST</th>
                    <th className="px-4 py-3">Sale With GST</th>
                    <th className="px-4 py-3">GST Difference</th>
                    <th className="px-4 py-3">Gross Profit / MT</th>
                    <th className="px-4 py-3">Transport / MT</th>
                    <th className="px-4 py-3">Other Expenses / MT</th>
                    <th className="px-4 py-3">Goodwill / MT</th>
                    <th className="px-4 py-3">Profit Before Tax / MT</th>
                    <th className="px-4 py-3">Taxation / MT</th>
                    <th className="px-4 py-3">Net Profit / MT</th>
                    <th className="px-4 py-3">Total Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseOrder.dispatches.map((dispatch) => (
                    <tr key={dispatch.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{dispatch.vehicleNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(dispatch.dispatchDate)}</td>
                      <td className="px-4 py-3 text-slate-600">{dispatch.supplier?.name ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{dispatch.transporter?.name ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{formatMt(dispatch.netQuantityMt)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.summary?.purchaseBaseRate)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.summary?.purchaseGstAmount)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.summary?.purchaseTotalWithGst)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.summary?.saleBaseRate)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.summary?.saleGstAmount)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.summary?.saleTotalWithGst)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.summary?.gstDifference)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.summary?.grossProfitPerMt)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.summary?.transportCostPerMt)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.summary?.otherExpensesPerMt)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.summary?.goodwillPerMt)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.summary?.profitBeforeTaxPerMt)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.summary?.taxationPerMt)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(dispatch.summary?.netProfitPerMt)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(dispatch.summary?.totalNetProfit)}</td>
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
