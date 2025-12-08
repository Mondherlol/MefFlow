import React from "react";
import { XCircle, CreditCard, ShieldCheck, BadgeCheck } from "lucide-react";

export default function PaymentModal({ 
  doctor, 
  tarif, 
  onClose, 
  onConfirm, 
  actionLoading 
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900">Confirmer le paiement</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-700">Consultation avec</span>
            <span className="font-semibold text-slate-900 text-sm truncate ml-2">{doctor.full_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Montant total</span>
            <span className="text-2xl font-bold text-blue-600">{tarif} €</span>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
            <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-900 text-sm">Paiement sécurisé</p>
              <p className="text-xs text-slate-600">Cryptage SSL 256-bit</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
            <BadgeCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-900 text-sm">Accès immédiat</p>
              <p className="text-xs text-slate-600">Documents disponibles instantanément</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={actionLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {actionLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Payer maintenant
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
