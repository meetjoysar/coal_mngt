export function numberValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatMt(value: string | number | null | undefined) {
  return `${numberValue(value).toLocaleString("en-IN", {
    maximumFractionDigits: 3
  })} MT`;
}

export function formatCurrency(value: string | number | null | undefined) {
  return numberValue(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  });
}

export function formatNumber(value: string | number | null | undefined) {
  return numberValue(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function toDateInput(value: string | null | undefined) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
}
