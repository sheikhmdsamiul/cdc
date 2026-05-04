import { useTranslation } from "react-i18next";

interface DetailFieldProps {
  label: string;
  value?: string | number | boolean | null;
  className?: string;
}

export function DetailField({ label, value, className = "" }: DetailFieldProps) {
  const { t } = useTranslation();

  const display = value === null || value === undefined || value === ""
    ? <span className="text-muted-foreground italic">{t("common.notRecorded")}</span>
    : typeof value === "boolean"
    ? <span className={value ? "text-green-600 font-medium" : "text-muted-foreground"}>{value ? t("common.yes") : t("common.no")}</span>
    : <span>{String(value)}</span>;

  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm text-foreground">{display}</p>
    </div>
  );
}

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <h3 className="font-semibold text-base text-foreground border-b pb-2">{title}</h3>
      {children}
    </div>
  );
}
