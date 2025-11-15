import React from "react";

export default function DoctorConfigPanel() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
      <h3 className="text-sm font-semibold">Configurations</h3>
      <div className="mt-3 space-y-2 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <div>Horaires & disponibilités</div>
          <button className="text-xs text-slate-700 px-2 py-1 border rounded">Gérer</button>
        </div>
        <div className="flex items-center justify-between">
          <div>Dossiers médicaux</div>
          <button className="text-xs text-slate-700 px-2 py-1 border rounded">Accéder</button>
        </div>
        <div className="flex items-center justify-between">
          <div>Rechercher ordonnances</div>
          <button className="text-xs text-slate-700 px-2 py-1 border rounded">Rechercher</button>
        </div>
      </div>
    </div>
  );
}
