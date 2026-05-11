import { Edit2, Save, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { api, cleanPayload } from "../lib/api";
import { useApiList } from "../hooks/useApiResource";
import type { Transporter } from "../types";

const initialForm = {
  name: "",
  location: "",
  contactPerson: "",
  phone: "",
  remarks: ""
};

export function Transporters() {
  const { data, loading, error, reload } = useApiList<Transporter>("/transporters");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!editingId) return;
    const transporter = data.find((item) => item.id === editingId);
    if (!transporter) return;

    setForm({
      name: transporter.name,
      location: transporter.location ?? "",
      contactPerson: transporter.contactPerson ?? "",
      phone: transporter.phone ?? "",
      remarks: transporter.remarks ?? ""
    });
  }, [data, editingId]);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setFormError(null);

    try {
      if (editingId) {
        await api.update<Transporter>(`/transporters/${editingId}`, cleanPayload(form));
        setMessage("Transporter updated.");
      } else {
        await api.create<Transporter>("/transporters", cleanPayload(form));
        setMessage("Transporter saved.");
      }

      resetForm();
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to save transporter.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setMessage(null);
    setFormError(null);

    try {
      await api.remove(`/transporters/${id}`);
      if (editingId === id) resetForm();
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to delete transporter.");
    }
  }

  return (
    <>
      <PageHeader title="Transporters" description="Manage truck transporters used on dispatches." />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-950">{editingId ? "Edit Transporter" : "Add Transporter"}</h2>
            {editingId && (
              <button type="button" className="grid size-9 place-items-center rounded-md border border-slate-200" onClick={resetForm} aria-label="Cancel edit">
                <X size={17} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="label">Transporter Name</span>
              <input className="field mt-1" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
            </label>
            <label className="block">
              <span className="label">Location</span>
              <input className="field mt-1" value={form.location} onChange={(event) => updateField("location", event.target.value)} />
            </label>
            <label className="block">
              <span className="label">Contact Person</span>
              <input className="field mt-1" value={form.contactPerson} onChange={(event) => updateField("contactPerson", event.target.value)} />
            </label>
            <label className="block">
              <span className="label">Phone</span>
              <input className="field mt-1" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
            </label>
            <label className="block">
              <span className="label">Remarks</span>
              <textarea className="field-area mt-1" value={form.remarks} onChange={(event) => updateField("remarks", event.target.value)} />
            </label>

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
            <EmptyState label="No transporters found." />
          ) : (
            <div className="table-card">
              <div className="table-scroll">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Contact Person</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Remarks</th>
                      <th className="w-28 px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.map((transporter) => (
                      <tr key={transporter.id}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{transporter.name}</td>
                        <td className="px-4 py-3 text-slate-600">{transporter.location || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{transporter.contactPerson || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{transporter.phone || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{transporter.remarks || "-"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                              onClick={() => setEditingId(transporter.id)}
                              aria-label={`Edit ${transporter.name}`}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="grid size-9 place-items-center rounded-md border border-slate-200 text-rose-600 hover:bg-rose-50"
                              onClick={() => void remove(transporter.id)}
                              aria-label={`Delete ${transporter.name}`}
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
