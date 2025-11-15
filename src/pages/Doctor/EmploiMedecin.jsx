// src/pages/doctor/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import WeekCalendarDnD from "../../components/Calendar/WeekCalendar";
import { useAuth } from "../../context/authContext";
import { useClinic } from "../../context/clinicContext";
import api from "../../api/axios";
import toast from "react-hot-toast";

function startOfWeek(date) {
  const d = new Date(date);
  const js = d.getDay(); // 0=dim
  const diff = js === 0 ? -6 : 1 - js; // lundi
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function EmploiMedecin() {
  const { user } = useAuth();
  const { clinic, theme} = useClinic();
  const [anchor, setAnchor] = useState(startOfWeek(new Date()));
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock RDV
  const [events, setEvents] = useState([
    { id: "e1", dayIndex: 0, start: "08:30", duration: 30, title: "Martin Dupont", status: "confirmed" },
    { id: "e2", dayIndex: 0, start: "09:15", duration: 30, title: "Sophie Leroux", status: "confirmed" },
    { id: "e3", dayIndex: 0, start: "10:00", duration: 30, title: "Julien Marchand", status: "cancelled" },
    { id: "e4", dayIndex: 0, start: "11:30", duration: 30, title: "Laura Petit", status: "confirmed" },
    { id: "e5", dayIndex: 2, start: "14:00", duration: 60, title: "Nora Salim", status: "confirmed" },
    { id: "e6", dayIndex: 4, start: "09:00", duration: 60, title: "Marc Blond", status: "confirmed" },
  ]);

  // Dispos (background)
  const availability = [
    { id: "a1", dayIndex: 0, start: "08:00", end: "12:00" }
  ];

  const onPrevWeek = () => setAnchor((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7));
  const onNextWeek = () => setAnchor((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));

  const handleChange = (updated) => {
    setEvents(updated);
    // TODO: sync API (PUT /api/doctor/appointments/:id { dayIndex, start, duration })
  };

    // Fetch schedules for the doctor
  useEffect(() => {
    let cancelled = false;
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/api/doctors/${user?.doctor?.id}/schedules/`);
        const arr = res.data.data;

        if(arr.length === 0) {
          // On recupere les horaires par defaut de la clinique
          const resClinic =  await api.get(`/api/clinics/${user?.clinic?.id}/schedules/`);
          const arrClinic = resClinic.data.data;
          arr.push(...arrClinic);
        }
        const byWeek = {};
        arr.forEach((s) => {
          if (!s) return;
          const w = Number(s.weekday);
          byWeek[w] = { ...s, weekday: w, slots: Array.isArray(s.slots) ? s.slots : [] };
        });
        const normalized = Array.from({ length: 7 }).map((_, i) => byWeek[i] ?? null);
        if (!cancelled) setSchedules(normalized);

        console.log("Schedules fetched:", normalized);

      } catch (err) {
        console.error(err);
        toast.error(
          err?.response?.data?.message ?? "Une erreur est survenue lors de la récupération des horaires du médecin."
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchSchedules();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if(isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-[80dvh] bg-linear-to-b from-slate-50 to-slate-100/40 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Espace médecin</h1>
          <p className="text-sm text-slate-500">
            Bonjour, <span className="font-medium text-slate-900">{user?.full_name || "Docteur"}</span>
          </p>
        </header>

        <WeekCalendarDnD
          weekStart={anchor}
          onPrevWeek={onPrevWeek}
          onNextWeek={onNextWeek}
          hours={{ start: 8, end: 18 }}
          slotMinutes={15}
          events={events}
          availability={schedules}
          onChange={handleChange}
          theme={theme}
        />

        <p className="text-xs text-slate-500">
          Drag & drop pour déplacer. Attrape la **barre du bas** pour ajuster la durée (snap 15 min).
        </p>
      </div>
    </div>
  );
}
