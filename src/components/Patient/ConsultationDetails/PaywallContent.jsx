// components/PaywallContent.jsx
import React from 'react';
import { Lock, Eye, Shield, CreditCard, Sparkles, CheckCircle } from 'lucide-react';


export default function PaywallContent({
  type,
  title,
  description,
  onUnlock,
  price,
  isPaid,
  children
}) {
  if (isPaid) {
    return (
      <div className="bg-linear-to-br from-white to-blue-50 rounded-2xl shadow-xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            {type === 'diagnostic' ? (
              <Shield className="w-6 h-6 text-white" />
            ) : (
              <Eye className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="text-slate-600">{description}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-green-50 to-emerald-50 border border-green-100">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">Accès autorisé</span>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="group relative bg-linear-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-blue-300 hover:-translate-y-1">
      {/* Premium glow effect */}
      <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Blurred content overlay */}
      <div className="relative backdrop-blur-sm bg-white/70 p-8">
        <div className="flex flex-col items-center text-center">
          {/* Premium icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
          <p className="text-slate-600 mb-6 max-w-md">{description}</p>

          {/* Features list */}
          <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-md">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50/50">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Confidential</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50/50">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Complet</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50/50">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Validé</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50/50">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-slate-700">Téléchargeable</span>
            </div>
          </div>

          {/* Price card */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-600">Coût de déblocage</span>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">{price} €</div>
                  <span className="text-sm text-slate-500">TVA incluse</span>
                </div>
              </div>
              <button
                onClick={onUnlock}
                className="w-full py-4 px-6 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
              >
                <CreditCard className="w-6 h-6" />
                Débloquer l'accès
              </button>
              <p className="text-center text-sm text-slate-500 mt-3">
                Paiement sécurisé • Remboursable sous 14 jours
              </p>
            </div>
          </div>

          {/* Preview of blurred content */}
          <div className="relative w-full overflow-hidden rounded-xl border border-slate-200">
            <div className="absolute inset-0 backdrop-blur-lg bg-white/40" />
            <div className="relative p-6">
              <div className="space-y-4 opacity-40">
                <div className="h-4 bg-slate-300 rounded w-3/4"></div>
                <div className="h-4 bg-slate-300 rounded w-1/2"></div>
                <div className="h-4 bg-slate-300 rounded w-full"></div>
                <div className="h-4 bg-slate-300 rounded w-5/6"></div>
                <div className="h-4 bg-slate-300 rounded w-2/3"></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-linear-to-r from-white to-blue-50/80 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-200 shadow-lg">
                <span className="text-blue-700 font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Contenu protégé - Débloquez pour accéder
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}