// components/Reception/ConsultationRow.jsx
import React from "react";
import { Phone, Clock, Check, Repeat, X } from "lucide-react";

/**
 * Props:
 *  - c: { id, patient: { name, phone }, doctor, time, status }
 *  - onCheckIn, onCheckOut, onPostpone, onCancel
 *  - accent: hex color
 */
export default function ConsultationRow({ c, onCheckIn, onCheckOut, onPostpone, onCancel, accent = "#0ea5e9" }) {
  const time = new Date(c.time);
  const hh = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // small color bar per status
  const barColor = c.status === "checked_in" ? "bg-emerald-400"
    : c.status === "checked_out" ? "bg-slate-300"
    : c.status === "cancelled" ? "bg-rose-400"
    : "bg-sky-400";

  // initials
  const initials = (c.patient?.name || "").split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase();

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white border border-slate-50 hover:shadow-md hover:-translate-y-0.5 transform transition-all duration-150" role="row">
      {/* left: colored bar + avatar */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-1 h-12 rounded-l-lg ${barColor}`} />
        <div className="flex items-center gap-3 pl-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-700">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{c.patient.name}</div>
            <div className="text-xs text-slate-500 truncate">{c.doctor} • <span className="font-medium">{hh}</span></div>
          </div>
        </div>
      </div>

      {/* right: phone + actions */}
      <div className="flex items-center gap-2">
        <a href={`tel:${c.patient.phone}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-white border border-slate-100 hover:shadow-sm transition cursor-pointer">
          <Phone className="w-4 h-4 text-slate-600" />
          <span className="text-sm text-slate-700">{c.patient.phone}</span>
        </a>

        {/* primary CTA */}
        {c.status !== "checked_in" && c.status !== "checked_out" && (
          <button onClick={onCheckIn} className="px-3 py-1 rounded-md text-white text-sm font-medium hover:brightness-95 transition cursor-pointer" style={{ background: accent }}>
            <Check className="inline-block w-4 h-4 mr-1" /> Check-in
          </button>
        )}

        {c.status === "checked_in" && (
          <button onClick={onCheckOut} className="px-3 py-1 rounded-md text-white text-sm font-medium hover:brightness-95 transition cursor-pointer" style={{ background: "#10b981" }}>
            <Check className="inline-block w-4 h-4 mr-1" /> Check-out
          </button>
        )}

        {/* small icon buttons */}
        <button onClick={onPostpone} title="Reporter" className="p-2 rounded-md bg-white border border-slate-100 hover:shadow-sm transition cursor-pointer">
          <Repeat className="w-4 h-4 text-slate-600" />
        </button>
        <button onClick={onCancel} title="Annuler" className="p-2 rounded-md bg-white border border-slate-100 hover:bg-rose-50 hover:shadow-sm transition cursor-pointer">
          <X className="w-4 h-4 text-rose-600" />
        </button>
      </div>
    </div>
  );
}
