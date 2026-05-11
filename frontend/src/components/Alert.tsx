import type { ReactNode } from "react";

type Props = {
  tone?: "error" | "success" | "warning";
  children: ReactNode;
};

const toneStyles = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800"
};

export function Alert({ tone = "error", children }: Props) {
  return <div className={`rounded-md border px-3 py-2 text-sm ${toneStyles[tone]}`}>{children}</div>;
}
