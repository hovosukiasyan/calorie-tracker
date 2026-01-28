export default function ProgressBar({
  value,
}: {
  value: number;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="h-3 w-full rounded-full bg-slate-800">
      <div
        className="h-3 rounded-full bg-emerald-400 transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
