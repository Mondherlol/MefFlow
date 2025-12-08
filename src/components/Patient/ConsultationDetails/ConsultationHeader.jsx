import React from "react";
import { Calendar, Clock, User, CheckCircle, XCircle } from "lucide-react";
import { getStatusText, getStatusStyle, formatLongDate, getRelativeTag } from "./utils";

export default function ConsultationHeader({ 
  consultation, 
  doctor, 
  patient, 
  onCancel, 
  actionLoading 
}) {
  const status = (consultation.statusConsultation || '').toLowerCase();
  const style = getStatusStyle(status);

  const rawDate = consultation.date || null;
  const rawTime = consultation.heure_debut || null;
  const dateObj = rawDate ? (rawTime ? new Date(`${rawDate}T${rawTime}:00`) : new Date(`${rawDate}T00:00:00`)) : null;
  const formattedDate = dateObj ? formatLongDate(dateObj) : (consultation.date || '—');
  const relativeTag = dateObj ? getRelativeTag(dateObj) : null;
  const showEndTime = status === 'termine' && consultation.heure_fin;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-1 h-16 rounded-full ${style.bar} flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{formattedDate}</span>
              {relativeTag && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs whitespace-nowrap">
                  {relativeTag}
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold text-slate-900 mb-2 truncate">
              Dr. {doctor.full_name}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Clock className="w-3.5 h-3.5" />
                {consultation.heure_debut}{showEndTime ? ` — ${consultation.heure_fin}` : ''}
              </span>
              <span className="flex items-center gap-1 truncate">
                <User className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{patient.full_name}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${style.badge} text-xs`}>
            {status === 'confirme' ? (
              <Clock className={`w-4 h-4 ${style.icon}`} />
            ) : (
              <CheckCircle className={`w-4 h-4 ${style.icon}`} />
            )}
            <span className="font-semibold whitespace-nowrap">{getStatusText(status)}</span>
          </div>

          {status === 'confirme' && (
            <button
              onClick={onCancel}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 disabled:opacity-50 text-xs font-medium"
            >
              <XCircle className="w-4 h-4" />
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
