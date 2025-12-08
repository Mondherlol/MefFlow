import React from "react";
import { Lock, Pill, Clock } from "lucide-react";
import PDFPrescription from "../../PDFPrescription";

export default function PrescriptionSection({ 
  prescription, 
  doctorName, 
  patientName, 
  date, 
  consultationId, 
  tarif, 
  isPaid, 
  onUnlock,
  clinicInfo,
  doctorInfo
}) {
  // Si pas d'ordonnance du tout
  if (!prescription || prescription.trim() === "") {
    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-3 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Ordonnance médicale</h3>
          </div>
        </div>
        <div className="p-4 text-center">
          <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-900 mb-1">En attente de l'ordonnance</p>
          <p className="text-xs text-slate-600">Le médecin n'a pas encore rédigé votre ordonnance. Revenez plus tard.</p>
        </div>
      </div>
    );
  }

  // Parser l'ordonnance (format: "1. Doliprane 500mg - 3x/jour - 7 jours\n2. ...")
  const prescriptionLines = prescription.split('\n').filter(line => line.trim());
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="p-3 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Ordonnance médicale</h3>
          </div>
          {!isPaid && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full">
              <Lock className="w-3 h-3" />
              <span className="text-xs font-medium">Contenu verrouillé</span>
            </div>
          )}
        </div>
      </div>
      
      {isPaid ? (
        <div className="p-3">
          <PDFPrescription
            prescription={prescription}
            doctorName={doctorName}
            patientName={patientName}
            date={date}
            consultationId={consultationId}
            clinicInfo={clinicInfo}
            doctorInfo={doctorInfo}
          />
        </div>
      ) : (
        <div className="relative">
          {/* Afficher le vrai contenu de l'ordonnance mais flouté */}
          <div className="p-3">
            <div className={"blur-sm select-none"}>
              <PDFPrescription
                prescription={prescription}
                doctorName={doctorName}
                patientName={patientName}
                date={date}
                consultationId={consultationId}
                clinicInfo={clinicInfo}
                doctorInfo={doctorInfo}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
