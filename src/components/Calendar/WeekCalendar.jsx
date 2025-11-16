// src/components/calendar/WeekCalendarDnD.jsx
import  { useMemo, useRef, useState, useCallback } from "react";
import Loader from "../Loader.jsx";
import { DndContext, useSensor, useSensors, PointerSensor, DragOverlay } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { ChevronLeft, ChevronRight } from "lucide-react";

import RdvCard from "../Calendar/RdvCard.jsx";
import DayColumn from "./DayColumn.jsx";

export default function WeekCalendarDnD({
  weekStart,
  onPrevWeek,
  onNextWeek,
  hours = { start: 8, end: 18 },
  slotMinutes = 15,
  consultations = [],
  availability = [],
  onChange,
  theme = {},
  consultationProvisoire,
  setConsultationProvisoire,
  loading = false,
}) {
  const primary = theme?.primary || "#0ea5e9";
  const secondary = theme?.secondary || "#0f172a";

  // Grille
  const SLOT_HEIGHT = 20;
  const pxPerMinute = SLOT_HEIGHT / slotMinutes;
  const totalMinutes = (hours.end - hours.start) * 60;
  const dayColsRef = useRef([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  // Utils temps
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const toMinutes = useCallback(
    (hhmm) => {
      const [h, m] = (hhmm || "00:00").split(":").map((n) => parseInt(n, 10));
      return (h - hours.start) * 60 + (m || 0);
    },
    [hours.start]
  );
  const fromMinutes = useCallback(
    (min) => {
      const abs = hours.start * 60 + min;
      const h = Math.floor(abs / 60);
      const m = abs % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    },
    [hours.start]
  );
  const snap = (min) => Math.round(min / slotMinutes) * slotMinutes;

  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [weekStart]);

  // Normalize availability into an array per day (new format only):
  // expect [{ id, weekday, slots: [{start,end}, ...] }, ...]
  const availabilityByDay = useMemo(() => {
    const byDay = Array.from({ length: 7 }, () => []);
    (availability || []).forEach((a) => {
      if (!a || !Array.isArray(a.slots)) return;
      const w = Number(a.weekday);
      if (!Number.isFinite(w) || w < 0 || w >= 7) return;
      a.slots.forEach((s, idx) => {
        if (!s || !s.start || !s.end) return;
        byDay[w].push({ id: `${a.id ?? `av-${w}`}-${idx}`, start: s.start, end: s.end });
      });
    });
    return byDay;
  }, [availability]);

  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const fmt = (d) =>
    d
      .toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
      .replace(".", "");

  // Drag state
  const [draggingId, setDraggingId] = useState(null);
  const [ghost, setGhost] = useState(null);
  const [overDayIndex, setOverDayIndex] = useState(null);
  const [overMinutes, setOverMinutes] = useState(null);

  // Refs pour éviter les setState inutiles (anti-lag / anti-loop)
  const prevOverDayIndexRef = useRef(null);
  const prevOverMinutesRef = useRef(null);
  const prevGhostStartRef = useRef(null);

  // Y relatif du draggable dans une colonne
  const getRelativeY = (e, colEl) => {
    if (!colEl || !e?.active?.rect?.current) return 0;
    const rectCol = colEl.getBoundingClientRect();
    const translatedTop =
      e.active.rect.current.translated?.top ??
      e.active.rect.current.initial.top + (e.delta?.y || 0);
    let y = translatedTop - rectCol.top;
    return clamp(y, 0, rectCol.height);
  };

  const eventPositionFromDrag = (e, dayIdx) => {
    const col = dayColsRef.current[dayIdx];
    const y = getRelativeY(e, col);
    const minutes = snap(clamp(Math.round(y / pxPerMinute), 0, totalMinutes));
    return { dayIndex: dayIdx, minutes };
  };

  const handleDragStart = (e) => {
    const id = e.active?.id;
    if (!id) return;
    setDraggingId(id);
    const ev = normalizedConsultations.find((x) => String(x.id) === String(id));
    if (ev) setGhost(ev);
  };

  const handleDragMove = (e) => {
    if (!draggingId) return;
    const base = normalizedConsultations.find((x) => String(x.id) === String(draggingId));
    if (!base) return;

    const overIdx = e.over?.data?.current?.dayIndex;
    if (overIdx == null) return;

    const pos = eventPositionFromDrag(e, overIdx);
    const startMin = clamp(pos.minutes, 0, totalMinutes - base.duration);

    // Ne met à jour l’état QUE si ça change réellement (anti-lag)
    if (prevOverDayIndexRef.current !== overIdx) {
      prevOverDayIndexRef.current = overIdx;
      setOverDayIndex(overIdx);
    }
    if (prevOverMinutesRef.current !== startMin) {
      prevOverMinutesRef.current = startMin;
      setOverMinutes(startMin);
      // ghost.start snappé uniquement s’il change
      const nextStart = fromMinutes(startMin);
      if (prevGhostStartRef.current !== nextStart) {
        prevGhostStartRef.current = nextStart;
        setGhost((g) => (g ? { ...g, dayIndex: overIdx, start: nextStart } : g));
      }
    }
  };

// --- handleDragEnd: detect provisional and update parent state instead of onChange ---
const handleDragEnd = (e) => {
  if (!draggingId) {
    resetDragUi();
    return;
  }
  const base = normalizedConsultations.find((x) => String(x.id) === String(draggingId));
  if (!base) {
    resetDragUi();
    return;
  }

  const overIdx = e.over?.data?.current?.dayIndex;
  if (overIdx == null) {
    resetDragUi();
    return;
  }

  const pos = eventPositionFromDrag(e, overIdx);
  const startMin = clamp(pos.minutes, 0, totalMinutes - base.duration);

  // If it was the provisional item, update parent consultationProvisoire
  if (String(base.id) === "provisional" || base.raw?.provisional) {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + pos.dayIndex);
    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, "0");
    const dd = String(newDate.getDate()).padStart(2, "0");
    const newStart = fromMinutes(startMin);

    // tell parent about new provisional date/time
    setConsultationProvisoire((prev) => ({
      ...(prev || {}),
      date: `${yyyy}-${mm}-${dd}`,
      start: newStart,
    }));

    resetDragUi();
    return;
  }

  // existing behavior for real consultations: update array and call onChange
  const updated = consultations.map((c) => {
    if (String(c.id) !== String(base.id)) return c;
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + pos.dayIndex);
    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, "0");
    const dd = String(newDate.getDate()).padStart(2, "0");
    return { ...c, date: `${yyyy}-${mm}-${dd}`, heure_debut: fromMinutes(startMin) };
  });

  onChange?.(updated);
  resetDragUi();
};
  const handleDragCancel = () => {
    resetDragUi();
  };

  const resetDragUi = () => {
    setDraggingId(null);
    setGhost(null);
    setOverDayIndex(null);
    setOverMinutes(null);
    prevOverDayIndexRef.current = null;
    prevOverMinutesRef.current = null;
    prevGhostStartRef.current = null;
  };

  const renderEvent = useCallback(
    (c) => {
      const start = c.start;
      const end = fromMinutes(toMinutes(c.start) + c.duration);
      const cancelled = (c.statusConsultation) === "annule";
      const provisoire = c.id == "provisional";
      return (
        <RdvCard
          title={c.title}
          start={start}
          end={end}
          cancelled={cancelled}
          provisoire={provisoire}
        />
      );
    },
    [fromMinutes, toMinutes]
  );

  // Normalize consultations into internal shape expected by DayColumn
