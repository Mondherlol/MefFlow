import React from "react";
import { Shield } from "lucide-react";

export default function AutoDiagnosticCard({ autoDiagnostic }) {
  if (!autoDiagnostic) return null;

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
        <Shield className="w-4 h-4 text-blue-600" />
        Auto-diagnostic
      </h3>
      <div className="space-y-2">
        {autoDiagnostic.symptoms?.slice(0, 3).map((symptom, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
            <span className="text-xs text-slate-700 truncate flex-1">{symptom.symptomeName}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 ml-2 whitespace-nowrap">
              {symptom.intensite}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
