import React from "react";
import { Link } from "react-router-dom";
import {
  UserCheck,
  Clock,
  XCircle,
  Loader2,
  CreditCard,
  Phone,
  CalendarDays,
  FileText,
  ClipboardPlus,
} from "lucide-react";

export default function ConsultationListCard({
  consultation: c,
  onCheckIn,
  onCheckOut,
  onPostpone,
  onCancel,
  onOpenInPlanning,     // optionnel : () => onOpenInPlanning(c)
  loadingAction = "",
  accent = "#0ea5e9",
}) {
  const timeStart = c.heure_debut || c.time || "--:--";
  const timeEnd = c.heure_fin || c.time_fin || c.end_time || "";
  const durationMinutes = getDurationMinutes(timeStart, timeEnd);

  const timeLabel = timeEnd
    ? `${timeStart} — ${timeEnd}${durationMinutes ? ` · ${durationMinutes} min` : ""}`
    : timeStart;

  const patientName =
    c.patient?.full_name ||
    c.patient?.user?.full_name ||
    c.patientName ||
    "—";

  const doctorName =
    c.doctor?.full_name || c.doctorName || c.medecin_name || "—";

  const avatar =
    c.patient?.avatar || c.patient?.user?.avatar || c.avatar || null;

  const phone = c.patient?.phone || c.patient?.user?.phone || "";

  const status = (c.statusConsultation || c.status || "").toLowerCase();

  // small color bar per status (left accent)
  const barColor = status === "confirme"
    ? "bg-orange-400"
    : status === "encours"
    ? "bg-green-400"
    : status === "annule" || status === "annuler"
    ? "bg-rose-400"
    : "bg-green-400";

  // determine doctor id for planning link (fallbacks for different shapes)
  const doctorId =
    c.doctor?.id || c.doctor?.user?.id || c.medecin_id || c.medecin?.id || c.doctorId || "";

  const room =
    c.salle ||
    c.room ||
    c.salle_consultation ||
    c.consultation_room ||
    null;

  // Statut → couleurs & icône
  let statusClasses = "bg-slate-50 text-slate-700";
  let StatusIcon = Clock;

  if (status === "termine") {
    statusClasses = "bg-emerald-50 text-emerald-700";
    StatusIcon = UserCheck;
  } else if (status === "encours") {
    statusClasses = "bg-sky-50 text-sky-700";
    StatusIcon = Clock;
  } else if (status === "annule" || status === "annuler") {
    statusClasses = "bg-rose-50 text-rose-700";
    StatusIcon = XCircle;
  } else if (status === "confirme") {
    statusClasses = "bg-amber-50 text-amber-700";
    StatusIcon = Clock;
  }

  const initials = (patientName || "—")
    .split(" ")
    .map((s) => s[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isLoadingCheckIn = loadingAction === `checkin-${c?.id}`;
  const isLoadingCheckOut = loadingAction === `checkout-${c?.id}`;
  const isLoadingCancel = loadingAction === `cancel-${c?.id}`;

  return (
    <article className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
      <div className={`w-1 h-12 rounded-l-xl ${barColor}`} />
      {/* Avatar + contenu */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Avatar patient */}
        <Link
          to={`/reception/patients/${c.patient?.id || ""}`}
          className="shrink-0"
        >
          {avatar ? (
            <img
              src={avatar}
              alt={patientName}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-100"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-700">
              {initials || "—"}
            </div>
          )}
        </Link>

        {/* Infos principales */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Ligne 1 : nom patient + salle + statut + heure */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <Link
                to={`/reception/patients/${c.patient?.id || ""}`}
                className="block text-sm font-semibold text-slate-900 truncate hover:text-sky-700"
              >
                {patientName}
              </Link>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate">
                <span className="truncate">Dr. {doctorName}</span>
                {room && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] text-slate-600 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Salle {room}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-row items-end gap-1 shrink-0">
                
                       {/* Statut */}
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusClasses}`}
              >
                <StatusIcon className="w-3 h-3" />
                <span className="truncate max-w-[110px]">
                  {getStatusText(status)}
                </span>
              </div>

              {/* Heure + durée */}
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-50 text-[11px] font-medium text-slate-700 border border-slate-100 max-w-[150px]">
                <Clock className="w-3 h-3 mr-1 shrink-0" />
                <span className="truncate">{timeLabel}</span>
              </div>

       
            </div>
          </div>

          {/* Ligne 2 : téléphone + liens + actions */}
          <div className="flex items-center gap-2 justify-between">
            {/* Téléphone + petits liens */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[95px]">{phone}</span>
                </a>
              )}

              {onOpenInPlanning && (
                <button
                  type="button"
                  onClick={() => onOpenInPlanning(c)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 hover:text-sky-900"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">
                    Consulter dans le planning
                  </span>
                </button>
              )}

              <Link
                to={`/reception/patients/${c.patient?.id || ""}`}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900"
              >
                <ClipboardPlus className="w-3.5 h-3.5" />
                <span className="truncate max-w-[110px]">
                  Dossier médical
                </span>
              </Link>

              {doctorId && (
                <Link
                  to={`/reception/emploi/${doctorId}`}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 hover:text-sky-900"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[110px]">Voir dans le planning</span>
                </Link>
              )}
            </div>

            {/* Actions à droite, compactes */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {status === "confirme" && (
                <button
                  onClick={() => onCheckIn && onCheckIn(c)}
                  disabled={isLoadingCheckIn}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-200 ${
                    isLoadingCheckIn
                      ? "opacity-60 cursor-default"
                      : "hover:shadow-md"
                  }`}
                  style={{ backgroundColor: accent }}
                >
                  {isLoadingCheckIn ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                  <span>Check In</span>
                </button>
              )}

              {status === "encours" && (
                <button
                  onClick={() => onCheckOut && onCheckOut(c.id)}
                  disabled={isLoadingCheckOut}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold text-white bg-emerald-500 shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-200 ${
                    isLoadingCheckOut
                      ? "opacity-60 cursor-default"
                      : "hover:bg-emerald-600 hover:shadow-md"
                  }`}
                >
                  {isLoadingCheckOut ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                  <span>Check-Out</span>
                </button>
              )}

              {status === "confirme" && (
                <button
                  onClick={() => onPostpone && onPostpone(c.id)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Reporter</span>
                </button>
              )}

              {/* Annuler : seulement si "confirme" */}
              {status === "confirme" && (
                <button
                  onClick={() => onCancel && onCancel(c.id)}
                  disabled={isLoadingCancel}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white border border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 ${
                    isLoadingCancel ? "opacity-60 cursor-default" : ""
                  }`}
                >
                  {isLoadingCancel ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Annuler</span>
                </button>
              )}

              {status === "termine" && (
                <Link
                  to={`/reception/facturer/${c.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Facturer</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function getStatusText(status) {
  if (!status) return "—";
  switch (String(status).toLowerCase()) {
    case "confirme":
      return "Confirmé";
    case "termine":
      return "Terminé";
    case "encours":
      return "En cours";
    case "annule":
    case "annuler":
      return "Annulé";
    default:
      return String(status).replace("_", " ");
  }
}

function getDurationMinutes(start, end) {
  if (!start || !end) return null;
  const [sh, sm] = String(start).split(":").map((n) => parseInt(n, 10));
  const [eh, em] = String(end).split(":").map((n) => parseInt(n, 10));
  if (
    Number.isNaN(sh) ||
    Number.isNaN(sm) ||
    Number.isNaN(eh) ||
    Number.isNaN(em)
  )
    return null;
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const diff = endMin - startMin;
  return diff > 0 ? diff : null;
}
