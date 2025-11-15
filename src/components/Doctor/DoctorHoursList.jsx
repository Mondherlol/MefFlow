import React, { useMemo } from "react";

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DoctorHoursList({ events = [], startHour = 8, endHour = 18, slotMinutes = 30, onSelect, accent }) {
  // Build time slots
  const slots = useMemo(() => {
    const arr = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += slotMinutes) {
        arr.push({ hour: h, minute: m });
      }
    }
    return arr;
  }, [startHour, endHour, slotMinutes]);

  // map events by display time string (supports e.start "HH:MM" or e.time ISO)
  const eventsByTime = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      let key = null;
      if (e.start) key = e.start;
      else if (e.time) {
        const d = new Date(e.time);
        key = d.toTimeString().slice(0,5);
      }
      if (!key) return;
      map[key] = map[key] || [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Heures — Aujourd'hui</h3>
        <div className="text-xs text-slate-500">{formatTime(new Date())}</div>
      </div>

      <div className="space-y-2">
        {slots.map((s, idx) => {
          const hh = String(s.hour).padStart(2, '0');
          const mm = String(s.minute).padStart(2, '0');
          const timestr = `${hh}:${mm}`;
          const slotEvents = eventsByTime[timestr] || [];
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-md hover:shadow-md hover:-translate-y-0.5 transition-transform duration-150 cursor-pointer"
              onClick={() => onSelect?.(slotEvents[0] || { start: timestr })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onSelect?.(slotEvents[0] || { start: timestr }); }}
            >
              <div className="w-20 text-xs text-slate-500">{timestr}</div>
              <div className="flex-1">
                {slotEvents.length ? (
                  slotEvents.map(ev => (
                    <div key={ev.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-slate-50">
                      <div className="text-sm font-medium text-slate-800">{ev.title || ev.patient?.name || 'Rendez-vous'}</div>
                      <div className="text-xs text-slate-500">{ev.status || 'scheduled'}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-400">Libre</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
