// components/Reception/ActionTile.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * Props: to, title, desc, Icon (lucide), accent (hex), badgeCount
 */
export default function ActionTile({ to = "#", title, desc, Icon, accent = "#0ea5e9", badgeCount = 0 }) {
  return (
    <Link
      to={to}
      className="group block bg-white rounded-xl p-3 shadow-sm border border-transparent hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150"
      style={{ textDecoration: 'none' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            style={{ background: `${accent}22` }}
            className="w-11 h-11 rounded-lg flex items-center justify-center transition-colors duration-150"
          >
            <Icon size={18} className="text-inherit" style={{ color: accent }} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate text-slate-800 group-hover:text-slate-900">{title}</div>
            <div className="text-xs text-slate-500 truncate">{desc}</div>
          </div>
        </div>

        {badgeCount > 0 && (
          <div className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-rose-600 rounded-full shadow">{badgeCount}</div>
        )}
      </div>
    </Link>
  );
}