const normalizedConsultations = useMemo(() => {
  const base = (consultations || [])
    .map((c) => {
      if (!c) return null;
      const d = new Date(c.date);
      const dayIndex = days.findIndex(
        (dd) =>
          dd.getFullYear() === d.getFullYear() &&
          dd.getMonth() === d.getMonth() &&
          dd.getDate() === d.getDate()
      );
      if (dayIndex === -1) return null;

      const start = c.heure_debut || c.start || "00:00";
      let duration = 0;
      if (c.heure_fin) {
        const [sh, sm] = (c.heure_debut || "00:00").split(":").map((n) => parseInt(n, 10));
        const [eh, em] = (c.heure_fin || "00:00").split(":").map((n) => parseInt(n, 10));
        duration = (eh - sh) * 60 + (em - (sm || 0));
      } else if (c.doctor && Number.isFinite(c.doctor.duree_consultation)) {
        duration = Number(c.doctor.duree_consultation);
      } else {
        duration = Number(c.duration || 0);
      }

      const title = c.patient?.user?.full_name || c.patient?.full_name || c.patient?.user?.email || "Consultation";

      return {
        id: c.id,
        dayIndex,
        start,
        duration: Math.max(0, Math.round(duration)),
        title,
        statusConsultation: c.statusConsultation,
        raw: c,
      };
    })
    .filter(Boolean);

  // --- add provisional consultation if present ---
  if (consultationProvisoire?.date && consultationProvisoire?.start) {
    const d = new Date(consultationProvisoire.date);
    const dayIndex = days.findIndex(
      (dd) =>
        dd.getFullYear() === d.getFullYear() &&
        dd.getMonth() === d.getMonth() &&
        dd.getDate() === d.getDate()
    );
    if (dayIndex !== -1) {
      base.push({
        id: "provisional", // unique id for provisional item
        dayIndex,
        start: consultationProvisoire.start,
        duration: Number(consultationProvisoire.duree || consultationProvisoire.duration || 15),
        title: consultationProvisoire.title || "—",
        provisional: true,
        raw: { provisional: true },
      });
    }
  }

  return base;
}, [consultations, days, consultationProvisoire]);


  // DayColumn and DraggableEvent extracted to ./DayColumn.jsx
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70">
          <Loader fullScreen={false} message={"Chargement..."} />
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevWeek}
            className="p-2 rounded-md hover:bg-slate-100"
            aria-label="Semaine précédente"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={onNextWeek}
            className="p-2 rounded-md hover:bg-slate-100"
            aria-label="Semaine suivante"
          >
            <ChevronRight />
          </button>
        </div>
        <h2 className="text-lg md:text-xl font-semibold" style={{ color: secondary }}>
          Semaine du {fmt(days[0])} au {fmt(days[6])}
        </h2>
        <div className="text-sm text-slate-500">
          {hours.start}h–{hours.end}h
        </div>
      </div>

      {/* Entêtes jours */}
      <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-slate-200 text-sm">
        <div className="px-3 py-2 text-slate-500">Heures</div>
        {days.map((d, i) => (
          <div key={i} className="px-3 py-2 font-medium text-slate-700">
            <span className="mr-1">{dayNames[i]}</span>
            <span className="text-slate-500">{d.getDate()}</span>
          </div>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        modifiers={[restrictToWindowEdges]}
      >
        {/* Grille */}
        <div className="relative grid grid-cols-[64px_repeat(7,1fr)]">
          {/* Colonne heures */}
          <div className="border-r border-slate-100">
            {Array.from({ length: hours.end - hours.start + 1 }).map((_, idx) => (
              <div
                key={idx}
                className="relative"
                style={{ height: SLOT_HEIGHT * (60 / slotMinutes) }}
              >
                <div className="absolute -translate-y-2 right-2 text-xs text-slate-400">
                  {hours.start + idx}h
                </div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-slate-200" />
              </div>
            ))}
          </div>

          {/* 7 colonnes jour */}
          {Array.from({ length: 7 }).map((_, dayIdx) => (
            <DayColumn
              key={dayIdx}
              dayIdx={dayIdx}
              ref={(el) => (dayColsRef.current[dayIdx] = el)}
              hours={hours}
              slotMinutes={slotMinutes}
              slotHeight={SLOT_HEIGHT}
              availability={availabilityByDay[dayIdx] || []}
              consultations={normalizedConsultations.filter((e) => e.dayIndex === dayIdx)}
              renderEvent={renderEvent}
              toMinutes={toMinutes}
              pxPerMinute={pxPerMinute}
              primary={primary}
              isOver={overDayIndex === dayIdx}
              overMinutesForDay={overDayIndex === dayIdx ? overMinutes : null}
              draggingGhost={ghost}
            />
          ))}
        </div>

        {/* CARD du RDV mais quand on drag */}
        <DragOverlay dropAnimation={null}>
          {ghost ? (
            (() => {
              const isProvisionalGhost = ghost && (ghost.id === "provisional" || ghost.raw?.provisional);
              const wrapperClass = isProvisionalGhost
                ? "rounded-md cursor-grabbing border border-dashed border-blue-200 shadow-sm bg-blue-50/60 text-blue-800"
                : "rounded-md cursor-grabbing border shadow-sm bg-white text-slate-800";
              const titleClass = isProvisionalGhost
                ? "px-2 py-1 text-[12px] font-medium text-blue-800"
                : "px-2 py-1 text-[12px] font-medium";
              const footerClass = isProvisionalGhost
                ? "px-2 pb-2 text-[11px] text-blue-700"
                : "px-2 pb-2 text-[11px] text-slate-500";
              const style = isProvisionalGhost ? { width: 120 } : { width: 120, borderColor: "#e2e8f0" };            

              return (
                <div className={wrapperClass} style={style}>
                  <div className={titleClass}>{ghost.title || "RDV"}</div>
                  <div className={footerClass}>
                    {ghost.start} — {fromMinutes(toMinutes(ghost.start) + ghost.duration)}
                  </div>
                </div>
              );
            })()
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
