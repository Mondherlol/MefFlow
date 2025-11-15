import React from "react";

export default function DoctorStats({ stats = {} }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="text-center px-4 py-3 bg-white rounded-lg shadow-sm border border-slate-50">
        <div className="text-xs text-slate-500">Rendez-vous (aujourd'hui)</div>
        <div className="font-bold text-slate-800">{stats.today ?? 0}</div>
      </div>
      <div className="text-center px-4 py-3 bg-white rounded-lg shadow-sm border border-slate-50">
        <div className="text-xs text-slate-500">Patients</div>
        <div className="font-bold text-slate-800">{stats.patients ?? "—"}</div>
      </div>
      <div className="text-center px-4 py-3 bg-white rounded-lg shadow-sm border border-slate-50">
        <div className="text-xs text-slate-500">Messages / Notifications</div>
        <div className="font-bold text-slate-800">{stats.notifications ?? 0}</div>
      </div>
    </div>
  );
}
