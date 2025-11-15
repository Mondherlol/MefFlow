import React from "react";

export default function DoctorHeader({ user }) {
  return (
    <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Espace médecin</h1>
        <p className="text-sm text-slate-500 mt-1">Tableau de bord — vue d'ensemble et accès rapide</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-600">Bonjour,&nbsp;<span className="font-medium text-slate-900">{user?.full_name || 'Docteur'}</span></div>
      </div>
    </header>
  );
}
