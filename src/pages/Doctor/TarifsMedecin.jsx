import React, { useState, useEffect, useMemo } from "react";
import MedecinTemplate from "../../components/Doctor/MedecinTemplate";
import { useAuth } from "../../context/authContext";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Save, Clock, DollarSign } from "lucide-react";
import { useClinic } from "../../context/clinicContext";

export default function TarifsMedecin() {
  const { user } = useAuth() || {};
  const {clinic } = useClinic() || {};
  const doctor = user?.doctor ?? {};

  const [duration, setDuration] = useState(doctor.duree_consultation ?? 15);
  const [price, setPrice] = useState(doctor.tarif_consultation ?? 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDuration(doctor.duree_consultation ?? 15);
    setPrice(doctor.tarif_consultation ?? 0);
  }, [doctor?.duree_consultation, doctor?.tarif_consultation]);

  const primaryGradient = useMemo(() => {
    const p = "#0ea5e9";
    const s = "#6366f1";
    return { backgroundColor: p, background: `linear-gradient(135deg, ${p} 0%, ${s} 100%)` };
  }, []);

  // validation derived state
  const durNum = Number(duration) || 0;
  const priceNum = Number(price) || 0;
  const durationError = durNum < 5 || durNum > 60;
  const priceError = priceNum <= 0;
  const formValid = !durationError && !priceError && !saving;

  const handleSave = async () => {
    if (!user?.doctor?.id) return toast.error("Impossible d'identifier le médecin.");
    // validate duration bounds
    const dur = Number(duration) || 0;
    if (dur < 5 || dur > 60) return toast.error("La durée doit être comprise entre 5 et 60 minutes.");
    const payload = {
      duree_consultation: Number(duration) || 0,
      tarif_consultation: Number(price) || 0,
      clinic_id : clinic?.id,
    };

    setSaving(true);
    try {
      const res = await api.patch(`/api/doctors/${user.doctor.id}/`, payload);
      toast.success("Tarifs enregistrés");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Erreur lors de la mise à jour des tarifs.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MedecinTemplate title="Tarifs" breadcrumbs={[{ label: "Accueil médecin", to: "/doctor" }, { label: "Tarifs", current: true }]}>
      <div className="min-h-[80dvh] p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="bg-linear-to-r from-slate-50 to-slate-100/60 px-6 py-4 border-b border-slate-200/60">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                Configuration des tarifs
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Définissez la durée et le tarif de vos consultations
              </p>
            </div>
            
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Durée de consultation
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={5}
                      max={60}
                      step={5}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      disabled={saving}
                      placeholder="15"
                    />
                    {durationError && (
                      <div className="text-xs text-red-600 mt-2">La durée doit être comprise entre 5 et 60 minutes.</div>
                    )}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-400">
                      min
                    </div>
                  </div>
                </div>

                
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    Tarif de consultation
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={price}
                      onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      disabled={saving}
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-400">
                      DT
                    </div>
                    {priceError && (
                      <div className="text-xs text-red-600 mt-2">Le tarif doit être supérieur à 0 DT.</div>
                    )}
                  </div>
                </div>
              </div>

              
              
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200/60">
                <div className="text-sm text-slate-600">
                  <span className="font-medium">Résumé : </span>
                  Consultation de <span className="font-semibold text-slate-900">{duration} minutes</span> au tarif de <span className="font-semibold text-slate-900">{price} DT</span>
                </div>
              </div>

              
              
                <div className="mt-6 flex justify-end">
                <button
                  type="button"
                    onClick={handleSave}
                    disabled={!formValid}
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={primaryGradient}
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500 text-center">
            La durée définit le créneau standard pour vos rendez-vous
          </div>
        </div>
      </div>
    </MedecinTemplate>
  );
}