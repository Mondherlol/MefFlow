import React from "react";
import { User, CheckCircle, CreditCard } from "lucide-react";
import { getImageUrl } from "../../../utils/image.jsx";

export default function DoctorCard({ doctor, tarif, paid, onPay, actionLoading, isTermine }) {
  const avatar = getImageUrl(doctor.photo_url || doctor.photo || null);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-100">
      <div className="flex items-center gap-3 mb-3">
        {avatar ? (
          <img 
            src={avatar} 
            alt={doctor.full_name} 
            className="w-10 h-10 rounded-lg object-cover border-2 border-blue-200 flex-shrink-0" 
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-600">Médecin traitant</p>
          <h3 className="font-bold text-slate-900 text-sm truncate">Dr. {doctor.full_name}</h3>
        </div>
      </div>
      {doctor.specialite && (
        <div className="mb-3">
          <p className="text-xs text-slate-600">Spécialité</p>
          <p className="font-medium text-slate-900 text-sm truncate">{doctor.specialite}</p>
        </div>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-blue-100">
        <div>
          <p className="text-xs text-slate-600">Tarif</p>
          <p className="text-lg font-bold text-blue-600">{tarif} €</p>
        </div>
        {isTermine && (
          <>
            {paid ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Payé</span>
              </div>
            ) : (
              <button
                onClick={onPay}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-xs font-medium"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Payer
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
