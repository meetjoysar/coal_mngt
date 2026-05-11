import { Inbox } from "lucide-react";

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-4 text-center">
      <Inbox className="mb-3 text-slate-400" size={28} />
      <p className="text-sm font-semibold text-slate-700">{label}</p>
    </div>
  );
}
