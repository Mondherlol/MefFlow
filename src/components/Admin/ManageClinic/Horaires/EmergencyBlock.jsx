import React from "react";
import { Clock, Calendar, Phone, AlertTriangle } from "lucide-react";

const DAYS = [
  { id: "mon", label: "Lundi" },
  { id: "tue", label: "Mardi" },
  { id: "wed", label: "Mercredi" },
  { id: "thu", label: "Jeudi" },
  { id: "fri", label: "Vendredi" },
  { id: "sat", label: "Samedi" },
  { id: "sun", label: "Dimanche" },
];

export default function EmergencyBlock({ value, onChange, theme }) {
  const mode = value.mode || "specific";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Service d'urgences</h2>
            <p className="text-sm text-slate-600 mt-1">Configurez la gestion des urgences pour votre clinique</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { key: "always", title: "Disponible 24/7", desc: "Service d'urgence permanent", icon: <Clock className="w-6 h-6 text-red-600" /> },
            { key: "specific", title: "Plages horaires", desc: "Créneaux dédiés aux urgences", icon: <Calendar className="w-6 h-6 text-red-600" /> },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => onChange({ ...value, mode: opt.key })}
              className={`text-left rounded-2xl border-2 p-4 transition-all ${
                (value.mode || "specific") === opt.key
                  ? "border-red-300 bg-red-50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="text-2xl mb-2">{opt.icon}</div>
              <div className="font-semibold text-slate-900 mb-1">{opt.title}</div>
              <div className="text-sm text-slate-600">{opt.desc}</div>
            </button>
          ))}
        </div>

        {(mode === "always" || mode === "specific") && (
          <div className="grid md:grid-cols-2 gap-5">
            <label className="block space-y-3">
              <span className="block text-sm font-semibold text-slate-700">Téléphone d'urgence</span>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <Phone className="w-5 h-5 text-slate-600" />
                </div>
                <input
                  type="tel"
                  value={value.phone || ""}
                  onChange={(e) => onChange({ ...value, phone: e.target.value })}
                  placeholder="+216 XX XXX XXX"
                  className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </label>
          </div>
        )}

        {mode === "specific" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Horaires d'urgence par jour</span>
              <button
                onClick={() => {
                  const updated = { ...value.slots };
                  DAYS.forEach((day) => {
                    if (!updated[day.id] || updated[day.id].length === 0) {
                      updated[day.id] = [{ start: "09:00", end: "17:00" }];
                    }
                  });
                  onChange({ ...value, slots: updated });
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Remplir tous les jours
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {DAYS.map((d) => (
                <div key={d.id} className="rounded-xl border border-slate-200 bg-white">
                  <div className="px-3 py-2.5 border-b text-center text-sm font-semibold bg-slate-50">{d.label}</div>
                  <div className="p-2 min-h-[80px]">
                    {(value.slots?.[d.id] || []).length === 0 ? (
                      <button
                        className="w-full h-full text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 py-3 transition-colors"
                        onClick={() => {
                          const prev = value.slots || {};
                          const updated = { ...prev, [d.id]: [{ start: "09:00", end: "17:00" }] };
                          onChange({ ...value, slots: updated });
                        }}
                      >
                        Ajouter
                      </button>
                    ) : (
                      <div className="space-y-2">
                        {(value.slots?.[d.id] || []).map((s, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              window.__openSlotModal?.({
                                dayLabel: `${d.label} (Urgences)`,
                                initial: s,
                                existingSlots: value.slots?.[d.id] || [],
                                onSave: (patch) => {
                                  const list = [...(value.slots?.[d.id] || [])];
                                  list[i] = { ...list[i], ...patch };
                                  const updated = { ...value.slots, [d.id]: list.sort((a,b)=>a.start.localeCompare(b.start)) };
                                  onChange({ ...value, slots: updated });
                                },
                                onDelete: () => {
                                  const list = [...(value.slots?.[d.id] || [])].filter((_, k) => k !== i);
                                  const updated = { ...value.slots, [d.id]: list };
                                  onChange({ ...value, slots: updated });
                                },
                              });
                            }}
                            className="w-full text-xs bg-red-50 text-red-700 rounded-lg px-2 py-1.5 border border-red-200 flex items-center justify-between hover:bg-red-100 transition-colors group"
                          >
                            <span className="font-medium">{s.start} – {s.end}</span>
                          </button>
                        ))}
                        <button
                          className="w-full text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg border border-dashed border-slate-300 py-1.5 transition-colors"
                          onClick={() => {
                            const prev = value.slots || {};
                            const prevDay = prev[d.id] || [];
                            const last = prevDay[prevDay.length - 1];
                            const nextStart = last ? last.end : "09:00";
                            const nextEnd = (() => {
                              const [h, m] = nextStart.split(":").map(Number);
                              const mins = h * 60 + m + 120;
                              return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
                            })();
                            const updated = { ...prev, [d.id]: [...prevDay, { start: nextStart, end: nextEnd }].sort((a,b)=>a.start.localeCompare(b.start)) };
                            onChange({ ...value, slots: updated });
                          }}
                        >
                          Ajouter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
