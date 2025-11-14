const tokens = {
  card: "rounded-2xl border border-slate-200 bg-white shadow-sm",
  cardHover: "transition hover:shadow-md",
};

function StatCard({ icon, label, value, sub, loading = false }) {
  if (loading) {
    return (
      <div className={`${tokens.card} ${tokens.cardHover} p-5`}>
        <div className="flex items-center gap-3 animate-pulse">
          <div className="h-11 w-11 rounded-xl bg-slate-200" />
          <div className="flex-1">
            <div className="h-3 w-32 rounded bg-slate-200 mb-2" />
            <div className="h-7 w-24 rounded bg-slate-200 mb-2" />
            <div className="h-3 w-40 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${tokens.card} ${tokens.cardHover} p-5`}>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-linear-to-br from-sky-100 to-indigo-100 text-sky-700 ring-1 ring-sky-200">
          {icon}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
          <div className="text-2xl font-semibold leading-tight">{value}</div>
          {sub ? <div className="text-xs text-slate-500">{sub}</div> : null}
        </div>
      </div>
    </div>
  );
}
export default StatCard;