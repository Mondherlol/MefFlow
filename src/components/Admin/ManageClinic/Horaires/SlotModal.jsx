import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle, Trash2, Check, X } from "lucide-react";

// helper: time -> minutes
const toMin = (hhmm) => {
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + m;
};

const sortSlots = (slots = []) => [...slots].sort((a, b) => toMin(a.start) - toMin(b.start));

export default function SlotModal({
  open,
  onClose,
  dayLabel,
  existingSlots = [],
  initial = { start: "09:00", end: "11:00" },
  onDelete,
  onSave,
}) {
  const [start, setStart] = useState(() => initial?.start ?? "09:00");
  const [end, setEnd] = useState(() => initial?.end ?? "11:00");

  useEffect(() => {
    if (open) {
      setStart(initial?.start ?? "09:00");
      setEnd(initial?.end ?? "11:00");
    }
  }, [open, initial]);

  const getValidationErrors = () => {
    const errors = [];
    const startMin = toMin(start);
    const endMin = toMin(end);

    if (endMin <= startMin) {
      errors.push("L'heure de fin doit être après l'heure de début.");
    }

    // check overlaps with other slots (exclude current initial)
    const otherSlots = existingSlots.filter(
      (slot) => slot.start !== initial?.start || slot.end !== initial?.end
    );

    for (const slot of otherSlots) {
      const slotStart = toMin(slot.start);
      const slotEnd = toMin(slot.end);
      if (startMin < slotEnd && endMin > slotStart) {
        errors.push(`Ce créneau chevauche avec ${slot.start} - ${slot.end}`);
        break;
      }
    }

    return errors;
  };

  const validationErrors = getValidationErrors();
  const isValid = validationErrors.length === 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-3 text-slate-800 font-semibold">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-slate-600">Créneau horaire</div>
              <div className="text-base">{dayLabel}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 transition-" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-2">
              <span className="block text-sm font-medium text-slate-700">Début</span>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </label>
            <label className="block space-y-2">
              <span className="block text-sm font-medium text-slate-700">Fin</span>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </label>
          </div>

          {validationErrors.length > 0 && (
            <div className="space-y-2">
              {validationErrors.map((error, index) => (
                <div key={index} className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-sm font-medium text-slate-700 mb-2">Résumé</div>
            <div className="text-lg font-semibold text-slate-900">{start} – {end}</div>
            <div className="text-sm text-slate-600 mt-1">
              Durée: {Math.floor((toMin(end) - toMin(start)) / 60)}h{(toMin(end) - toMin(start)) % 60}min
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/50">
          <div>
            {onDelete && (
              <button onClick={onDelete} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-">
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition- font-medium">Annuler</button>
            <button
              onClick={() => isValid && onSave({ start, end })}
              disabled={!isValid}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
            >
              <Check className="w-4 h-4" /> Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
