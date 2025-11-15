import React from "react";
import { Link } from "react-router-dom";

export default function MedecinTemplate({ title, breadcrumbs = [], children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-start gap-4 mb-6">
          <Link to="/doctor" className="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-white shadow-sm text-sm text-slate-700 hover:bg-slate-50">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7"/></svg>
            Retour
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
            <nav className="text-xs text-slate-500 mt-1">
              {breadcrumbs.map((b, i) => (
                <span key={i}>
                  {b.to ? <Link to={b.to} className="text-slate-500 hover:underline">{b.label}</Link> : <span className="text-slate-400">{b.label}</span>}
                  {i < breadcrumbs.length - 1 && <span className="px-2">/</span>}
                </span>
              ))}
            </nav>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
