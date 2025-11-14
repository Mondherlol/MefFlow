import React from "react";
import { Copy, ClipboardPaste, Plus, Pencil, AlertTriangle } from "lucide-react";
import { DAYS, sortSlots, hasOverlap } from "../../utils/scheduleUtils";

export default function ScheduleGrid({
  isLoading,
  getDay,
  toggleDay,
  copyDay,
  pasteDay,
  openCreateForDay,
  openEditSlot,
  savingWeekdays,
  closedIcon: ClosedIcon,
  closedText = "Fermé",
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
        {DAYS.map((day) => (
          <div key={day.id} className="relative text-center py-4 font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium text-slate-600">{day.label}</span>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-0">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-4 border-r border-slate-200 last:border-r-0 border-b bg-white">
              <div className="animate-pulse space-y-3">
                <div className="h-6 w-24 bg-slate-200 rounded mx-auto" />
                <div className="h-3 bg-slate-200 rounded" />
                <div className="h-3 bg-slate-200 rounded" />
                <div className="h-10 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7">
          {DAYS.map((day) => {
            const data = getDay(day.id);
            const slots = data?.slots || [];
            const overlap = hasOverlap(slots);
            const isOpen = Boolean(data) && (typeof data.open === "boolean" ? data.open : true);
            return (
              <div key={day.id} className="relative min-h-[160px] p-3 border-r border-slate-200 last:border-r-0 border-b bg-white group">
                {savingWeekdays.has(Number(day.id)) && (
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-slate-300 bg-white shadow-sm flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full animate-pulse bg-slate-500" />
                    </div>
                    <span className="text-xs text-slate-500">Sauvegarde</span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => toggleDay(day.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isOpen ? "bg-green-500 text-white shadow-sm hover:bg-green-600" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {isOpen ? (data?.open === false ? "Ouvert" : "Ouvert") : "Fermé"}
                  </button>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 shadow-sm"
                      title="Copier les horaires"
                      onClick={() => copyDay(day.id)}
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <button
                      className="p-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 shadow-sm"
                      title="Coller les horaires"
                      onClick={() => pasteDay(day.id)}
                    >
                      <ClipboardPaste className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>

                {overlap && (
                  <div className="mb-2 flex items-center gap-1.5 text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200">
                    <AlertTriangle className="w-3 h-3" />
                    Chevauchement
                  </div>
                )}

                {isOpen ? (
                  <div className="space-y-2">
                    {sortSlots(slots).map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => openEditSlot(day.id, i)}
                        className="w-full text-sm bg-blue-50 text-blue-700 rounded-lg px-3 py-2 border border-blue-200 flex items-center justify-between hover:bg-blue-100 transition-colors group/slot"
                      >
                        <span className="font-medium">
                          {slot.start} – {slot.end}
                        </span>
                        <Pencil className="w-3.5 h-3.5 opacity-0 group-hover/slot:opacity-100 transition-opacity" />
                      </button>
                    ))}

                    <button
                      onClick={() => openCreateForDay(day.id)}
                      className="w-full text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 py-2.5 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <Plus className="w-4 h-4" /> Ajouter
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <div className="text-center flex justify-center items-center flex-col gap-0">
                      <div className="text-2xl mb-1"><ClosedIcon /></div>
                      <div className="text-xs font-medium">{closedText}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
