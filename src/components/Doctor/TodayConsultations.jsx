import React from "react";
import ConsultationRow from "../Reception/ConsultationRow";

export default function TodayConsultations({ events = [], onCheckIn, onCheckOut, onPostpone, onCancel, onSelect, accent }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Consultations du jour</h2>
        <a href="#" className="text-xs font-medium text-slate-600">Voir la journée</a>
      </div>

      {events.length ? (
        <div className="space-y-2">
          {events.map((c) => (
            <div key={c.id} onClick={() => onSelect?.(c)}>
              <ConsultationRow
                c={c}
                onCheckIn={() => onCheckIn?.(c.id)}
                onCheckOut={() => onCheckOut?.(c.id)}
                onPostpone={() => onPostpone?.(c.id)}
                onCancel={() => onCancel?.(c.id)}
                accent={accent}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-500">Aucun rendez-vous aujourd'hui.</div>
      )}
    </div>
  );
}
