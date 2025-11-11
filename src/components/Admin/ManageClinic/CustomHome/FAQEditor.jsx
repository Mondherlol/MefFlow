import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, Loader } from "lucide-react";
import { useClinic } from "../../../../context/clinicContext";
import toast from "react-hot-toast";
import api from "../../../../api/axios";

export default function FAQEditor({ colors }) {
  const { clinic, setClinic } = useClinic();
  const normalizeFAQ = (faq) =>
    (faq || []).map((it) => ({
      question: it?.question ?? it?.q ?? "",
      reponse: it?.reponse ?? it?.a ?? "",
    }));

  const [items, setItems] = useState(() => normalizeFAQ(clinic?.faq));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(normalizeFAQ(clinic?.faq));
  }, [clinic]);

  const add = () => setItems((s) => [...s, { question: "", reponse: "" }]);
  const del = (i) => setItems((s) => s.filter((_, idx) => idx !== i));
  const edit = (i, key, val) =>
    setItems((s) => s.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));

  const onSave = async () => {
    if (!clinic?.id) {
      toast.error("Aucune clinique chargée");
      return;
    }
    try {
      setLoading(true);
      const payload = { faq: items };
      const response = await api.patch(`/api/clinics/${clinic.id}/`, payload);
      if (response.status === 200 && response.data) {
        setClinic(response.data);
        toast.success("FAQ sauvegardée");
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur sauvegarde FAQ:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">
          Rajoutez des questions fréquentes pour aider vos patients
        </h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {items.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-200 bg-white/50 px-4 py-6 text-center text-sm text-slate-500">Aucune question pour le moment — ajoutez-en une.</div>
        )}

        {items.map((it, i) => (
          <div key={i} className="relative rounded-lg bg-white p-4 shadow-sm border border-slate-100">
            <button
              type="button"
              onClick={() => del(i)}
              className="absolute top-3 right-3 inline-flex items-center justify-center rounded-md bg-slate-50 p-1 text-slate-500 hover:bg-slate-100"
              aria-label={`Supprimer question ${i + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <label className="block text-xs font-medium text-slate-600">Question</label>
            <input
              value={it.question}
              onChange={(e) => edit(i, "question", e.target.value)}
              placeholder="Ex: Comment prendre rendez-vous ?"
              className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-200"
            />

            <label className="mt-3 block text-xs font-medium text-slate-600">Réponse</label>
            <textarea
              rows={3}
              value={it.reponse}
              onChange={(e) => edit(i, "reponse", e.target.value)}
              placeholder="Depuis votre espace patient…"
              className="mt-1 block w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-200"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: colors.primary }}
          disabled={loading}
        >
          { !loading ? <><Save className="w-4 h-4" /> Enregistrer</> : <><Loader className="w-4 h-4 animate-spin" /> Sauvegarde...</> }
        </button>
      </div>
    </div>
  );
}
