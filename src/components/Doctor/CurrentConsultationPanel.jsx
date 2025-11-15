import React from "react";

export default function CurrentConsultationPanel({ consultation, onClose, onComplete, onOpen }) {
  if (!consultation) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
        <h3 className="text-sm font-semibold">Consultation actuelle</h3>
        <div className="text-sm text-slate-500 mt-2">Aucune consultation sélectionnée. Cliquez sur une consultation pour l'ouvrir.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">Consultation en cours</h3>
          <div className="mt-2 text-sm">
            <div><strong>Patient:</strong> {consultation.title || consultation.patient?.name}</div>
            <div><strong>Médecin:</strong> {consultation.doctor || consultation.patient?.doctor || '—'}</div>
            <div><strong>Heure:</strong> {consultation.time ? new Date(consultation.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : consultation.start || '—'}</div>
            <div className="mt-2 text-xs text-slate-500">Statut: {consultation.status || 'scheduled'}</div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button onClick={() => onOpen?.(consultation)} className="px-3 py-2 bg-white border rounded-md text-sm">Ouvrir</button>
          <button onClick={() => onComplete?.(consultation.id)} className="px-3 py-2 bg-emerald-600 text-white rounded-md text-sm">Clôturer</button>
          <button onClick={() => onClose?.()} className="px-3 py-2 bg-rose-50 text-rose-600 border rounded-md text-sm">Fermer</button>
        </div>
      </div>
    </div>
  );
}
