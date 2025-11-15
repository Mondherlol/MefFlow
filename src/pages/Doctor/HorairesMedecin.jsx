import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/authContext";
import {
  Calendar,
  Save,
  Bed,
} from "lucide-react";
import toast from "react-hot-toast";
import SlotModal from "../../components/Admin/ManageClinic/Horaires/SlotModal";
import api from "../../api/axios";
import ScheduleGrid from "../../components/Schedules/ScheduleGrid";
import { toMin, toHHMM, sortSlots, DAYS, defaultInterval } from "../../utils/horairesUtils";
import MedecinTemplate from "../../components/Doctor/MedecinTemplate";

export default function DoctorHoraires() {
  const { user } = useAuth() || {};

  const [schedules, setSchedules] = useState(() => []);
  const [isLoading, setIsLoading] = useState(true);

  // saving indicators per weekday (Set of numbers)
  const [savingWeekdays, setSavingWeekdays] = useState(() => new Set());

  // pending debounce timers per weekday
  const saveTimersRef = useRef(new Map());

  // JSP trop ça regle un bug bizarre
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      saveTimersRef.current.forEach((t) => clearTimeout(t));
      saveTimersRef.current.clear();
    };
  }, []);

  // Fetch schedules for the doctor
  useEffect(() => {
    let cancelled = false;
    const fetchSchedules = async () => {
      setIsLoading(true);
      let areClinicDefaults = false;
      try {
        const res = await api.get(`/api/doctors/${user?.doctor?.id}/schedules/`);
        const arr = res.data.data;

        if(arr.length === 0) {
          // On recupere les horaires par defaut de la clinique
          const resClinic =  await api.get(`/api/clinics/${user?.clinic?.id}/schedules/`);
          const arrClinic = resClinic.data.data;
          arr.push(...arrClinic);
          areClinicDefaults = true;
        }
        const byWeek = {};
        arr.forEach((s) => {
          if (!s) return;
          const w = Number(s.weekday);
          byWeek[w] = { ...s, weekday: w, slots: Array.isArray(s.slots) ? s.slots : [] };
        });
        const normalized = Array.from({ length: 7 }).map((_, i) => byWeek[i] ?? null);
        if (!cancelled && mountedRef.current) setSchedules(normalized);


        // Si c'est les horaires cliniques on les save pour le medecin
        if (areClinicDefaults) {
          arr.forEach((schedule) => {
            if (!schedule) return;
            saveScheduleToApi({ ...schedule, doctor: user?.doctor?.id });
          });
        }
      } catch (err) {
        console.error(err);
        toast.error(
          err?.response?.data?.message ?? "Une erreur est survenue lors de la récupération des horaires du médecin."
        );
      } finally {
        if (!cancelled && mountedRef.current) setIsLoading(false);
      }
    };
    fetchSchedules();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const markSaving = useCallback((weekday, on = true) => {
    setSavingWeekdays((prev) => {
      const next = new Set(prev);
      if (on) next.add(Number(weekday));
      else next.delete(Number(weekday));
      return next;
    });
  }, []);

  const saveScheduleToApi = useCallback(
    async (schedule) => {
      if (!user) return;
      markSaving(schedule.weekday, true);
      try {
        const payload = { ...schedule, slots: Array.isArray(schedule.slots) ? schedule.slots : [] };
      
          const body = { ...payload, doctor: user?.doctor?.id };
          const res = await api.post(`/api/doctor-schedules/`, body);
          const returned = res.data ?? res.data?.data ?? {};
          setSchedules((prev) =>
            prev.map((s) => (s && Number(s.weekday) === Number(schedule.weekday) ? { ...s, ...returned } : s))
          );
        
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors de la sauvegarde des horaires du médecin");
      } finally {
        markSaving(schedule.weekday, false);
      }
    },
    [user, markSaving]
  );

  // Schedule a save (after debounce)
  const scheduleSave = useCallback(
    (weekday, schedule, delay = 700) => {
      const timers = saveTimersRef.current;
      const key = String(weekday);
      if (timers.has(key)) clearTimeout(timers.get(key));
      const t = setTimeout(() => {
        timers.delete(key);
        saveScheduleToApi(schedule);
      }, delay);
      timers.set(key, t);
    },
    [saveScheduleToApi]
  );

  // flush all pending saves immediately
  const flushPendingSaves = useCallback(() => {
    const timers = saveTimersRef.current;
    const toFlush = Array.from(timers.keys());
    toFlush.forEach((key) => {
      const t = timers.get(key);
      clearTimeout(t);
      timers.delete(key);
      const weekday = Number(key);
      const s = schedules.find((x) => x && Number(x.weekday) === weekday);
      if (s) saveScheduleToApi(s);
    });
  }, [schedules, saveScheduleToApi]);

  // delete schedule API
  const deleteScheduleApi = useCallback(
    async (schedule) => {
      if (!schedule?.id) return;
      markSaving(schedule.weekday, true);
      try {
        await api.delete(`/api/doctor-schedules/${schedule.id}/`);
        setSchedules((prev) => prev.map((s) => (s && Number(s.weekday) === Number(schedule.weekday) ? null : s)));
        toast.success("Horaire supprimé");
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors de la suppression de l'horaire");
      } finally {
        markSaving(schedule.weekday, false);
      }
    },
    [markSaving]
  );

  const getDay = useCallback(
    (weekday) => {
      const arr = Array.isArray(schedules) ? schedules : [];
      const found = arr.find((s) => s && Number(s.weekday) === Number(weekday));
      if (found) return found;
      return null;
    },
    [schedules]
  );

  const setDay = useCallback(
    (weekday, newDay) => {
      setSchedules((prev = []) => {
        const exists = prev.some((s) => s && Number(s.weekday) === Number(weekday));
        let merged;
        if (exists) merged = prev.map((s) => (s && Number(s.weekday) === Number(weekday) ? newDay : s));
        else merged = prev.map((s, i) => (i === weekday ? newDay : s));
        return merged;
      });
      // schedule save using the object directly
      if (newDay) scheduleSave(weekday, newDay);
    },
    [scheduleSave]
  );

  // Actions
  const applyClinicDefaults = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/clinics/${user?.clinic?.id}/schedules/`);
      const arr = res.data.data;
      const byWeek = {};
      arr.forEach((s) => {
        if (!s) return;
        const w = Number(s.weekday);
        byWeek[w] = { ...s, weekday: w, slots: Array.isArray(s.slots) ? s.slots : [] };
      });
      const normalized = Array.from({ length: 7 }).map((_, i) => byWeek[i] ?? null);
      setSchedules(normalized);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'application des horaires par défaut de la clinique");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const clipboardRef = useRef(null);
  const [modalState, setModalState] = useState({
    open: false,
    dayId: null,
    index: null,
    initial: null,
    dayLabel: "",
    existingSlots: [],
    externalHandlers: null,
  });

  useEffect(() => {
    window.__openSlotModal = ({ dayLabel, initial, existingSlots = [], onSave, onDelete }) => {
      setModalState({
        open: true,
        externalHandlers: { onSave, onDelete },
        dayLabel,
        initial,
        existingSlots,
      });
    };
    return () => delete window.__openSlotModal;
  }, []);

  const openCreateForDay = useCallback((dayId) => {
    const day = getDay(dayId);
    const last = day?.slots?.[day?.slots?.length - 1];
    const start = last ? last.end : "09:00";
    const end = toHHMM(toMin(start) + 120);
    setModalState({
      open: true,
      dayId,
      index: null,
      initial: { start, end },
      dayLabel: DAYS.find((d) => d.id === dayId)?.label,
      existingSlots: day?.slots || [],
      externalHandlers: null,
    });
  }, [getDay]);

  const openEditSlot = useCallback((dayId, index) => {
    const day = getDay(dayId);
    const slot = day?.slots?.[index];
    setModalState({
      open: true,
      dayId,
      index,
      initial: slot,
      dayLabel: DAYS.find((d) => d.id === dayId)?.label,
      existingSlots: day?.slots || [],
      externalHandlers: null,
    });
  }, [getDay]);

  const closeModal = useCallback(() => {
    setModalState({ open: false, dayId: null, index: null, initial: null, dayLabel: "", existingSlots: [], externalHandlers: null });
  }, []);

  const saveSlotFromModal = useCallback((patch) => {
    const dayId = modalState.dayId;
    const d = getDay(dayId);
    const slots = [...(d?.slots || [])];
    if (modalState.index == null) slots.push(patch);
    else slots[modalState.index] = { ...slots[modalState.index], ...patch };
    const sorted = sortSlots(slots);
    const updated = { ...(d ?? { weekday: dayId }), weekday: dayId, slots: sorted };
    setDay(dayId, updated);
    closeModal();
  }, [modalState, getDay, setDay, closeModal]);

  const deleteSlotFromModal = useCallback(() => {
    const dayId = modalState.dayId;
    const d = getDay(dayId);
    const slots = (d?.slots || []).filter((_, i) => i !== modalState.index);
    if (slots.length === 0) {
      // remove entire schedule
      if (d?.id) deleteScheduleApi(d);
      setSchedules((prev) => prev.map((s) => (s && Number(s.weekday) === Number(dayId) ? null : s)));
    } else {
      const updated = { ...(d ?? { weekday: dayId }), weekday: dayId, slots };
      setDay(dayId, updated);
    }
    closeModal();
  }, [modalState, getDay, setDay, deleteScheduleApi, closeModal]);

  const toggleDay = useCallback(
    (id) => {
      const d = getDay(id);
      if (d) {
        // currently works -> delete
        if (d.id) deleteScheduleApi(d);
        else setSchedules((prev) => prev.map((s) => (s && Number(s.weekday) === Number(id) ? null : s)));
      } else {
        // create local schedule (will be POSTed)
        const created = { weekday: id, slots: [defaultInterval()] };
        setDay(id, created);
      }
    },
    [getDay, setDay, deleteScheduleApi]
  );

  const copyDay = useCallback((id) => {
    const d = getDay(id);
    if (!d) return toast.error("Aucun horaire à copier");
    clipboardRef.current = { ...d, slots: sortSlots(d.slots || []) };
    toast.success(`Horaires du ${DAYS.find((d) => d.id === id)?.label} copiés`);
  }, [getDay]);

  const pasteDay = useCallback((id) => {
    if (!clipboardRef.current) return toast.error("Aucun horaire copié");
    const pasted = { ...clipboardRef.current, weekday: id };
    setDay(id, pasted);
    toast.success(`Horaires collés sur le ${DAYS.find((d) => d.id === id)?.label}`);
  }, [setDay]);

  const saveAll = useCallback(async () => {
    flushPendingSaves();
    const toSave = schedules.filter(Boolean).map((s) => {
      markSaving(s.weekday, true);
      return saveScheduleToApi(s).finally(() => markSaving(s.weekday, false));
    });
    try {
      await Promise.allSettled(toSave);
      toast.success("Horaires sauvegardés (en arrière-plan)");
    } catch {
      toast.error("Erreur lors de la sauvegarde globale");
    }
  }, [schedules, flushPendingSaves, saveScheduleToApi, markSaving]);

  const primaryGradient = useMemo(() => {
    const p = "#0ea5e9";
    const s = "#6366f1";
    return { backgroundColor: p, background: `linear-gradient(135deg, ${p} 0%, ${s} 100%)` };
  }, []);

  return (
    <MedecinTemplate title="Horaires" breadcrumbs={[{ label: "Accueil médecin", to: "/doctor" }, { label: "Horaires", current: true }] }>
      <div className="min-h-[80dvh] bg-gradient-to-b from-slate-50 to-slate-100/40 p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-6">

          <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Horaires de travail</h2>
                <p className="text-slate-600">Ajoutez, modifiez ou supprimez vos créneaux</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={applyClinicDefaults}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
              >
                Appliquer les horaires de la clinique
              </button>
            </div>
          </div>

          <ScheduleGrid
            isLoading={isLoading}
            getDay={getDay}
            toggleDay={toggleDay}
            copyDay={copyDay}
            pasteDay={pasteDay}
            openCreateForDay={openCreateForDay}
            openEditSlot={openEditSlot}
            savingWeekdays={savingWeekdays}
            closedIcon={Bed}
            closedText="Journée de repos"
            openBtnText="Disponible"
            closeBtnText="Jour Off"
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-sm text-slate-600">
              <strong>Sauvegarde :</strong> Les modifications sont sauvegardées automatiquement en arrière-plan.
            </div>
            <button
              type="button"
              onClick={saveAll}
              className="inline-flex items-center gap-3 rounded-xl px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 min-w-[200px] justify-center"
              style={primaryGradient}
            >
              <Save className="w-5 h-5" />
              <span>Enregistrer les horaires</span>
            </button>
          </div>
        </div>

        <SlotModal
          open={modalState.open}
          dayLabel={modalState.dayLabel}
          initial={modalState.initial}
          existingSlots={modalState.existingSlots}
          onClose={closeModal}
          onSave={(v) =>
            modalState.externalHandlers
              ? (modalState.externalHandlers.onSave(v), closeModal())
              : saveSlotFromModal(v)
          }
          onDelete={modalState.index != null ? deleteSlotFromModal : modalState.externalHandlers?.onDelete}
        />
      </div>
    </div>
    </MedecinTemplate>
  );
}