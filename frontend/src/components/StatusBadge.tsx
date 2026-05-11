import type { Status } from "../types";

const styles: Record<Status, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  ACTIVE: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700"
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  );
}
