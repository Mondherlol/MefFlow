// src/pages/doctor/Home.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  LayoutGrid,
  DollarSign,
  Pause,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import { useClinic } from "../../context/clinicContext";
import toast from "react-hot-toast";

/*
  Page d'accueil médecin — design inspiré de ReceptionnistHome.jsx
  - Timeline compacte à gauche (scroll interne) et RDV alignés à droite, fusionnés.
  - Pas de création de RDV depuis cette page (médecin ne crée pas).
  - Actions limitées : Reporter, Annuler.
  - Mock data pour démonstration; remplace par fetch API si nécessaire.
*/

/* ---------- Mock events (à remplacer par ton API) ---------- */
const MOCK_EVENTS = [
  { id: "e1", time: "08:30", patient: "Martin Dupont", status: "confirmed", duration: 30 },
  { id: "e2", time: "09:15", patient: "Sophie Leroux", status: "confirmed", duration: 30 },
  { id: "e3", time: "10:00", patient: "Julien Marchand", status: "cancelled", duration: 30 },
  { id: "e4", time: "11:30", patient: "Laura Petit", status: "confirmed", duration: 30 },
  { id: "e5", time: "14:00", patient: "Nora Salim", status: "confirmed", duration: 60 },
  { id: "e6", time: "15:30", patient: "Marc Blond", status: "confirmed", duration: 30 },
];

/* ---------- utilitaires ---------- */
const timeToMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const minToTime = (m) => {
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};
const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

/* ---------- Composants UI ---------- */

function SmallStat({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-50">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function MiniAction({ title, Icon, to, onClick }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => (onClick ? onClick() : navigate(to))}
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-100 shadow-sm text-sm hover:shadow-md hover:scale-[1.02] transition"
      title={title}
    >
      <Icon className="text-slate-600" />
      <span className="text-slate-700">{title}</span>
    </button>
  );
}

