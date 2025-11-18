import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReceptionistTemplate from "../../components/Reception/ReceptionTemplate";
import WeekCalendar from "../../components/Calendar/WeekCalendar";
import api from "../../api/axios";
import { useClinic } from "../../context/clinicContext";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/image.jsx";
import { formatDateYMD, getMonday } from "../../utils/dateUtils";
import ModificationsPanel from "../../components/Reception/ModificationsPanel/ModificationsPanel";
import EditConsultationFloatingForm from "../../components/Reception/EditConsultationFloatingForm";


export default function PlanningMedecin() {
  const { id } = useParams();
  const { clinic, theme } = useClinic() || {};

  const primaryColor = theme?.primary || "#06b6d4";

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(false);

  const [schedules, setSchedules] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [loadingConsultations, setLoadingConsultations] = useState(false);

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [editMode, setEditMode] = useState(false);
  const [modified, setModified] = useState({}); // { [id]: { original, modified } }
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  useEffect(() => {
    console.log("Modified consultations:", modified);
  }, [modified]);

  useEffect(() => {
    if (!id) return;
    fetchDoctor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // when doctor or weekStart changes, reload schedules & consultations
    if (!doctor) return;
    fetchSchedules(doctor.id);
    const start = formatDateYMD(weekStart);
    const end = formatDateYMD(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6));
    fetchConsultationsByDoctorBetweenDates(doctor.id, start, end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor, weekStart]);

  async function fetchDoctor() {
    try {
      setLoadingDoctor(true);
      const res = await api.get(`/api/doctors/${id}/`);
      const data = res.data?.data || res.data || null;
      setDoctor(data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les informations du médecin");
    } finally {
      setLoadingDoctor(false);
    }
  }

  async function fetchSchedules(doctorId) {
    try {
      setLoadingSchedules(true);
      const res = await api.get(`/api/doctors/${doctorId}/schedules/`);
      setSchedules(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les horaires du médecin");
    } finally {
      setLoadingSchedules(false);
    }
  }

  const fetchConsultationsByDoctorBetweenDates = async (doctorId, startDate, endDate) => {
    setLoadingConsultations(true);
    try {
      const formatedStart = formatDateYMD(new Date(startDate));
      const formatedEnd = formatDateYMD(new Date(endDate));
      const res = await api.get(`/api/consultations/by-doctor/?doctor=${doctorId}&week_start=${formatedStart}&week_end=${formatedEnd}&perPage=200`);
      const fetched = res.data?.data || res.data || [];
      // overlay any local modifications so they persist across week changes
      // and also include locally-moved consultations whose modified.date
      // falls inside the requested range but which the server doesn't
      // return (because the change hasn't been saved server-side yet).
      const byId = { ...(modified || {}) };
      if (Object.keys(byId).length > 0) {
        // first, overlay modifications for items returned by the server
        let merged = fetched.map((c) => {
          const m = byId[c.id] || byId[String(c.id)];
          if (!m) return c;
          return { ...c, ...m.modified };
        });

        // then, inject modified entries that now belong to this week
        const startYMD = formatDateYMD(new Date(startDate));
        const endYMD = formatDateYMD(new Date(endDate));

        Object.values(byId).forEach((entry) => {
          const mod = entry.modified;
          if (!mod) return;
          const modDateRaw = mod.date || mod.start || mod.date;
          if (!modDateRaw) return;
          const modYMD = formatDateYMD(new Date(modDateRaw));
          if (modYMD >= startYMD && modYMD <= endYMD) {
            const exists = merged.some((c) => String(c.id) === String(mod.id));
            if (!exists) {
              merged.push({ ...mod });
            }
          }
        });

        setConsultations(merged);
      } else {
        setConsultations(fetched);
      }
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les consultations du médecin");
    } finally {
      setLoadingConsultations(false);
    }
  };

  const availabilityForCalendar = useMemo(() => {
    return (schedules || []).map((s) => ({ id: s.id, weekday: s.weekday, slots: s.slots }));
  }, [schedules]);

  function prevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(getMonday(d));
  }
  function nextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(getMonday(d));
  }

  // handler called by WeekCalendar when a consultation is moved/edited
  function handleCalendarChange(payload) {
    // payload can be a single object or an array of objects.
    if (!editMode) {
      toast("Activez le mode édition");
      return;
    }

    const hhmmToMinutes = (s) => {
      if (!s) return 0;
      const [h, m] = (s || "00:00").split(":").map((n) => parseInt(n, 10));
      return (h || 0) * 60 + (m || 0);
    };
    const minutesToHhmm = (min) => {
      const h = Math.floor(min / 60);
      const m = min % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    const handleOne = (updated) => {
      if (!updated) return;
      const idKey = updated.id || updated.id_consultation || updated.consultation_id || (updated.consultation && updated.consultation.id);
      if (!idKey) {
        console.warn("Calendar change: missing id", updated);
        return;
      }

      const normalized = { ...updated };

      // update consultations state and capture original only if something changed
      setConsultations((prev) => {
        const idx = prev.findIndex((c) => String(c.id) === String(idKey));
        const original = idx >= 0 ? prev[idx] : null;
        if (!original) return prev;

        const fieldsToCheck = ["date", "start", "heure_debut", "heure_fin", "start_time", "end_time"];
        const changed = fieldsToCheck.some((f) => {
          if (normalized[f] === undefined) return false;
          return String(normalized[f]) !== String(original[f]);
        });

        if (!changed) return prev;

        // compute original duration in minutes
        let origDuration = 0;
        if (original.heure_debut && original.heure_fin) {
          origDuration = hhmmToMinutes(original.heure_fin) - hhmmToMinutes(original.heure_debut);
        } else if (original.start && original.end) {
          origDuration = hhmmToMinutes(original.end) - hhmmToMinutes(original.start);
        } else if (original.doctor && Number.isFinite(original.doctor.duree_consultation)) {
          origDuration = Number(original.doctor.duree_consultation);
        } else if (Number.isFinite(original.duration)) {
          origDuration = Number(original.duration);
        }
        if (!Number.isFinite(origDuration) || origDuration <= 0) origDuration = 15;

        // determine new start string
        const newStart = normalized.heure_debut || normalized.start || normalized.start_time || original.heure_debut || original.start;
        // compute new end based on original duration
        const newEnd = minutesToHhmm(hhmmToMinutes(newStart) + origDuration);

        // include heure_fin so normalizedConsultations preserves duration after move
        const normalizedWithEnd = { ...normalized, heure_fin: newEnd, end: newEnd };

        const modifiedObj = { ...(original || {}), ...normalizedWithEnd };

        // store in modified map
        setModified((mPrev) => ({ ...mPrev, [idKey]: { original, modified: modifiedObj } }));

        const next = [...prev];
        next[idx] = { ...next[idx], ...normalizedWithEnd };
        return next;
      });
    };

    if (Array.isArray(payload)) {
      payload.forEach((p) => handleOne(p));
    } else {
      handleOne(payload);
    }
  }

  function handleEventClick(ev) {
    if (!editMode) return;
    // ev is the raw consultation object from server
    setSelectedConsultation(ev);
  }

  function handleCancelEdits() {
    // Revert any local modifications stored in `modified` back into the
    // `consultations` state so the visible calendar shows the original
    // server values for the current week when the user cancels editing.
    setConsultations((prev) => {
      const byId = { ...(modified || {}) };
      if (Object.keys(byId).length === 0) return prev;

      return prev.map((c) => {
        const key = c.id || String(c.id);
        const entry = byId[c.id] || byId[key];
        return entry ? { ...entry.original } : c;
      });
    });

    setModified({});
    setEditMode(false);
  }

  function handleCancelModification(idKey) {
    if (!idKey) return;
    setModified((prev) => {
      const copy = { ...prev };
      delete copy[idKey];
      return copy;
    });
  }

  function handleRevertModification(idKey) {
    if (!idKey) return;
    setModified((prev) => {
      const copy = { ...prev };
      const entry = copy[idKey];
      if (!entry) return prev;

      setConsultations((cPrev) => {
        const idx = cPrev.findIndex((c) => String(c.id) === String(idKey));
        if (idx === -1) return cPrev;
        const next = [...cPrev];
        next[idx] = { ...entry.original };
        return next;
      });

      delete copy[idKey];
      return copy;
    });
  }

  function handleCloseEditForm() {
    setSelectedConsultation(null);
  }

  // Called after EditConsultationFloatingForm saves successfully
  function handleSavedFromForm(entry, apiResponse) {
    // entry: { original, modified }
    const idKey = entry.modified.id || entry.modified.id_consultation || entry.modified.consultation_id || entry.original?.id;
    if (!idKey) return;

    // store in modified map
    setModified((mPrev) => ({ ...mPrev, [idKey]: { original: entry.original, modified: entry.modified } }));

    // update consultations array
    setConsultations((prev) => prev.map((c) => (String(c.id) === String(idKey) ? { ...c, ...entry.modified } : c)));
  }

  async function saveSettings() {
    const entries = Object.values(modified);
    const promises = entries.map((e) => {
      const idVal = e.modified.id || e.modified.id_consultation || e.modified.consultation_id || e.id;
      if (!idVal) return Promise.resolve(null);

      const payload = {};
      // support both english and french time fields
      if (e.modified.date && e.original && e.modified.date !== e.original.date) payload.date = e.modified.date;
      if (e.modified.start && e.original && e.modified.start !== e.original.start) payload.start = e.modified.start;
      if (e.modified.heure_debut && e.original && e.modified.heure_debut !== e.original.heure_debut) payload.heure_debut = e.modified.heure_debut;
      if (e.modified.heure_fin && e.original && e.modified.heure_fin !== e.original.heure_fin) payload.heure_fin = e.modified.heure_fin;

      if (Object.keys(payload).length === 0) return Promise.resolve(null);

      return api.patch(`/api/consultations/${idVal}/`, payload).then((res) => ({ id: idVal, res: res.data || res }));
    });

    return Promise.all(promises);
  }

  async function handleSave() {
    try {
      await toast.promise(
        saveSettings(),
        {
          loading: "Sauvegarde...",
          success: <b>Consultations modifiées avec succès !</b>,
          error: <b>Impossible de sauvegarder.</b>,
        }
      );

      // update consultations state with modified values where present
      setConsultations((prev) => {
        const byId = { ...modified };
        return prev.map((c) => {
          const m = byId[c.id] || byId[String(c.id)];
          if (!m) return c;
          return { ...c, ...m.modified };
        });
      });

      setModified({});
      setEditMode(false);
    } catch (err) {
      console.error(err);
    }
  }

  

  return (
    <ReceptionistTemplate
      title={doctor ? `Planning — ${doctor.user?.full_name || "Médecin"}` : "Planning du médecin"}
      breadcrumbs={[
        { label: "Accueil réception", to: "/reception" },
        { label : "Médecins", to: "/reception/doctors" },
        { label: `Planning — ${doctor?.user?.full_name || "Médecin"}`, current: true },
      ]}
    >
      <div className="space-y-6 relative">
        {/* Floating doctor card */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-1/3 max-w-5xl z-20">
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-3xl p-3 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-full grid place-items-center text-white font-semibold text-lg" style={{ backgroundColor: primaryColor }}>
                  {doctor?.user?.photo_url ? (
                    <img src={getImageUrl(doctor.user.photo_url)} alt={doctor?.user?.full_name} className="w-14 h-14 rounded-full object-cover" style={{ border: "2px solid rgba(255,255,255,0.6)" }} />
                  ) : (
                    <div className="w-14 h-14 rounded-full grid place-items-center">{(doctor?.user?.full_name || "MD").split(" ").map(s => s[0] || "").slice(0,2).join("")}</div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-slate-900 truncate">{doctor?.user?.full_name || "—"}</div>
                  <div className="text-sm text-slate-500 truncate">Durée Consultation : {doctor?.duree_consultation ? `~${doctor.duree_consultation} min` : "—"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-sky-600 text-white shadow"
                  >
                    Modifier les RDV
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-emerald-600 text-white shadow">Sauvegarder</button>
                    <button onClick={handleCancelEdits} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-slate-100">Annuler</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Emploi du médecin</div>
            <div className="flex items-center gap-2">
              <button onClick={prevWeek} className="px-3 py-1 rounded-md bg-slate-50">Semaine précédente</button>
              <button onClick={nextWeek} className="px-3 py-1 rounded-md bg-slate-50">Semaine suivante</button>
            </div>
          </div>

          <WeekCalendar
            weekStart={weekStart}
            onPrevWeek={prevWeek}
            onNextWeek={nextWeek}
            hours={{ start: 8, end: 18 }}
            slotMinutes={15}
            consultations={consultations}
            availability={availabilityForCalendar}
            loading={loadingSchedules || loadingConsultations}
            onChange={handleCalendarChange}
            onEventClick={handleEventClick}
            editMode={editMode}
          />
        </div>
        {/* Floating modifications panel on the right (extracted component) */}
        <ModificationsPanel
          modified={modified}
          onCancelModification={handleCancelModification}
          onRevertModification={handleRevertModification}
          editing={Boolean(selectedConsultation && editMode)}
        />
        {selectedConsultation && editMode && (
          <EditConsultationFloatingForm
            consultation={selectedConsultation}
            onClose={handleCloseEditForm}
            onSaved={(entry, apiResp) => handleSavedFromForm(entry, apiResp)}
            autoSave={false}
            allowDurationEdit={false}
          />
        )}
      </div>
    </ReceptionistTemplate>
  );
}