import { Edit2, Save, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { api, cleanPayload } from "../lib/api";
import { useApiList } from "../hooks/useApiResource";
import type { CoalSize, Customer, Supplier } from "../types";

type Resource = Customer | Supplier | CoalSize;

type Props<T extends Resource> = {
  title: string;
  description: string;
  path: string;
  kind: "party" | "coalSize";
  emptyLabel: string;
  columns: Array<{ label: string; render: (item: T) => string | null | undefined }>;
};

const initialParty = {
  name: "",
  gstNumber: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: ""
};

const initialCoalSize = {
  name: "",
  description: ""
};

export function MasterPage<T extends Resource>({ title, description, path, kind, emptyLabel, columns }: Props<T>) {
  const { data, loading, error, reload } = useApiList<T>(path);
  const [form, setForm] = useState(kind === "party" ? initialParty : initialCoalSize);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!editingId) return;
    const record = data.find((item) => item.id === editingId);
    if (!record) return;

    if (kind === "party") {
      const party = record as Customer | Supplier;
      setForm({
        name: party.name,
        gstNumber: party.gstNumber ?? "",
        contactPerson: party.contactPerson ?? "",
        phone: party.phone ?? "",
        email: party.email ?? "",
        address: party.address ?? ""
      });
    } else {
      const coalSize = record as CoalSize;
      setForm({
        name: coalSize.name,
        description: coalSize.description ?? ""
      });
    }
  }, [data, editingId, kind]);

  function updateField(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(kind === "party" ? initialParty : initialCoalSize);
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setFormError(null);

    try {
      if (editingId) {
        await api.update<T>(`${path}/${editingId}`, cleanPayload(form));
        setMessage(`${title.slice(0, -1)} updated.`);
      } else {
        await api.create<T>(path, cleanPayload(form));
        setMessage(`${title.slice(0, -1)} saved.`);
      }
      resetForm();
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to save record.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setMessage(null);
    setFormError(null);

    try {
      await api.remove(`${path}/${id}`);
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to delete record.");
    }
  }

  return (
    <>
      <PageHeader title={title} description={description} />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-950">{editingId ? "Edit" : "Add"} {title.slice(0, -1)}</h2>
            {editingId && (
              <button type="button" className="grid size-9 place-items-center rounded-md border border-slate-200" onClick={resetForm} aria-label="Cancel edit">
                <X size={17} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="label">Name</span>
              <input className="field mt-1" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
            </label>

            {kind === "party" ? (
              <>
                <label className="block">
                  <span className="label">GST Number</span>
                  <input className="field mt-1" value={"gstNumber" in form ? form.gstNumber : ""} onChange={(event) => updateField("gstNumber", event.target.value)} />
                </label>
                <label className="block">
                  <span className="label">Contact Person</span>
                  <input className="field mt-1" value={"contactPerson" in form ? form.contactPerson : ""} onChange={(event) => updateField("contactPerson", event.target.value)} />
                </label>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <label className="block">
                    <span className="label">Phone</span>
                    <input className="field mt-1" value={"phone" in form ? form.phone : ""} onChange={(event) => updateField("phone", event.target.value)} />
                  </label>
                  <label className="block">
                    <span className="label">Email</span>
                    <input className="field mt-1" type="email" value={"email" in form ? form.email : ""} onChange={(event) => updateField("email", event.target.value)} />
                  </label>
                </div>
                <label className="block">
                  <span className="label">Address</span>
                  <textarea className="field-area mt-1" value={"address" in form ? form.address : ""} onChange={(event) => updateField("address", event.target.value)} />
                </label>
              </>
            ) : (
              <label className="block">
                <span className="label">Description</span>
                <textarea className="field-area mt-1" value={"description" in form ? form.description : ""} onChange={(event) => updateField("description", event.target.value)} />
              </label>
            )}

            {message && <Alert tone="success">{message}</Alert>}
            {formError && <Alert>{formError}</Alert>}

            <button className="btn-primary w-full" disabled={saving}>
              <Save size={17} />
              {editingId ? "Update" : "Save"}
            </button>
          </div>
        </form>

        <section>
          {error && <div className="mb-4"><Alert>{error}</Alert></div>}
          {!loading && data.length === 0 ? (
            <EmptyState label={emptyLabel} />
          ) : (
            <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-panel">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      {columns.map((column) => (
                        <th key={column.label} className="px-4 py-3">{column.label}</th>
                      ))}
                      <th className="w-28 px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.map((item) => (
                      <tr key={item.id}>
                        {columns.map((column) => (
                          <td key={column.label} className="px-4 py-3 text-slate-600">
                            {column.render(item) || "-"}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                              onClick={() => setEditingId(item.id)}
                              aria-label={`Edit ${item.name}`}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="grid size-9 place-items-center rounded-md border border-slate-200 text-rose-600 hover:bg-rose-50"
                              onClick={() => void remove(item.id)}
                              aria-label={`Delete ${item.name}`}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
