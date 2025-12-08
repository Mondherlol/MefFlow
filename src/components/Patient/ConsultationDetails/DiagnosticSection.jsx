import React from "react";
import { FileText, Lock, Clock } from "lucide-react";

export default function DiagnosticSection({ 
  diagnostic, 
  tarif, 
  isPaid, 
  onUnlock 
}) {
  // Si pas de diagnostic du tout
  if (!diagnostic || diagnostic.trim() === "") {
    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Diagnostic médical</h3>
          </div>
        </div>
        <div className="p-4 text-center">
          <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-900 mb-1">En attente du diagnostic</p>
          <p className="text-xs text-slate-600">Le médecin n'a pas encore saisi votre diagnostic. Revenez plus tard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="p-3 bg-gradient-to-r from-blue-50 to-white border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Diagnostic médical</h3>
          </div>
          {!isPaid && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full">
              <Lock className="w-3 h-3" />
              <span className="text-xs font-medium">Contenu verrouillé</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative">
        {/* Contenu avec effet blur si non payé */}
        <div className={`p-3 ${!isPaid ? 'blur-sm select-none' : ''}`}>
          <div className="space-y-3">
            <p className="text-sm text-slate-700 leading-relaxed">
              {isPaid ? diagnostic : 'Le patient présente des symptômes caractéristiques d\'une pathologie courante. L\'examen clinique révèle plusieurs indicateurs importants nécessitant une attention particulière.'}
            </p>
            {!isPaid && (
              <>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Après analyse approfondie des symptômes et des antécédents médicaux, 
                  le diagnostic suivant a été établi avec les recommandations appropriées pour le traitement.
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Un suivi régulier sera nécessaire afin de surveiller l'évolution de l'état de santé 
                  et ajuster le traitement si nécessaire.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
