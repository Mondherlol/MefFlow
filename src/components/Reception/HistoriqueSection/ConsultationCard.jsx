import React from "react";
import { Link } from "react-router-dom";
import { UserCheck, User, Clock, XCircle, Loader2, CreditCard } from "lucide-react";


export default function ConsultationCard({ consultation: c, onCancel, onPostpone, loadingAction = "" }) {
  const timeStart = c.time || c.heure_debut || "--:--";
  const timeEnd = c.heure_fin || c.time_fin || c.end_time || "";
  const time = timeEnd ? `${timeStart} — ${timeEnd}` : timeStart;
  const patientName = c.patientName || c.patient?.user?.full_name || "—";
  const doctorName = c.doctorName || c.doctor?.user?.full_name || c.medecin_name || "—";
  const avatar = c.avatar;
  const status = (c.status || c.statusConsultation || "").toLowerCase();

  // status styles
  let statusClasses = "bg-slate-100 text-slate-700";
  let StatusIcon = Clock;
  if (status === "termine") {
    statusClasses = "bg-emerald-50 text-emerald-700";
    StatusIcon = UserCheck;
  } else if (status === "encours") {
    statusClasses = "bg-sky-50 text-sky-700";
    StatusIcon = Clock;
  } else if (status === "annule") {
    statusClasses = "bg-rose-50 text-rose-700";
    StatusIcon = XCircle;
  } else if (status === "confirme") {
    statusClasses = "bg-amber-50 text-amber-700";
    StatusIcon = Clock;
  }

    // small color bar per status
  const barColor = c.statusConsultation === "confirme" ? "bg-orange-400"
    : c.statusConsultation === "encours" ? "bg-green-400"
    : c.statusConsultation === "annule" ? "bg-rose-400"
    : "bg-green-400";

  const initials = (patientName || "—").split(" ").map(s => s[0] || "").slice(0,2).join("").toUpperCase();

  return (
    <article className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-sm hover:shadow-md border border-slate-100 transition">
     <div className={`w-1 h-12 rounded-l-lg ${barColor}`} />

      {/* avatar + status (left) */}
      <div className="flex items-center gap-3">
        <Link to={`/reception/patients/${c.patient?.id || ""}`} className="shrink-0">
          {avatar ? (
            <img src={avatar} alt={patientName} className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-100" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
              {initials || "—"}
            </div>
          )}
        </Link>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-3">

            <Link to={`/reception/patients/${c.patient?.id || ""}`} className="text-sm font-semibold text-slate-900 truncate">
              {c.pseudo || patientName}
            </Link>

 
            <div className={`inline-flex items-center gap-2 px-2 py-0.5 text-xs font-medium rounded-full ${statusClasses}`}>
              <StatusIcon className="w-4 h-4" />
              <span className="truncate">{getStatusText(status)}</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 truncate mt-1">Dr. {doctorName} • {time}</div>
        </div>
      </div>

      {/* actions (right) */}
      <div className="ml-auto flex items-center gap-2">
        {status === "confirme" && (
          <>
            <button
              onClick={() => onPostpone && onPostpone(c.id)}
              disabled={!onPostpone}
              className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 shadow-sm border border-transparent"
            >
              <Clock className="w-4 h-4" />
              Reporter
            </button>

            <button
              onClick={() => onCancel && onCancel(c.id)}
              disabled={!onCancel || loadingAction === `cancel-${c.id}`}
              className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-sm border border-transparent"
            >
              {loadingAction === `cancel-${c.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Annuler
            </button>
          </>
        )}

        {status === "termine" && (
          <Link to={`/reception/facturer/${c.id}`} className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 shadow-sm border border-transparent">
            <CreditCard className="w-4 h-4" />
            Facturer
          </Link>
        )}

        <div className="text-[11px] text-slate-400 ml-1">ID {String(c.id || "—").slice(0,8)}</div>
      </div>
    </article>
  );
}

// helper local (copié pour isolement du composant)
function getStatusText(status) {
  if (!status) return "—";
  switch (String(status).toLowerCase()) {
    case "confirme": return "Confirmé";
    case "termine": return "Terminé";
    case "encours": return "En cours";
    case "annule": return "Annulé";
    default: return String(status).replace("_", " ");
  }
}
