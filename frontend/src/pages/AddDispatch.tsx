import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert } from "../components/Alert";
import { PageHeader } from "../components/PageHeader";
import { api, cleanPayload } from "../lib/api";
import { formatMt, toDateInput } from "../lib/format";
import { useApiList } from "../hooks/useApiResource";
import type { PurchaseOrder, RateInputMethod, Supplier, Transporter } from "../types";

const rateInputMethods: RateInputMethod[] = ["WITHOUT_GST", "WITH_GST_INCLUSIVE"];

const initialForm = {
  supplierId: "",
  transporterId: "",
  vehicleNumber: "",
  dispatchDate: toDateInput(undefined),
  netQuantityMt: "",
  purchaseRate: "",
  purchaseRateInputMethod: "WITHOUT_GST" as RateInputMethod,
  purchaseGstPercent: "18",
  saleRate: "",
  saleRateInputMethod: "WITHOUT_GST" as RateInputMethod,
  saleGstPercent: "18",
  transportCost: "0",
  otherExpensesPercent: "0.5",
  goodwillPerMt: "0",
  taxationBasePercent: "2",
  taxationRatePercent: "30.4",
  remarks: ""
};

export function AddDispatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: suppliers } = useApiList<Supplier>("/suppliers");
  const { data: transporters } = useApiList<Transporter>("/transporters");
  const { data: purchaseOrders } = useApiList<PurchaseOrder>("/purchase-orders");
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [selectedPoId, setSelectedPoId] = useState(id ?? "");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<PurchaseOrder>(`/purchase-orders/${id}`);
        setPurchaseOrder(response.data);
        setSelectedPoId(response.data.id);
        setForm((current) => ({
          ...current,
          saleRate: String(response.data.saleRate),
          saleRateInputMethod: response.data.saleRateInputMethod,
          saleGstPercent: String(response.data.saleGstPercent)
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load purchase order.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [id]);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const targetPoId = id ?? selectedPoId;
    if (!targetPoId) {
      setError("Select a purchase order before saving dispatch.");
      return;
    }

    setSaving(true);
    setError(null);
    setWarning(null);

    try {
      const payload = cleanPayload({
        ...form,
        netQuantityMt: Number(form.netQuantityMt),
        purchaseRate: Number(form.purchaseRate),
        purchaseRateInputMethod: form.purchaseRateInputMethod,
        purchaseGstPercent: Number(form.purchaseGstPercent),
        saleRate: Number(form.saleRate),
        saleRateInputMethod: form.saleRateInputMethod,
        saleGstPercent: Number(form.saleGstPercent),
        transportCost: Number(form.transportCost),
        otherExpensesPercent: Number(form.otherExpensesPercent),
        goodwillPerMt: Number(form.goodwillPerMt),
        taxationBasePercent: Number(form.taxationBasePercent),
        taxationRatePercent: Number(form.taxationRatePercent)
      });
      const response = await api.create<PurchaseOrder>(`/purchase-orders/${targetPoId}/dispatches`, payload);

      if (response.warning) {
        setWarning(response.warning);
        setPurchaseOrder(response.data);
      } else {
        navigate(`/purchase-orders/${targetPoId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save dispatch.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <PageHeader title="Add Dispatch" description="Loading purchase order." />;
  }

  return (
    <>
      <PageHeader
        title="Add Dispatch"
        description={purchaseOrder ? `PO ${purchaseOrder.poNumber} · Pending ${formatMt(purchaseOrder.summary.pendingQuantity)}` : undefined}
        action={
          selectedPoId && (
            <Link className="btn-secondary" to={`/purchase-orders/${selectedPoId}`}>
              <ArrowLeft size={17} />
              PO Details
            </Link>
          )
        }
      />

      <div className="max-w-3xl rounded-md border border-slate-200 bg-white p-4 shadow-panel">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!id && (
            <label className="block">
              <span className="label">Purchase Order</span>
              <select
                className="field mt-1"
                value={selectedPoId}
                onChange={(event) => {
                  const nextPoId = event.target.value;
                  const nextPo = purchaseOrders.find((po) => po.id === nextPoId) ?? null;
                  setSelectedPoId(nextPoId);
                  setPurchaseOrder(nextPo);
                  setForm((current) => ({
                    ...current,
                    saleRate: nextPo ? String(nextPo.saleRate) : "",
                    saleRateInputMethod: nextPo ? nextPo.saleRateInputMethod : "WITHOUT_GST",
                    saleGstPercent: nextPo ? String(nextPo.saleGstPercent) : "18"
                  }));
                }}
                required
              >
                <option value="">Select purchase order</option>
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber} - {po.customer?.name ?? "Customer"} - Pending {formatMt(po.summary.pendingQuantity)}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">Supplier</span>
              <select className="field mt-1" value={form.supplierId} onChange={(event) => updateField("supplierId", event.target.value)} required>
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Transporter</span>
              <select className="field mt-1" value={form.transporterId} onChange={(event) => updateField("transporterId", event.target.value)} required>
                <option value="">Select transporter</option>
                {transporters.map((transporter) => (
                  <option key={transporter.id} value={transporter.id}>{transporter.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Vehicle Number</span>
              <input className="field mt-1 uppercase" value={form.vehicleNumber} onChange={(event) => updateField("vehicleNumber", event.target.value.toUpperCase())} required />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">Dispatch Date</span>
              <input className="field mt-1" type="date" value={form.dispatchDate} onChange={(event) => updateField("dispatchDate", event.target.value)} />
            </label>
            <label className="block">
              <span className="label">Net Quantity MT</span>
              <input className="field mt-1" type="number" min="0" step="0.001" value={form.netQuantityMt} onChange={(event) => updateField("netQuantityMt", event.target.value)} required />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <label className="block">
              <span className="label">Purchase Rate</span>
              <input className="field mt-1" type="number" min="0" step="0.01" value={form.purchaseRate} onChange={(event) => updateField("purchaseRate", event.target.value)} required />
            </label>
            <label className="block">
              <span className="label">Purchase Rate Input Method</span>
              <select className="field mt-1" value={form.purchaseRateInputMethod} onChange={(event) => updateField("purchaseRateInputMethod", event.target.value)}>
                {rateInputMethods.map((method) => (
                  <option key={method} value={method}>{method.replace(/_/g, " ")}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Purchase GST Percent</span>
              <input className="field mt-1" type="number" min="0" max="100" step="0.01" value={form.purchaseGstPercent} onChange={(event) => updateField("purchaseGstPercent", event.target.value)} required />
            </label>
            <label className="block">
              <span className="label">Sale Rate</span>
              <input className="field mt-1" type="number" min="0" step="0.01" value={form.saleRate} onChange={(event) => updateField("saleRate", event.target.value)} required />
            </label>
            <label className="block">
              <span className="label">Sale Rate Input Method</span>
              <select className="field mt-1" value={form.saleRateInputMethod} onChange={(event) => updateField("saleRateInputMethod", event.target.value)}>
                {rateInputMethods.map((method) => (
                  <option key={method} value={method}>{method.replace(/_/g, " ")}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Sale GST Percent</span>
              <input className="field mt-1" type="number" min="0" max="100" step="0.01" value={form.saleGstPercent} onChange={(event) => updateField("saleGstPercent", event.target.value)} required />
            </label>
            <label className="block">
              <span className="label">Transport Cost Per MT</span>
              <input className="field mt-1" type="number" min="0" step="0.01" value={form.transportCost} onChange={(event) => updateField("transportCost", event.target.value)} />
            </label>
            <label className="block">
              <span className="label">Other Expenses Percent</span>
              <input className="field mt-1" type="number" min="0" max="100" step="0.01" value={form.otherExpensesPercent} onChange={(event) => updateField("otherExpensesPercent", event.target.value)} />
            </label>
            <label className="block">
              <span className="label">Goodwill Per MT</span>
              <input className="field mt-1" type="number" min="0" step="0.01" value={form.goodwillPerMt} onChange={(event) => updateField("goodwillPerMt", event.target.value)} />
            </label>
            <label className="block">
              <span className="label">Taxation Base Percent</span>
              <input className="field mt-1" type="number" min="0" max="100" step="0.01" value={form.taxationBasePercent} onChange={(event) => updateField("taxationBasePercent", event.target.value)} />
            </label>
            <label className="block">
              <span className="label">Taxation Rate Percent</span>
              <input className="field mt-1" type="number" min="0" max="100" step="0.01" value={form.taxationRatePercent} onChange={(event) => updateField("taxationRatePercent", event.target.value)} />
            </label>
          </div>

          <label className="block">
            <span className="label">Remarks</span>
            <textarea className="field-area mt-1" value={form.remarks} onChange={(event) => updateField("remarks", event.target.value)} />
          </label>

          {warning && <Alert tone="warning">{warning}</Alert>}
          {error && <Alert>{error}</Alert>}

          <button className="btn-primary" disabled={saving}>
            <Save size={17} />
            Save Dispatch
          </button>
        </form>
      </div>
    </>
  );
}
