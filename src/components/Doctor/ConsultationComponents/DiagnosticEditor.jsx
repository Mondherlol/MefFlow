import { FileText, Edit2, Save, X } from "lucide-react";

export default function DiagnosticEditor({ value, onChange, editMode, onEdit, onSave, onCancel, saving }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-semibold text-slate-900">Diagnostic médical</h2>
        </div>
        <div className="flex items-center gap-2">
          {!editMode ? (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition"
            >
              <Edit2 className="w-4 h-4" />
              Modifier
            </button>
          ) : (
            <>
              <button
                onClick={onSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
              <button
                onClick={onCancel}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </>
          )}
        </div>
      </div>
      
      {editMode ? (
        <div className="space-y-3">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Saisissez le diagnostic médical du patient...&#10;&#10;Exemples:&#10;- Symptômes observés&#10;- Examens réalisés&#10;- Conclusions&#10;- Recommandations"
            className="w-full h-32 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none text-sm"
          />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{value.length} caractères</span>
            <span className="text-slate-500">💡 Tip: Soyez précis et concis</span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 min-h-[8rem] whitespace-pre-wrap">
          {value || (
            <div className="flex flex-col items-center justify-center h-24">
              <FileText className="w-8 h-8 text-slate-300 mb-2" />
              <span className="text-slate-400">Aucun diagnostic saisi</span>
            </div>
          )}
        </div>
      )}

      {/* TODO: Add future features like:
          - Auto-complete suggestions
          - Templates for common diagnoses
          - Voice-to-text input
          - AI assistance
      */}
    </div>
  );
}
