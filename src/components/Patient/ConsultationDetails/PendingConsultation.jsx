import React from "react";
import { Clock, XCircle, AlertCircle } from "lucide-react";
import { getStatusText } from "./utils";

export default function PendingConsultation({ status }) {
  const isAnnule = status === 'annule';
  const isConfirme = status === 'confirme';
  
  if (isAnnule) {
    return (
      <div className="bg-gradient-to-r from-rose-50 to-white rounded-xl p-6 border border-rose-200 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-rose-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Consultation annulée</h3>
        <p className="text-slate-600 mb-4 text-sm">
          Ce rendez-vous a été annulé. Aucun document n'est disponible pour cette consultation.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-100 text-rose-700 text-sm">
          <XCircle className="w-4 h-4" />
          Statut: {getStatusText(status)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-6 border border-blue-200 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-4">
        {isConfirme ? (
          <Clock className="w-8 h-8 text-blue-600" />
        ) : (
          <AlertCircle className="w-8 h-8 text-blue-600" />
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        {isConfirme ? "Consultation confirmée" : "Consultation en cours"}
      </h3>
      <p className="text-slate-600 mb-4 text-sm">
        Vos documents (ordonnance & diagnostic) seront disponibles une fois la consultation terminée.
      </p>
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-sm">
        <Clock className="w-4 h-4" />
        Statut: {getStatusText(status)}
      </div>
    </div>
  );
}
