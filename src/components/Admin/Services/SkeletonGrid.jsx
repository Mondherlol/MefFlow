import React from 'react';

export default function SkeletonGrid({ columns = 3 }) {
  const items = new Array(3).fill(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-4 animate-pulse">
            <div className="w-16 h-16 rounded-xl bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-full mt-2" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <div className="h-9 w-24 bg-slate-200 rounded-lg" />
            <div className="h-9 w-28 bg-slate-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
