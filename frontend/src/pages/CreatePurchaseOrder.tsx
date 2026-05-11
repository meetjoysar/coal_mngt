import { Factory, Save } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { PageHeader } from "../components/PageHeader";
import { api, cleanPayload } from "../lib/api";
import { toDateInput } from "../lib/format";
import { useApiList } from "../hooks/useApiResource";
import type { CoalSize, Customer, Firm, PurchaseOrder, RateInputMethod } from "../types";

const rateInputMethods: RateInputMethod[] = ["WITHOUT_GST", "WITH_GST_INCLUSIVE"];

const initialForm = {
  poNumber: "",
  poDate: toDateInput(undefined),
  firmId: "",
  customerId: "",
  coalSizeId: "",
  totalQuantityMt: "",
  saleRate: "",
  saleRateInputMethod: "WITHOUT_GST" as RateInputMethod,
  saleGstPercent: "18",
  tcsApplicable: false,
  remarks: ""
};

export function CreatePurchaseOrder() {
  const navigate = useNavigate();
  const { data: customers } = useApiList<Customer>("/customers");
  const { data: coalSizes } = useApiList<CoalSize>("/coal-sizes");
  const { data: firms, reload: reloadFirms } = useApiList<Firm>("/firms");
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [creatingFirm, setCreatingFirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function updateField(field: keyof typeof initialForm, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function createDefaultFirm() {
    setCreatingFirm(true);
    setFormError(null);

    try {
      const response = await api.create<Firm>("/firms", { name: "Gokul Fuel Chem" });
      await reloadFirms();
      setForm((current) => ({ ...current, firmId: response.data.id }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to create firm.");
    } finally {
      setCreatingFirm(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setFormError(null);

    try {
      const payload = cleanPayload({
        ...form,
        totalQuantityMt: Number(form.totalQuantityMt),
        saleRate: Number(form.saleRate),
        saleGstPercent: Number(form.saleGstPercent)
      });

      const response = await api.create<PurchaseOrder>("/purchase-orders", payload);
      setMessage("Purchase order saved.");
      setForm({ ...initialForm, firmId: form.firmId });
      navigate(`/purchase-orders/${response.data.id}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to save purchase order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Create PO" description="Create a customer purchase order for coal." />

      <form onSubmit={handleSubmit} className="max-w-5xl rounded-md border border-slate-200 bg-white p-4 shadow-panel md:p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-950">Purchase Order Details</h2>
          {firms.length === 0 && (
            <button type="button" className="btn-secondary w-full sm:w-auto" onClick={createDefaultFirm} disabled={creatingFirm}>
              <Factory size={17} />
              Create Firm
            </button>
          )}
        </div>

        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="block min-w-0">
            <span className="label">PO Number</span>
            <input className="field mt-1" value={form.poNumber} onChange={(event) => updateField("poNumber", event.target.value)} required />
          </label>
          <label className="block min-w-0">
            <span className="label">PO Date</span>
            <input className="field mt-1" type="date" value={form.poDate} onChange={(event) => updateField("poDate", event.target.value)} />
          </label>
          <label className="block min-w-0">
            <span className="label">Firm</span>
            <select className="field mt-1" value={form.firmId} onChange={(event) => updateField("firmId", event.target.value)} required>
              <option value="">Select firm</option>
              {firms.map((firm) => (
                <option key={firm.id} value={firm.id}>{firm.name}</option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="label">Customer</span>
            <select className="field mt-1" value={form.customerId} onChange={(event) => updateField("customerId", event.target.value)} required>
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="label">Coal Size</span>
            <select className="field mt-1" value={form.coalSizeId} onChange={(event) => updateField("coalSizeId", event.target.value)} required>
              <option value="">Select coal size</option>
              {coalSizes.map((coalSize) => (
                <option key={coalSize.id} value={coalSize.id}>{coalSize.name}</option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="label">Quantity MT</span>
            <input className="field mt-1" type="number" min="0" step="0.001" value={form.totalQuantityMt} onChange={(event) => updateField("totalQuantityMt", event.target.value)} required />
          </label>
          <label className="block min-w-0">
            <span className="label">Sale Rate Per MT</span>
            <input className="field mt-1" type="number" min="0" step="0.01" value={form.saleRate} onChange={(event) => updateField("saleRate", event.target.value)} required />
          </label>
          <label className="block min-w-0">
            <span className="label">Sale Rate Input Method</span>
            <select className="field mt-1" value={form.saleRateInputMethod} onChange={(event) => updateField("saleRateInputMethod", event.target.value)}>
              {rateInputMethods.map((method) => (
                <option key={method} value={method}>{method.replace(/_/g, " ")}</option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="label">Sale GST Percent</span>
            <input className="field mt-1" type="number" min="0" max="100" step="0.01" value={form.saleGstPercent} onChange={(event) => updateField("saleGstPercent", event.target.value)} required />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
          <label className="flex h-10 items-center gap-3 rounded-md border border-slate-200 px-3">
            <input
              type="checkbox"
              checked={form.tcsApplicable}
              onChange={(event) => updateField("tcsApplicable", event.target.checked)}
              className="size-4 rounded border-slate-300 text-ember focus:ring-orange-200"
            />
            <span className="text-sm font-semibold text-slate-700">TCS applicable</span>
          </label>
          <label className="block min-w-0">
            <span className="label">Remarks</span>
            <textarea className="field-area mt-1" value={form.remarks} onChange={(event) => updateField("remarks", event.target.value)} />
          </label>
        </div>

        <div className="mt-4 space-y-3">
          {message && <Alert tone="success">{message}</Alert>}
          {formError && <Alert>{formError}</Alert>}
          <button className="btn-primary w-full sm:w-auto" disabled={saving || firms.length === 0}>
            <Save size={17} />
            Save PO
          </button>
        </div>
      </form>
    </>
  );
}
