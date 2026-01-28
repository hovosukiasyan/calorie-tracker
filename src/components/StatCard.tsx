import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  helper?: string;
}

export const StatCard = ({ label, value, helper }: StatCardProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
  </div>
);
