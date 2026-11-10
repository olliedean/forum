export function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatRelativeTime(value: Date | string, now = Date.now()): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));
  const units: Array<{ size: number; label: string }> = [
    { size: 31_536_000, label: "year" },
    { size: 2_592_000, label: "month" },
    { size: 604_800, label: "week" },
    { size: 86_400, label: "day" },
    { size: 3_600, label: "hour" },
    { size: 60, label: "minute" },
    { size: 1, label: "second" },
  ];
  const unit = units.find(({ size }) => seconds >= size) ?? units[units.length - 1];
  const amount = Math.floor(seconds / unit.size);

  return `${amount} ${unit.label}${amount === 1 ? "" : "s"} ago`;
}