/* Timeline compacte: timescroll + petits badges RDV inline */
function TimelineCompact({ events = [], start = 8, end = 18, step = 30, onSelectTime }) {
  const containerRef = useRef(null);
  const slotRefs = useRef({});
  const nowMin = useMemo(() => nowMinutes(), []);

  // slots generation
  const slots = useMemo(() => {
    const arr = [];
    for (let h = start; h < end; h++) {
      for (let m = 0; m < 60; m += step) {
        arr.push(minToTime(h * 60 + m));
      }
    }
    return arr;
  }, [start, end, step]);

  // events grouped by slot
  const bySlot = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      map[e.time] ??= [];
      map[e.time].push(e);
    });
    return map;
  }, [events]);

  // auto-scroll centré sur l'heure actuelle (au montage)
  useEffect(() => {
    // find nearest slot index
    let bestIdx = 0;
    let bestDiff = Infinity;
    slots.forEach((s, i) => {
      const diff = Math.abs(timeToMin(s) - nowMin);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIdx = i;
      }
    });
    const key = slots[bestIdx];
    const el = slotRefs.current[key];
    if (el && containerRef.current) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    } else if (containerRef.current) {
      containerRef.current.scrollTop = Math.max(0, bestIdx * 48 - 120);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 h-[72vh] overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-sky-600"><Clock /></div>
          <div>
            <div className="text-sm font-semibold">Timeline — Aujourd'hui</div>
            <div className="text-xs text-slate-400">Vue compacte (scroll interne)</div>
          </div>
        </div>
        <div className="text-xs text-slate-400">{events.length} RDV</div>
      </div>

      <div ref={containerRef} className="overflow-auto h-[calc(100%-56px)] pr-2">
        <div className="space-y-2">
          {slots.map((t) => {
            const evs = bySlot[t] || [];
            const isNow = Math.abs(timeToMin(t) - nowMin) <= step;
            return (
              <div
                key={t}
                ref={(el) => (slotRefs.current[t] = el)}
                onClick={() => onSelectTime?.(t, evs)}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition
                  ${isNow ? "bg-sky-50 ring-1 ring-sky-100 shadow-sm" : "hover:bg-slate-50"}`}
              >
                <div className="w-14 text-xs text-slate-500">{t}</div>

                <div className="flex-1 grid grid-cols-12 gap-2">
                  <div className="col-span-12">
                    {evs.length === 0 ? (
                      <div className="text-xs text-slate-300">—</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {evs.map((ev) => (
                          <div
                            key={ev.id}
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition
                              ${ev.status === "cancelled" ? "bg-red-50 text-red-700 border border-red-100" : "bg-sky-50 text-sky-800 border border-sky-100"}
                            `}
                          >
                            <div className="truncate max-w-[160px]">{ev.patient}</div>
                            <div className="text-xs text-slate-400">{ev.duration}m</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* Panel unique qui montre détails du créneau / RDV sélectionné */
function SlotDetail({ time, eventsAtTime = [], onPostpone, onCancel }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 h-[72vh] overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold">Détails du créneau</div>
          <div className="text-xs text-slate-400">Heure sélectionnée : {time || "—"}</div>
        </div>
      </div>

      {!time && <div className="text-slate-500">Sélectionne un créneau dans la timeline à gauche.</div>}

      {time && (
        <div className="space-y-3">
          {eventsAtTime.length === 0 && (
            <div className="text-sm text-slate-500">Aucun RDV sur ce créneau.</div>
          )}

          {eventsAtTime.map((ev) => (
            <div key={ev.id} className="bg-white p-3 rounded-lg border border-slate-50 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{ev.patient}</div>
                  <div className="text-xs text-slate-400">Durée: {ev.duration} min • Statut: {ev.status}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPostpone(ev.id)}
                    className="text-xs px-3 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                  >
                    <Pause size={14} /> Reporter
                  </button>

                  <button
                    onClick={() => onCancel(ev.id)}
                    className="text-xs px-3 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition"
                  >
                    <XCircle size={14} /> Annuler
                  </button>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-500">Notes rapides (non persistées dans le mock)</div>
              <textarea className="w-full mt-2 rounded-md border px-3 py-2" rows={3} placeholder="Résumé..." />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Page principale ---------- */
export default function Home() {
  const { user } = useAuth() || { user: { name: "Dr. Exemple", doctor: { user: { full_name: "Dr Exemple" } } } };
  const { clinic } = useClinic() || {};
  const navigate = useNavigate();

  // state events (mock) — remplace par fetch API dans useEffect si besoin
  const [events, setEvents] = useState(MOCK_EVENTS);

  // selected time and its events
  const [selectedTime, setSelectedTime] = useState(null);
  const [eventsAtTime, setEventsAtTime] = useState([]);

  // KPIs
  const confirmedCount = events.filter((e) => e.status === "confirmed").length;
  const cancelledCount = events.filter((e) => e.status === "cancelled").length;

  // sélection d'un créneau depuis la timeline
  const onSelectTime = (t, evs = null) => {
    setSelectedTime(t);
    if (evs) setEventsAtTime(evs);
    else setEventsAtTime(events.filter((e) => e.time === t));
  };

  // Reporter: prompt pour minutes puis déplace le RDV (mock)
  const handlePostpone = (id) => {
    const minutesStr = window.prompt("Reporter de combien de minutes ?", "15");
    if (!minutesStr) return;
    const minutes = parseInt(minutesStr, 10);
    if (isNaN(minutes) || minutes <= 0) return toast.error("Valeur invalide");
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, time: minToTime(timeToMin(e.time) + minutes) } : e
      )
    );
    toast.success(`RDV reporté de ${minutes} minutes`);
    // recalc eventsAtTime if necessary
    setEventsAtTime((prev) => prev.filter((e) => e.id !== id));
  };

  // Annuler: confirmation puis status cancelled
  const handleCancel = (id) => {
    if (!window.confirm("Annuler ce rendez-vous ?")) return;
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "cancelled" } : e)));
    toast("Rendez-vous annulé", { icon: "⚠️" });
    setEventsAtTime((prev) => prev.filter((e) => e.id !== id));
  };

  // When events update, keep eventsAtTime consistent
  useEffect(() => {
    if (!selectedTime) return;
    const evs = events.filter((e) => e.time === selectedTime);
    setEventsAtTime(evs);
  }, [events, selectedTime]);

  /* Styles de page inspirés de ReceptionnistHome : header + tuiles + panneau unique */
  return (
    <div className="min-h-[80dvh] bg-gradient-to-b from-slate-50 to-slate-100/60 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Tableau de bord — Médecin</h1>
            <p className="text-sm text-slate-500 mt-1">Vue compacte pour la journée — timeline + RDV intégrés.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              Bonjour,&nbsp;<span className="font-medium text-slate-900">{user?.doctor?.user?.full_name || user?.name || "Médecin"}</span>
            </div>

            {/* petites actions discrètes */}
            <div className="flex items-center gap-2">
              <MiniAction title="Emploi" Icon={LayoutGrid} onClick={() => navigate("/doctor/emploi")} />
              <MiniAction title="Horaires" Icon={Clock} onClick={() => navigate("/doctor/horaires")} />
              <MiniAction title="Tarifs" Icon={DollarSign} onClick={() => navigate("/doctor/tarifs")} />
            </div>
          </div>
        </header>

        {/* Top tiles */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 border border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Aujourd'hui</div>
                <div className="text-xl font-semibold text-slate-900">Planning & rendez-vous</div>
              </div>

              <div className="flex items-center gap-3">
                <SmallStat label="RDV" value={confirmedCount} />
                <SmallStat label="Annulés" value={cancelledCount} />
              </div>
            </div>

            {/* Fusion timeline + liste : grid 2 cols inside */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                {/* timeline compact left */}
                <TimelineCompact events={events} start={8} end={18} step={30} onSelectTime={onSelectTime} />
              </div>

              <div className="lg:col-span-2 flex flex-col gap-4">
                {/* slot detail panel shows events at selected time OR today's list if none selected */}
                <div className="bg-white rounded-2xl p-4 border border-slate-50 shadow-sm h-[44vh] overflow-auto">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold">{selectedTime ? `Créneau ${selectedTime}` : "Rendez-vous — Aujourd'hui"}</div>
                      <div className="text-xs text-slate-400">{selectedTime ? "Détails du créneau sélectionné" : "Liste complète de la journée"}</div>
                    </div>
                    <div className="text-xs text-slate-400">{events.length} RDV</div>
                  </div>

                  {/* If a time is selected show its events; otherwise show day's sorted list */}
                  {selectedTime ? (
                    eventsAtTime.length ? (
                      eventsAtTime.map((ev) => (
                        <div key={ev.id} className="mb-3 p-3 rounded-lg border border-slate-100 hover:shadow-md transition flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">{ev.patient}</div>
                            <div className="text-xs text-slate-400">{ev.time} • {ev.duration} min • {ev.status}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handlePostpone(ev.id)} className="text-xs px-3 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition">Reporter</button>
                            <button onClick={() => handleCancel(ev.id)} className="text-xs px-3 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition">Annuler</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500">Aucun RDV sur ce créneau.</div>
                    )
                  ) : (
                    // day list
                    events
                      .slice()
                      .sort((a, b) => timeToMin(a.time) - timeToMin(b.time))
                      .map((ev) => (
                        <div key={ev.id} className="mb-3 p-3 rounded-lg border border-slate-100 hover:shadow-md transition flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="text-sm text-slate-600">{ev.time}</div>
                            <div className="font-semibold text-slate-900 truncate">{ev.patient}</div>
                            <div className="text-xs text-slate-400">{ev.duration} min • {ev.status}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handlePostpone(ev.id)} className="text-xs px-3 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition">Reporter</button>
                            <button onClick={() => handleCancel(ev.id)} className="text-xs px-3 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition">Annuler</button>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* quick controls footer small */}
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">Les actions ici modifient uniquement les RDV (mock). Connecte ton API pour persistance.</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedTime(null)} className="px-3 py-1 rounded-md bg-white border text-slate-700 hover:bg-slate-50 transition">Réinitialiser sélection</button>
                    <button onClick={() => navigate("/doctor/horaires")} className="px-3 py-1 rounded-md bg-sky-600 text-white hover:brightness-95 transition">Gérer horaires</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: petites infos & config */}
          <aside className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
              <div className="text-xs text-slate-400">Informations rapides</div>
              <div className="mt-2">
                <div className="text-sm font-semibold">{user?.doctor?.user?.full_name || user?.name || "Médecin"}</div>
                <div className="text-xs text-slate-400 mt-1">{clinic?.name || "Clinique"}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
              <div className="text-xs text-slate-400">Actions</div>
              <div className="mt-3 flex flex-col gap-2">
                <MiniAction title="Emploi" Icon={LayoutGrid} onClick={() => navigate("/doctor/emploi")} />
                <MiniAction title="Horaires" Icon={Clock} onClick={() => navigate("/doctor/horaires")} />
                <MiniAction title="Tarifs" Icon={DollarSign} onClick={() => navigate("/doctor/tarifs")} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
              <div className="text-xs text-slate-400">Stats du jour</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="text-xs text-slate-500">RDV</div>
                <div className="text-right font-semibold">{confirmedCount}</div>
                <div className="text-xs text-slate-500">Annulés</div>
                <div className="text-right font-semibold">{cancelledCount}</div>
              </div>
            </div>
          </aside>
        </section>

        <footer className="text-sm text-slate-500">Interface mock — je peux brancher tes endpoints pour persister les actions (PUT/POST) si tu veux.</footer>
      </div>
    </div>
  );
}
