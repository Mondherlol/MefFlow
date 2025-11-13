import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import AdminTemplate from "../../../components/Admin/AdminTemplate";
import { useClinic } from "../../../context/clinicContext";
import {
  Calendar,
  Save,
  Plus,
  Copy,
  ClipboardPaste,
  AlertTriangle,
  Pencil,
  LockKeyhole,
} from "lucide-react";
import toast from "react-hot-toast";
import SlotModal from "../../../components/Admin/ManageClinic/Horaires/SlotModal";
import EmergencyBlock from "../../../components/Admin/ManageClinic/Horaires/EmergencyBlock";
import api from "../../../api/axios";

// utils
const toMin = (hhmm) => {
  const [h = 0, m = 0] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const sortSlots = (slots = []) => [...slots].sort((a, b) => toMin(a.start) - toMin(b.start));
const hasOverlap = (slots = []) => {
  const s = sortSlots(slots);
  for (let i = 0; i < s.length - 1; i++) if (toMin(s[i].end) > toMin(s[i + 1].start)) return true;
  return false;
};

const DAYS = [
  { id: 0, label: "Lundi" },
  { id: 1, label: "Mardi" },
  { id: 2, label: "Mercredi" },
  { id: 3, label: "Jeudi" },
  { id: 4, label: "Vendredi" },
  { id: 5, label: "Samedi" },
  { id: 6, label: "Dimanche" },
];

const defaultInterval = () => ({ start: "09:00", end: "17:00" });

export default function HoursPro() {
  const { clinic, theme } = useClinic() || {};
  const [schedules, setSchedules] = useState(() =>
    Array.isArray(clinic?.schedules) ? clinic.schedules : []
  );
  const [isLoading, setIsLoading] = useState(true);

  // saving indicators per weekday (Set of numbers)
  const [savingWeekdays, setSavingWeekdays] = useState(() => new Set());

  // pending debounce timers per weekday
  const saveTimersRef = useRef(new Map());

  // to avoid memory leaks: track mounted
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // clear timers
      saveTimersRef.current.forEach((t) => clearTimeout(t));
      saveTimersRef.current.clear();
    };
  }, []);

  // Fetch schedules (async/await, skeleton while loading)
  useEffect(() => {
    if (!clinic) {
      setSchedules([]);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/api/clinics/${clinic.id}/schedules/`);
        const raw = res.data?.data ?? res.data ?? [];
        const arr = Array.isArray(raw) ? raw : raw.schedules ?? raw.data ?? [];
        const makeDefault = (weekday) => ({ weekday, open: false, emergency: false, slots: [] });
        const byWeek = {};
        arr.forEach((s) => {
          if (!s) return;
          const w = Number(s.weekday);
          byWeek[w] = { ...s, weekday: w, slots: Array.isArray(s.slots) ? s.slots : [] };
        });
        const normalized = Array.from({ length: 7 }).map((_, i) => byWeek[i] ?? makeDefault(i));
        if (!cancelled && mountedRef.current) setSchedules(normalized);
      } catch (err) {
        console.error(err);
        toast.error(
          err?.response?.data?.message ??
            "Une erreur est survenue lors de la récupération des horaires."
        );
      } finally {
        if (!cancelled && mountedRef.current) setIsLoading(false);
      }
    };
    fetchSchedules();
    return () => {
      cancelled = true;
    };
  }, [clinic]);

  // helpers to show small saving indicator (non-blocking)
  const markSaving = useCallback((weekday, on = true) => {
    setSavingWeekdays((prev) => {
      const next = new Set(prev);
      if (on) next.add(Number(weekday));
      else next.delete(Number(weekday));
      return next;
    });
  }, []);

  // API call: does actual PUT/POST. Called by debounced flush or directly when needed.
  const saveScheduleToApi = useCallback(async (schedule) => {
    if (!clinic) return;
    markSaving(schedule.weekday, true);
    try {
      const payload = { ...schedule, slots: Array.isArray(schedule.slots) ? schedule.slots : [] };
      if (schedule.id) {
        // update
        payload.clinic = clinic.id; // ensure clinic is set
        await api.put(`/api/clinic-schedules/${schedule.id}/`, payload);
      } else {
        // create
        const body = { ...payload, clinic: clinic.id };
        const res = await api.post(`/api/clinic-schedules/`, body);
        const returned = res.data ?? res.data?.data ?? {};
        // if backend returned an id / new fields -> merge
        setSchedules((prev) =>
          prev.map((s) => (Number(s.weekday) === Number(schedule.weekday) ? { ...s, ...returned } : s))
        );
      }
      // silent success (no blocking toast)
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la sauvegarde des horaires");
    } finally {
      markSaving(schedule.weekday, false);
    }
  }, [clinic, markSaving]);

  // Schedule a save (debounced) for a given weekday
  const scheduleSave = useCallback((weekday, schedule, delay = 700) => {
    // clear previous
    const timers = saveTimersRef.current;
    const key = String(weekday);
    if (timers.has(key)) clearTimeout(timers.get(key));
    const t = setTimeout(() => {
      timers.delete(key);
      // call save but don't await in UI (non-blocking)
      saveScheduleToApi(schedule);
    }, delay);
    timers.set(key, t);
  }, [saveScheduleToApi]);

  // flush all pending saves immediately
  const flushPendingSaves = useCallback(() => {
    const timers = saveTimersRef.current;
    const toFlush = Array.from(timers.keys());
    toFlush.forEach((key) => {
      const t = timers.get(key);
      clearTimeout(t);
      timers.delete(key);
      // find schedule and save immediately
      const weekday = Number(key);
      const s = schedules.find((x) => Number(x.weekday) === weekday);
      if (s) saveScheduleToApi(s);
    });
  }, [schedules, saveScheduleToApi]);

  // Accessors
  const getDay = useCallback(
    (weekday) => {
      const arr = Array.isArray(schedules) ? schedules : [];
      const found = arr.find((s) => Number(s.weekday) === Number(weekday));
      if (found) return found;
      return { id: `local-${weekday}`, weekday, open: false, emergency: false, slots: [] };
    },
    [schedules]
  );

  const setDay = useCallback(
    (weekday, newDayPartial) => {
      setSchedules((prev = []) => {
        const exists = prev.some((s) => Number(s.weekday) === Number(weekday));
        const merged = exists
          ? prev.map((s) =>
              Number(s.weekday) === Number(weekday) ? { ...s, ...newDayPartial } : s
            )
          : [...prev, { weekday, ...newDayPartial }];
        const sorted = merged.sort((a, b) => Number(a.weekday) - Number(b.weekday));
        return sorted;
      });
      // schedule save (debounced)
      // after state queued, scheduleSave will find the schedule later from schedules state when fired
      // To be safe, we can schedule a save using the merged object directly:
      const candidate = { weekday, ...newDayPartial, slots: Array.isArray(newDayPartial.slots) ? newDayPartial.slots : [] };
      scheduleSave(weekday, candidate);
    },
    [scheduleSave]
  );

  // Actions
  const openEveryDay = useCallback((e) => {
    e?.preventDefault?.();
    const newSchedules = DAYS.map((d) => ({
      weekday: d.id,
      emergency: false,
      open: true,
      slots: [defaultInterval()],
    }));
    setSchedules(newSchedules);
    // schedule saves for each day (debounced)
    newSchedules.forEach((day) => scheduleSave(day.weekday, day));
    toast.success("Tous les jours ouverts (sauvegarde en arrière-plan)");
  }, [scheduleSave]);

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
    return () => {
      delete window.__openSlotModal;
    };
  }, []);

  const openCreateForDay = useCallback((dayId) => {
    const day = getDay(dayId);
    const last = day.slots?.[day.slots.length - 1];
    const start = last ? last.end : "09:00";
    const end = toHHMM(toMin(start) + 120);
    setModalState({
      open: true,
      dayId,
      index: null,
      initial: { start, end },
      dayLabel: DAYS.find((d) => d.id === dayId)?.label,
      existingSlots: day.slots,
      externalHandlers: null,
    });
  }, [getDay]);

  const openEditSlot = useCallback((dayId, index) => {
    const day = getDay(dayId);
    const slot = day.slots?.[index];
    setModalState({
      open: true,
      dayId,
      index,
      initial: slot,
      dayLabel: DAYS.find((d) => d.id === dayId)?.label,
      existingSlots: day.slots,
      externalHandlers: null,
    });
  }, [getDay]);

  const closeModal = useCallback(() => {
    setModalState({
      open: false,
      dayId: null,
      index: null,
      initial: null,
      dayLabel: "",
      existingSlots: [],
      externalHandlers: null,
    });
  }, []);

  const saveSlotFromModal = useCallback((patch) => {
    const dayId = modalState.dayId;
    const d = getDay(dayId);
    const slots = [...(d.slots || [])];
    if (modalState.index == null) slots.push(patch);
    else slots[modalState.index] = { ...slots[modalState.index], ...patch };
    const sorted = sortSlots(slots);
    const updated = { ...d, open: true, slots: sorted };
    // update state and schedule save (debounced)
    setDay(dayId, updated);
    closeModal();
  }, [modalState, getDay, setDay, closeModal]);

  const deleteSlotFromModal = useCallback(() => {
    const dayId = modalState.dayId;
    const d = getDay(dayId);
    const slots = (d.slots || []).filter((_, i) => i !== modalState.index);
    const updated = { ...d, slots };
    setDay(dayId, updated);
    closeModal();
  }, [modalState, getDay, setDay, closeModal]);

  const toggleDay = useCallback((id) => {
    const d = getDay(id);
    const updated = { ...d, open: !d.open, slots: !d.open ? (d.slots.length ? d.slots : [defaultInterval()]) : [] };
    setDay(id, updated);
  }, [getDay, setDay]);

  const copyDay = useCallback((id) => {
    const d = getDay(id);
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
    // flush pending timers then save all in parallel (non-blocking UI)
    flushPendingSaves();
    const toSave = schedules.map((s) => {
      markSaving(s.weekday, true);
      // call saveScheduleToApi but don't await in UI – collect promises to notify when done
      return saveScheduleToApi(s).finally(() => markSaving(s.weekday, false));
    });
    try {
      await Promise.allSettled(toSave);
      toast.success("Horaires sauvegardés (en arrière-plan)");
    } catch {
      toast.error("Erreur lors de la sauvegarde globale");
    }
  }, [schedules, flushPendingSaves, saveScheduleToApi, markSaving]);

  // computed memo for theme gradients
  const primaryGradient = useMemo(() => {
    const p = theme?.primary ?? "#0ea5e9";
    const s = theme?.secondary ?? "#6366f1";
    return { backgroundColor: p, background: `linear-gradient(135deg, ${p} 0%, ${s} 100%)` };
  }, [theme]);

  return (
    <AdminTemplate
      title="Gestion des horaires"
      breadcrumbs={[
        { label: "Tableau de bord", to: "/admin" },
        { label: "Clinique", to: "/admin/clinique" },
        { label: "Horaires", current: true },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Horaires d'ouverture</h1>
              <p className="text-slate-600">Configurez les plages horaires de votre clinique</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openEveryDay}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
            >
              Ouvrir tous les jours
            </button>
          </div>
        </div>

        {/* calendar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
            {DAYS.map((day) => (
              <div key={day.id} className="relative text-center py-4 font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-medium text-slate-600">{day.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* body */}
          {isLoading ? (
            // skeleton grid while loading
            <div className="grid grid-cols-7 gap-0">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="p-4 border-r border-slate-200 last:border-r-0 border-b bg-white">
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 w-24 bg-slate-200 rounded mx-auto" />
                    <div className="h-3 bg-slate-200 rounded" />
                    <div className="h-3 bg-slate-200 rounded" />
                    <div className="h-10 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {DAYS.map((day) => {
                const data = getDay(day.id);
                const overlap = hasOverlap(data.slots || []);
                return (
                  <div key={day.id} className="relative min-h-[160px] p-3 border-r border-slate-200 last:border-r-0 border-b bg-white group">
                    {/* small non-blocking save indicator */}
                    {savingWeekdays.has(Number(day.id)) && (
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-slate-300 bg-white shadow-sm flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full animate-pulse bg-slate-500" />
                        </div>
                        <span className="text-xs text-slate-500">Sauvegarde</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => toggleDay(day.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          data.open
                            ? "bg-green-500 text-white shadow-sm hover:bg-green-600"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                      >
                        {data.open ? "Ouvert" : "Fermé"}
                      </button>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 shadow-sm"
                          title="Copier les horaires"
                          onClick={() => copyDay(day.id)}
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <button
                          className="p-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 shadow-sm"
                          title="Coller les horaires"
                          onClick={() => pasteDay(day.id)}
                        >
                          <ClipboardPaste className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                      </div>
                    </div>

                    {overlap && (
                      <div className="mb-2 flex items-center gap-1.5 text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200">
                        <AlertTriangle className="w-3 h-3" />
                        Chevauchement
                      </div>
                    )}

                    {data.open ? (
                      <div className="space-y-2">
                        {sortSlots(data.slots || []).map((slot, i) => (
                          <button
                            key={i}
                            onClick={() => openEditSlot(day.id, i)}
                            className="w-full text-sm bg-blue-50 text-blue-700 rounded-lg px-3 py-2 border border-blue-200 flex items-center justify-between hover:bg-blue-100 transition-colors group/slot"
                          >
                            <span className="font-medium">
                              {slot.start} – {slot.end}
                            </span>
                            <Pencil className="w-3.5 h-3.5 opacity-0 group-hover/slot:opacity-100 transition-opacity" />
                          </button>
                        ))}

                        <button
                          onClick={() => openCreateForDay(day.id)}
                          className="w-full text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 py-2.5 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                          <Plus className="w-4 h-4" /> Ajouter
                        </button>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400">
                        <div className="text-center flex justify-center items-center flex-col gap-0">
                          <div className="text-2xl mb-1"><LockKeyhole /></div>
                          <div className="text-xs font-medium">Fermé</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>


        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="text-sm text-slate-600">
            <strong>Conseil :</strong> Les modifications sont sauvegardées automatiquement en arrière-plan.
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
    </AdminTemplate>
  );
}
