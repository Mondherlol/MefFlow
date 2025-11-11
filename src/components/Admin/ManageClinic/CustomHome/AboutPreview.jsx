import React, { useEffect, useState } from "react";
import { Users, Star, Clock, MapPin, UploadCloud, Save, Loader } from "lucide-react";
import { useClinic } from "../../../../context/clinicContext";
import api from "../../../../api/axios";
import toast from "react-hot-toast";
import { getImageUrl } from "../../../../utils/image";

export default function AboutPreview({ colors }) {
  const { clinic, setClinic } = useClinic();
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!image) { setPreview(null); return; }
    if (typeof image === "string") { setPreview(image); return; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  // Initialize from clinic
  useEffect(() => {
    setText(clinic?.about_text || "");
    setImage(clinic?.about_image_url ? getImageUrl(clinic.about_image_url) : null);
  }, [clinic]);

  const onSave = async () => {
    try {
      const form = new FormData();
      if (image instanceof File) {
        form.append("about_image", image);
      }
      form.append("about_text", text);
      setLoading(true);
      const response = await api.patch(`/api/clinics/${clinic.id}/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200 && response.data) {
        setClinic(response.data);
      }
      toast.success("À propos sauvegardé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde de la section À propos");
      console.error("Erreur Sauvegarde About :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* PREVIEW */}
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-xl font-semibold mb-6">À propos de notre clinique</h3>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="w-full h-64 md:h-72 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              {preview ? (
                <img src={preview} alt="about" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-slate-400">Aperçu image</div>
              )}
            </div>
            <div className="space-y-4">
              <p className="text-sm md:text-base leading-relaxed text-slate-700">
                {text || `Notre clinique s'engage à fournir des soins d'excellence...`}
              </p>
              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <Badge icon={Users}>Équipe expérimentée</Badge>
                <Badge icon={Star}>Qualité certifiée</Badge>
                <Badge icon={Clock}>Urgences 24/7</Badge>
                <Badge icon={MapPin}>Accès facile</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FORM */}
      <aside className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label className="block text-sm font-medium text-slate-700">Texte “À propos”</label>
          <textarea rows={6} value={text} onChange={(e)=>setText(e.target.value)}
                    placeholder="Présentez brièvement la clinique..."
                    className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-200" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label className="block text-sm font-medium text-slate-700">Image</label>
          <label className="mt-1 inline-flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <UploadCloud className="w-4 h-4" /> Choisir une image
            <input type="file" accept="image/*" className="sr-only" onChange={(e)=>setImage(e.target.files?.[0]||null)} />
          </label>
        </div>
        <button type="button" onClick={onSave}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: colors.primary }}
                disabled={loading}>
          { !loading ? (
            <>
              <Save className="w-4 h-4" /> Enregistrer “À propos”
            </>
          ) : (
            <>
              <Loader className="w-4 h-4 animate-spin" /> Sauvegarde en cours...
            </>
          ) }
        </button>
      </aside>
    </div>
  );
}

function Badge({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full ring-1 ring-slate-200 px-3 py-1 text-sm">
      <Icon className="w-4 h-4" /> {children}
    </span>
  );
}
