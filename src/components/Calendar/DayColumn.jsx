import React, { useCallback } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CalendarCog } from "lucide-react";

const DayColumn = React.memo(
  React.forwardRef(function DayColumn(
    {
      dayIdx,
      hours,
      slotMinutes,
      slotHeight,
      availability,
      patientAvailability,
      consultations,
      renderEvent,
      primary,
      isOver,
      overMinutesForDay,
      draggingGhost,
      onEventClick,
      editMode,
      toMinutes,
      pxPerMinute,
      doctorMode,
      weekStart,
      setConsultationProvisoire,
    },
    ref
  ) {
    const { setNodeRef: setDroppableRef, isOver: dndIsOver } = useDroppable({
      id: `day-${dayIdx}`,
      data: { dayIndex: dayIdx },
    });

    // merge refs
    const forwardRef = useCallback(
      (el) => {
        setDroppableRef(el);
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      },
      [ref, setDroppableRef]
    );

    const showOver = isOver || dndIsOver;
    const indicatorTop =
      overMinutesForDay != null
        ? overMinutesForDay * (slotHeight / slotMinutes)
        : null;

    // Gestionnaire de clic pour positionner la consultation provisoire
    const handleColumnClick = useCallback((e) => {
      if (!setConsultationProvisoire || !weekStart) return;
      
      // Ne pas gérer le clic si c'est sur un événement
      if (e.target.closest('[data-event]')) return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const minutes = Math.round(y / pxPerMinute);
      const snappedMinutes = Math.round(minutes / slotMinutes) * slotMinutes;
      
      // Calculer l'heure
      const totalMinutes = hours.start * 60 + snappedMinutes;
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      
      // Calculer la date
      const date = new Date(weekStart);
      date.setDate(date.getDate() + dayIdx);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      setConsultationProvisoire((prev) => ({
        ...prev,
        date: dateStr,
        start: timeStr,
      }));
    }, [setConsultationProvisoire, weekStart, dayIdx, pxPerMinute, slotMinutes, hours]);

    return (
      <div
        ref={forwardRef}
        data-day
        data-day-index={dayIdx}
        className={`relative border-r last:border-r-0 ${
          showOver ? "bg-sky-50/40" : ""
        }`}
        style={{ borderColor: "#eef2f7" }}
        onClick={handleColumnClick}
      >
        {/* Lignes horaires */}
        {Array.from({ length: hours.end - hours.start }).map((_, hour) => {
          const baseTop = hour * 60 * (slotHeight / slotMinutes);
          return (
            <div key={hour} className="absolute left-0 right-0" style={{ top: baseTop }}>
              <div className="h-px bg-slate-200" />
              <div className="h-px bg-slate-100" style={{ marginTop: slotHeight - 1 }} />
              <div className="h-px bg-slate-100" style={{ marginTop: slotHeight - 1 }} />
              <div className="h-px bg-slate-100" style={{ marginTop: slotHeight - 1 }} />
            </div>
          );
        })}

        {/* Disponibilités médecin */}
        {(() => {
          const slots = Array.isArray(availability) ? availability : [];
          return slots.map((s, idx) => {
            if (!s || !s.start || !s.end) return null;
            const [sh, sm] = String(s.start).split(":").map(Number);
            const [eh, em] = String(s.end).split(":").map(Number);
            const startMin = (sh - hours.start) * 60 + (sm || 0);
            const endMin = (eh - hours.start) * 60 + (em || 0);
            const top = startMin * (slotHeight / slotMinutes);
            const height = (endMin - startMin) * (slotHeight / slotMinutes);
            const key = `${s.id ?? `day${dayIdx}`}-${idx}-${s.start}-${s.end}`;
            return (
              <div
                key={key}
                className="absolute left-1 right-1 rounded-md"
                style={{
                  top,
                  height,
                  backgroundColor: `${primary}14`,
                  border: `1px solid ${primary}33`,
                }}
                title={`Dispo ${s.start}–${s.end}`}
              />
            );
          });
        })()}

        {/* Disponibilités patient (préférences) */}
        {(() => {
          const slots = Array.isArray(patientAvailability) ? patientAvailability : [];
          return slots.map((s, idx) => {
            if (!s || !s.start || !s.end) return null;
            const [sh, sm] = String(s.start).split(":").map(Number);
            const [eh, em] = String(s.end).split(":").map(Number);
            const startMin = (sh - hours.start) * 60 + (sm || 0);
            const endMin = (eh - hours.start) * 60 + (em || 0);
            const top = startMin * (slotHeight / slotMinutes);
            const height = (endMin - startMin) * (slotHeight / slotMinutes);
            const key = `patient-${s.id ?? `day${dayIdx}`}-${idx}-${s.start}-${s.end}`;
            return (
              <div
                key={key}
                className="absolute left-1 right-1 rounded-md"
                style={{
                  top,
                  height,
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, #fbbf2440 4px, #fbbf2440 8px)',
                  border: '1px solid #fbbf2466',
                }}
                title={`Préférence patient ${s.start}–${s.end}`}
              />
            );
          });
        })()}

        {/* Indicateur Drop */}
        {showOver && draggingGhost && overMinutesForDay != null ? (
          <div
            className="absolute left-1 right-1 rounded-md border border-dashed pointer-events-none"
            style={{
              top: indicatorTop,
              height: Math.max(draggingGhost.duration * (slotHeight / slotMinutes), 32),
              background: `${primary}12`,
              borderColor: `${primary}66`,
            }}
          />
        ) : null}

        {/* RDV */}
        {(consultations || []).map((ev) => (
          <DraggableEvent
            key={ev.id}
            event={ev}
            toMinutes={toMinutes}
            pxPerMinute={pxPerMinute}
            renderEvent={renderEvent}
            onEventClick={onEventClick}
            editMode={editMode}
            doctorMode={doctorMode}
          />
        ))}
      </div>
    );
  })
);

// ---------- RDV draggable (inner) ----------
const DraggableEvent = React.memo(function DraggableEvent({
  event,
  toMinutes,
  pxPerMinute,
  renderEvent,
  onEventClick,
  editMode,
  doctorMode = false,
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(event.id),
  });

  const top = toMinutes(event.start) * pxPerMinute;
  const height = event.duration * pxPerMinute;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-event
      onClick={(e)=>
       {
        e.stopPropagation();
        if(! doctorMode ) return;
        const payload = event.raw && typeof event.raw === "object" ? event.raw : event;
        onEventClick && onEventClick(payload);
       }
      }
      onContextMenu={(e) => {
        e.preventDefault();
        if (isDragging) return;
        const payload = event.raw && typeof event.raw === "object" ? event.raw : event;
        onEventClick && onEventClick(payload);
      }}
      className={`absolute left-1 right-1 rounded-md shadow-sm select-none cursor-move transition-[box-shadow,transform]
        ${isDragging ? "shadow-lg scale-[1.01]" : ""}
        "border bg-white border-slate-200"}`}
      style={{ top, height: Math.max(height, 44) }}
    >
      {editMode && (
        <button
          type="button"
          onClick={(ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            if (isDragging) return;
            const payload = event.raw && typeof event.raw === "object" ? event.raw : event;
            onEventClick && onEventClick(payload);
          }}
          className="absolute top-1 right-1 z-20 p-1 rounded bg-white/90 hover:bg-slate-100 text-slate-600"
          title="Configurer"
        >
          <CalendarCog size={14} />
        </button>
      )}
      {renderEvent(event)}
    </div>
  );
});

export default DayColumn;
