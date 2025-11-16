import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useClinic } from "../../context/clinicContext";
import { CalendarDays, PlusCircle, X, Loader2 } from "lucide-react";
import { set } from "react-hook-form";

/* helpers */
function formatDateYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

  const getMondayOfDate = (d) => {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };


/* Floating form */
export default function FloatingConsultationForm({
  selectedDoctor,
  selectedSlot,
  consultationProvisoire,
  setConsultationProvisoire}) {
  const { clinic } = useClinic() || {};
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const patientId = params.get("patientId") || "";

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  const [date, setDate] = useState(() =>
    selectedSlot ? selectedSlot.date : formatDateYMD(getMondayOfDate(new Date()))
  );
  const [time, setTime] = useState(() =>
    selectedSlot ? selectedSlot.start : "08:00"
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});


  useEffect(() => {
    if (!patientId || !clinic?.id || !loadingPatient) return;
    api
      .get(`/api/patients/${patientId}/`)
      .then((res) => setPatient(res.data.data || res.data || null))
      .catch((err) => {
        toast.error("Impossible de récupérer les informations du patient");
        navigate("/reception");
      })
      .finally(() => setLoadingPatient(false));
  }, [patientId, clinic?.id]);

  useEffect(() => {
    if (selectedSlot) {
      setDate(selectedSlot.date);
      setTime(selectedSlot.start);
    }
  }, [selectedSlot]);


  useEffect(() => {
    setConsultationProvisoire((prev) => ({
      ...prev,
      date: date,
      start: time,
      title : patient ? `${patient.user.full_name}` : "",
      duree: selectedDoctor ? selectedDoctor.duree_consultation : prev?.duree,
    }));
  }, [time, date, selectedDoctor, patient]);

// Si on a modifié la consultation provisoire depuis l'extérieur, on met à jour les champs locaux
useEffect(() => {
  if (!consultationProvisoire) return;
  if (consultationProvisoire.date && consultationProvisoire.date !== date) {
    setDate(consultationProvisoire.date);
  }
  if (consultationProvisoire.start && consultationProvisoire.start !== time) {
    setTime(consultationProvisoire.start);
  }
}, [consultationProvisoire?.date, consultationProvisoire?.start]);


  const doctorLabel = selectedDoctor?.user?.full_name || "—";
  const tarif = selectedDoctor?.tarif_consultation || selectedDoctor?.tarif || "—";
  const duree = selectedDoctor?.duree_consultation || selectedDoctor?.duree || "—";

  const minDate = useMemo(() => formatDateYMD(new Date()), []);

  function validate() {
    const e = {};
    if (!patientId) e.patient = "Patient manquant";
    if (!selectedDoctor) e.doctor = "Médecin non sélectionné";
    if (!date) e.date = "Date requise";
    if (!time) e.time = "Heure requise";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCreate(e) {
    e?.preventDefault?.();
    if (!validate()) return toast.error("Vérifiez le formulaire");
    if (!patientId) return; // safety
    const payload = {
      date,
      heure_debut: time,
      diagnostique: "",
      ordonnance: "",
      doctor: selectedDoctor.id,
      patient: patientId,
    };

    try {
      setSubmitting(true);
      await api.post(`/api/consultations/`, payload);
      toast.success("Consultation créée");
      navigate("/reception/consultations");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Erreur lors de la création";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 w-full max-w-4xl px-4">
      <div
        className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-4 flex flex-col md:flex-row items-stretch gap-4
                   transition-transform transform hover:-translate-y-0.5"
        role="dialog"
        aria-label="Créer une consultation rapide"
      >
        {/* left: patient */}
        <div className="flex items-center gap-3 min-w-0 md:min-w-[220px]">
          <div className="h-14 w-14 rounded-md bg-sky-50 grid place-items-center text-sky-700 shrink-0">
            <CalendarDays size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-500">Patient</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="min-w-0">
                {loadingPatient ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-sm text-slate-500">Chargement…</span>
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold text-slate-900 truncate">
                      {patient?.user?.full_name || patient?.user?.email || `ID: ${patientId || "—"}`}
                    </div>
                    {patient?.user?.email && (
                      <div className="text-xs text-slate-500 truncate">{patient.user.email}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* middle: form fields */}
        <form
          onSubmit={handleCreate}
          className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center"
        >
          <div className="flex flex-col">
            <label className="text-xs text-slate-500">Date</label>
            <input
              type="date"
              className={`mt-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-sky-200 ${
                errors.date ? "border-red-300" : "border-slate-200"
              }`}
              value={date}
              min={minDate}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? "error-date" : undefined}
            />
            {errors.date && <div id="error-date" className="text-xs text-red-600 mt-1">{errors.date}</div>}
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-500">Heure</label>
            <input
              type="time"
              step={300}
              className={`mt-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-sky-200 ${
                errors.time ? "border-red-300" : "border-slate-200"
              }`}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-invalid={!!errors.time}
              aria-describedby={errors.time ? "error-time" : undefined}
            />
            {errors.time && <div id="error-time" className="text-xs text-red-600 mt-1">{errors.time}</div>}
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-500">Médecin</label>
            <div className="mt-1">
              <div className="font-medium text-slate-900 truncate">{doctorLabel}</div>
              <div className="text-xs text-slate-500">
                {duree} min · {tarif} {clinic?.currency || "TND"}
              </div>
              {errors.doctor && <div className="text-xs text-red-600 mt-1">{errors.doctor}</div>}
            </div>
          </div>

      
        </form>

        {/* actions */}
        <div className="flex items-center gap-2 justify-end md:justify-center shrink-0">
          <button
            onClick={handleCreate}
            disabled={submitting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition ${
              submitting ? "bg-sky-400 cursor-wait" : "bg-sky-600 hover:brightness-95"
            }`}
            aria-disabled={submitting}
            title="Créer la consultation"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />}
            <span>{submitting ? "Création…" : "Créer"}</span>
          </button>

    
        </div>
      </div>
    </div>
  );
}
