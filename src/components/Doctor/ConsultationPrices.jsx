import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/authContext";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Save } from "lucide-react";

function ConsultationPrices({ onSaved }) {
    const { user } = useAuth() || {};
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

    const handleSave = async () => {
        if (!user?.doctor?.id) return toast.error("Impossible d'identifier le médecin.");
        const payload = {
            duree_consultation: Number(duration) || 0,
            tarif_consultation: Number(price) || 0,
        };

        setSaving(true);
        try {
            const res = await api.patch(`/api/doctors/${user.doctor.id}/`, payload);
            toast.success("Tarifs enregistrés");
            if (onSaved) onSaved(res.data ?? res.data?.data ?? {});
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message ?? "Erreur lors de la mise à jour des tarifs.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-900">Tarifs et durée de consultation</h2>
                    <p className="text-sm text-slate-500 mt-1">Définissez la durée moyenne et le tarif appliqué à cette durée.</p>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block">
                            <div className="text-sm text-slate-600 mb-1">Durée moyenne (minutes)</div>
                            <input
                                type="number"
                                min={1}
                                step={1}
                                value={duration}
                                onChange={(e) => setDuration(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
                                disabled={saving}
                            />
                        </label>

                        <label className="block">
                            <div className="text-sm text-slate-600 mb-1">Tarif pour cette durée ({'€'})</div>
                            <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={price}
                                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
                                disabled={saving}
                            />
                        </label>
                    </div>
                </div>

                <div className="flex-shrink-0 self-center">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-3 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        style={primaryGradient}
                    >
                        <Save className="w-4 h-4" />
                        <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConsultationPrices;