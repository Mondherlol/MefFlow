import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useClinic } from "../../context/clinicContext";
import { CalendarDays, PlusCircle } from "lucide-react";

function formatDateYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function nowTimeRounded() {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
  return d.toTimeString().slice(0, 5);
}

export default function FloatingConsultationForm({ selectedDoctor, selectedSlot, onCreated }) {
  const { clinic } = useClinic() || {};
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const patientId = params.get("patientId") || "";

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  const [date, setDate] = useState(() => (selectedSlot ? selectedSlot.date : formatDateYMD(new Date())));
  const [time, setTime] = useState(() => (selectedSlot ? selectedSlot.start : nowTimeRounded()));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!patientId || !clinic?.id) return;
    setLoadingPatient(true);
    api
      .get(`/api/clinics/${clinic.id}/patients/${patientId}`)
      .then((res) => setPatient(res.data.data || res.data || null))
      .catch((err) => {
        console.error(err);
        toast.error("Impossible de récupérer les informations du patient");
      })
      .finally(() => setLoadingPatient(false));
  }, [patientId, clinic?.id]);

  useEffect(() => {
    if (selectedSlot) {
      setDate(selectedSlot.date);
      setTime(selectedSlot.start);
    }
  }, [selectedSlot]);

  const doctorLabel = selectedDoctor?.user?.full_name || "—";
  const tarif = selectedDoctor?.tarif_consultation || selectedDoctor?.tarif || "—";
  const duree = selectedDoctor?.duree_consultation || selectedDoctor?.duree || "—";

  async function handleCreate(e) {
    e?.preventDefault?.();
    if (!patientId) return toast.error("Patient non spécifié (patientId manquant)");
    if (!selectedDoctor) return toast.error("Veuillez sélectionner un médecin");
    if (!date || !time) return toast.error("Date et heure requises");

    const payload = {
      date,
      heure_debut: time,
      diagnostique: "",
      ordonnance: "",
      doctor: selectedDoctor.id,
      patient: patientId,
      note,
    };

    try {
      setSubmitting(true);
      await api.post(`/api/consultations`, payload);
      toast.success("Consultation créée");
      if (onCreated) onCreated();
      else navigate("/reception/consultations");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la création de la consultation");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 w-full max-w-4xl px-4">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-slate-100 p-4 flex items-center gap-4">
        <div className="shrink-0">
          <div className="h-12 w-12 rounded-lg bg-sky-50 grid place-items-center text-sky-600">
            <CalendarDays size={20} />
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          <div className="md:col-span-1">
            <label className="text-xs text-slate-500">Patient</label>
            <div className="mt-1 font-medium text-slate-900 truncate">
              {loadingPatient ? "Chargement…" : patient?.user?.full_name || patient?.user?.email || "ID: " + (patientId || "—")}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500">Date</label>
            <input type="date" className="mt-1 rounded-md border px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-slate-500">Heure</label>
            <input type="time" className="mt-1 rounded-md border px-3 py-2" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-slate-500">Médecin</label>
            <div className="mt-1 font-medium text-slate-900 truncate">{doctorLabel}</div>
            <div className="text-xs text-slate-500">{duree} min · {tarif} TND</div>
          </div>
        </div>

        <div className="w-64 ml-2">
          <label className="text-xs text-slate-500">Note (optionnel)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Courte note pour le médecin" />
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => { setNote(""); navigate(-1); }}
            className="px-3 py-2 rounded-md border text-slate-700 bg-white"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="px-4 py-2 rounded-md bg-sky-600 text-white flex items-center gap-2"
          >
            <PlusCircle size={16} />
            {submitting ? "Création…" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
