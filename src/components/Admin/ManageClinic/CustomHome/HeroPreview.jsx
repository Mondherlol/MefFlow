import { useEffect, useState } from "react";
import { CalendarCheck, ArrowRight, ShieldCheck, Star, UploadCloud, Save, Loader } from "lucide-react";
import { withAlpha } from "../../../../utils/colors";
import { useClinic } from "../../../../context/clinicContext";
import {getImageUrl} from "../../../../utils/image";
import toast from "react-hot-toast";
import api from "../../../../api/axios";


export default function HeroPreview({ colors}) {
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  const {clinic, setClinic} = useClinic();
  const [loading, setLoading] = useState(false);

 const onSave = async () => {
    try {
    // Mettre api en multi part form data
    const form = new FormData();
    console.log("Image to upload:", image);
    if(image instanceof File) {
        form.append('hero_image', image);
    }
    form.append('slogan', title);
    form.append('subtitle', subtitle);
    setLoading(true);
    const response = await api.patch(`/api/clinics/${clinic.id}/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    if(response.status == 200 && response.data) {
        setClinic(response.data);
    }

    toast.success("Hero sauvegardé avec succès");
    } catch (error) {
        toast.error("Erreur lors de la sauvegarde du hero");
        console.log("Erreur Sauvegarde hero :", error);
    } finally {
        setLoading(false);
    }
  };


  useEffect(() => {
    if (!image) { setPreview(null); return; }
    if (typeof image === "string") { setPreview(image); return; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  useEffect(() => {
    console.log("Clinic updated in HeroPreview:", clinic);
    setTitle(clinic?.slogan || "");
    setSubtitle(clinic?.subtitle || "");
    setImage(clinic?.hero_image_url? getImageUrl(clinic.hero_image_url) : null);
  }, [clinic]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* PREVIEW */}
      <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm">
        <div className="relative">
          <div className="absolute inset-0 overflow-hidden rounded-b-[2rem]">
            {preview ? (
              <img src={preview} alt="hero" className="w-full h-72 object-cover rounded-b-[2rem]" />
            ) : (
              <div className="w-full h-72 rounded-b-[2rem]"
                   style={{ background: `linear-gradient(135deg, ${withAlpha(colors.primary,.9)} 0%, ${withAlpha(colors.secondary,.9)} 100%)` }} />
            )}
            <div className="absolute inset-0 rounded-b-[2rem]" style={{ background: `linear-gradient(180deg, ${withAlpha('#000',.35)} 0%, ${withAlpha('#000',.55)} 65%, ${withAlpha('#000',.65)} 100%)` }} />
          </div>

          <div className="relative px-6 py-8 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-3 flex items-center justify-center gap-2 text-white/90">
                <span className="inline-flex items-center gap-1 text-xs ring-1 ring-white/30 px-2 py-1 rounded-full">
                  <ShieldCheck className="w-4 h-4" /> Clinique certifiée
                </span>
                <span className="inline-flex items-center gap-1 text-xs ring-1 ring-white/30 px-2 py-1 rounded-full">
                  <Star className="w-4 h-4" /> 4,9/5 patients satisfaits
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">{title || "Votre santé, notre priorité"}</h3>
              <p className="text-sm md:text-base text-white/90 mb-4">{subtitle || "Des soins de qualité dans un environnement chaleureux."}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="inline-flex items-center gap-2 text-sm text-white px-4 py-2 rounded-lg"
                        style={{ backgroundColor: colors.accent }}>
                  <CalendarCheck className="w-4 h-4" /> Prendre rendez-vous
                </button>
                <button className="inline-flex items-center gap-2 text-sm border-2 text-white px-4 py-2 rounded-lg"
                        style={{ borderColor: "white" }}>
                  Nos services <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FORM */}
      <aside className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label className="block text-sm font-medium text-slate-700">Titre (slogan)</label>
          <input value={title} onChange={(e)=>setTitle(e.target.value)}
                 placeholder="Votre santé, notre priorité"
                 className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-200" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label className="block text-sm font-medium text-slate-700">Sous-titre</label>
          <textarea rows={3} value={subtitle} onChange={(e)=>setSubtitle(e.target.value)}
                    placeholder="Des soins médicaux de qualité..."
                    className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-200" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label className="block text-sm font-medium text-slate-700">Image de fond</label>
          <label className="mt-1 inline-flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <UploadCloud className="w-4 h-4" /> Choisir une image
            <input type="file" accept="image/*" className="sr-only" onChange={(e)=>setImage(e.target.files?.[0]||null)} />
          </label>
        </div>
        <button type="button" onClick={onSave}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: colors.primary }}
                disabled={loading}>
            { !loading ? <>
          <Save className="w-4 h-4" /> Enregistrer le Hero</>
            :
            <>
            <Loader className="w-4 h-4 animate-spin" /> Sauvegarde en cours...
            </>
            }
        </button>
      </aside>
    </div>
  );
}
