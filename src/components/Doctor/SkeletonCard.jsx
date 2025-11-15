import React from "react";

export default function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 bg-slate-200 rounded" />
        ))}
      </div>
    </div>
  );
}
